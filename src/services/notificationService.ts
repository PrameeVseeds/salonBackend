import type { NotificationFilters } from "../interfaces/notificationInterface.js";
import type { AppointmentRow } from "../models/appointmentModel.js";
import type { NotificationRow } from "../models/notificationModel.js";
import * as repository from "../repositories/notificationRepository.js";
import * as reminderLogRepository from "../repositories/appointmentReminderLogRepository.js";
import { sendEmail } from "./emailService.js";
import { shouldSendWhatsAppAppointmentReminder } from "./appointmentReminderMessageService.js";
import { sendWhatsAppMessage } from "./whatsappService.js";
import * as settingsService from "./settingsService.js";
import {
    defaultAppointmentCancellationMessage,
    defaultAppointmentConfirmationMessage,
    defaultAppointmentReminderMessage,
    formatAppointmentMessage,
} from "./appointmentMessageTemplateService.js";
import { formatAppointmentDate, formatAppointmentTime } from "../utils/appointmentDateTime.js";

export const deliverNotification = async (
    notification: NotificationRow,
    emailContent?: { text?: string; html?: string },
): Promise<NotificationRow> => {
    try {
        if (notification.notification_type === "Email") {
            const email = await repository.getCustomerEmail(notification.customer_id);
            if (!email) throw new Error("Customer email not found.");
            await sendEmail(email, notification.title, emailContent?.text ?? notification.message, emailContent?.html);
        } else if (notification.notification_type === "WhatsApp") {
            const phone = await repository.getCustomerPhone(notification.customer_id);
            if (!phone) throw new Error("Customer phone number not found.");
            const result = await sendWhatsAppMessage(phone, notification.message);
            if (!result.success) throw new Error(result.message ?? "WhatsApp provider request failed.");
        } else {
            throw new Error("SMS provider is not configured.");
        }
        await repository.updateDeliveryStatus(notification.id, "Sent");

    } catch (error) {
        console.error(
            `Failed to deliver ${notification.notification_type} notification ${notification.id} (${notification.title}):`,
            error,
        );
        await repository.updateDeliveryStatus(notification.id, "Failed");
    }
    return (await repository.findById(notification.id))!;
};

export const createAppointmentConfirmation = async (appointment: AppointmentRow): Promise<void> => {
    if (appointment.customer_id === null) return;
    const settings = await settingsService.getSettings();
    const message = formatAppointmentMessage(
        settings?.appointment_confirmation_message ?? defaultAppointmentConfirmationMessage,
        appointment,
    );
    const notification = await repository.create({
        appointmentId: appointment.id,
        customerId: appointment.customer_id,
        type: "Email",
        title: "Appointment Confirmation",
        message,
    });
    if (notification) await deliverNotification(notification);
    await createAppointmentWhatsAppNotification(appointment, "Appointment Confirmation", message);
};
const createAppointmentStatusNotification = async (
    appointment: AppointmentRow,
    title: string,
    message: string,
): Promise<void> => {
    if (appointment.customer_id === null) return;
    if (title === "Appointment Cancelled") {
        const settings = await settingsService.getSettings();
        message = formatAppointmentMessage(
            settings?.appointment_cancellation_message ?? defaultAppointmentCancellationMessage,
            appointment,
        );
    }
    const notification = await repository.create({
        appointmentId: appointment.id,
        customerId: appointment.customer_id,
        type: "Email",
        title,
        message,
    });
    if (notification) await deliverNotification(notification);
    await createAppointmentWhatsAppNotification(appointment, title, message);
};

const createAppointmentWhatsAppNotification = async (
    appointment: AppointmentRow,
    title: string,
    message: string | undefined,
): Promise<void> => {
    if (!message || appointment.customer_id === null || !shouldSendWhatsAppAppointmentReminder(appointment)) return;
    const notification = await repository.create({
        appointmentId: appointment.id,
        customerId: appointment.customer_id,
        type: "WhatsApp",
        title,
        message,
    });
    if (notification) await deliverNotification(notification);
};

export const createAppointmentCancellation = (appointment: AppointmentRow): Promise<void> =>
    createAppointmentStatusNotification(
        appointment,
        "Appointment Cancelled",
        `Hi ${appointment.customer_name ?? "Customer"}! Your appointment at ${appointment.salon_name ?? "A Line Salon"} has been automatically cancelled because its scheduled time (${formatAppointmentTime(appointment.start_time)}) has passed. Please visit our website to rebook.`,
    );
export const createAppointmentStarted = (appointment: AppointmentRow): Promise<void> =>
    createAppointmentStatusNotification(
        appointment,
        "Appointment Started",
        `Your appointment for ${formatAppointmentDate(appointment.appointment_date)} at ${formatAppointmentTime(appointment.start_time)} has started.`,
    );

export const createAppointmentReminder = async (appointment: AppointmentRow): Promise<void> => {
    if (appointment.customer_id === null) return;
    const settings = await settingsService.getSettings();
    const reminderMinutes = settings?.appointment_reminder_minutes ?? 15;
    const reminderTemplate = settings?.appointment_reminder_message ?? defaultAppointmentReminderMessage;
    const message = formatAppointmentMessage(reminderTemplate, appointment, reminderMinutes);
    const notification = await repository.create({
        appointmentId: appointment.id,
        customerId: appointment.customer_id,
        type: "Email",
        title: "Appointment Reminder",
        message,
    });
    if (!notification) return;

    const frontendUrl = process.env.FRONTEND_URL?.replace(/\/+$/, "");
    const cancellationUrl = frontendUrl ? `${frontendUrl}/appointments?cancel=${appointment.id}` : null;
    await deliverNotification(notification, cancellationUrl ? {
        text: `${message}\n\nNeed to cancel? Review and confirm your cancellation here: ${cancellationUrl}`,
        html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#2b2924;max-width:560px;margin:auto"><div style="padding:24px;border:1px solid #e5dfd4;border-radius:14px"><h2>Appointment reminder</h2><p style="white-space:pre-line">${message}</p><p>If you can no longer attend, review and confirm cancellation in your account.</p><a href="${cancellationUrl}">Cancel booking</a><p>Signing in may be required. The appointment is not cancelled until you confirm.</p></div></div>`,
    } : undefined);
    const staffRecipients = [...new Set([appointment.admin_email, appointment.employee_email]
        .filter((email): email is string => Boolean(email)))];
    await Promise.allSettled(staffRecipients.map((email) => sendEmail(email, "Appointment Reminder", message)));
    await createWhatsAppAppointmentReminder(appointment, reminderTemplate, reminderMinutes);
};
const createWhatsAppAppointmentReminder = async (
    appointment: AppointmentRow,
    reminderTemplate: string,
    reminderMinutes: number,
): Promise<void> => {
    if (!shouldSendWhatsAppAppointmentReminder(appointment)) return;
    if (!appointment.customer_phone) return;

    const claimed = await reminderLogRepository.createPending(
        appointment.id, "whatsapp", new Date(),
    );
    if (!claimed) return;

    const result = await sendWhatsAppMessage(appointment.customer_phone, formatAppointmentMessage(reminderTemplate, appointment, reminderMinutes));
    if (result.success) {
        await reminderLogRepository.markSent(appointment.id, "whatsapp", result.providerMessageId);
        return;
    }
    await reminderLogRepository.markFailed(
        appointment.id, "whatsapp", result.message ?? "WhatsApp provider request failed.",
    );
    console.error(`WhatsApp reminder failed for appointment ${appointment.id}:`, result.message);
};

export const createAppointmentCompletion = (appointment: AppointmentRow): Promise<void> =>
    createAppointmentStatusNotification(
        appointment,
        "Appointment Completed",
        `Your appointment for ${formatAppointmentDate(appointment.appointment_date)} at ${formatAppointmentTime(appointment.start_time)} has been completed. Thank you for visiting us.`,
    );

export const getNotifications = (filters: NotificationFilters) => repository.findAll(filters);

export const getNotification = (id: number) => repository.findById(id);

export const getMyNotifications = (customerId: number) => repository.findByCustomer(customerId);

export const getAppointmentNotifications = (appointmentId: number) => repository.findByAppointment(appointmentId);

export const retryNotification = async (id: number): Promise<NotificationRow | null> => {
    const notification = await repository.findById(id); if (!notification) return null;
    await repository.updateDeliveryStatus(id, "Pending");
    return deliverNotification({ ...notification, sent_status: "Pending" } as NotificationRow);
};
