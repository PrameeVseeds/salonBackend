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
    const configuredMessage = formatAppointmentMessage(
        settings?.appointment_confirmation_message ?? defaultAppointmentConfirmationMessage,
        appointment,
    );
    const customerName = appointment.customer_name ?? "there";
    const salonName = appointment.salon_name ?? "the salon";
    const date = String(appointment.appointment_date).slice(0, 10);
    const time = String(appointment.start_time).slice(0, 5);
    const message = `Hi ${customerName}! 👋 Your appointment at ${salonName} has been successfully confirmed for ${date} at ${time}. We look forward to seeing you! Thank you for choosing us. 💙\n\nආයුබෝවන් ${customerName}! 👋 ${salonName} වෙත ඔබ වෙන්කරගත් ඒපොයින්ට්මන්ට් එක ${date} දින ${time} ට සාර්ථකව තහවුරු කර ඇත. ඔබව සාදරයෙන් බලාපොරොත්තු වෙමු! අපව තෝරාගැනීම පිළිබඳව ස්තූතියි. 💙`;
    const notification = await repository.create({
        appointmentId: appointment.id, customerId: appointment.customer_id, type: "Email",
        title: "Appointment Confirmation",
        message: configuredMessage || message,
    });
    if (notification) await deliverNotification(notification);
    await createAppointmentWhatsAppNotification(appointment, "Appointment Confirmation", notification?.message);
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
        `Hi ${appointment.customer_name ?? "there"}, your scheduled appointment time (${String(appointment.start_time).slice(0, 5)}) has now passed, so your appointment at ${appointment.salon_name ?? "the salon"} has been automatically cancelled. If you would like to book a new appointment, please visit our website. We look forward to serving you again!\n\nආයුබෝවන් ${appointment.customer_name ?? "there"}, ඔබගේ නියමිත ඒපොයින්ට්මන්ට් වේලාව (${String(appointment.start_time).slice(0, 5)}) මේ වන විට පසුවී ඇති බැවින්, ${appointment.salon_name ?? "the salon"} හි ඔබගේ ඒපොයින්ට්මන්ට් එක ස්වයංක්‍රීයව අවලංගු කර ඇත. නැවත ඒපොයින්ට්මන්ට් එකක් වෙන්කර ගැනීමට කරුණාකර අපගේ වෙබ් අඩවියට පිවිසෙන්න. ඔබට නැවතත් සේවය කිරීමට අපි බලාපොරොත්තු වෙමු!`,
    );

export const createAppointmentStarted = (appointment: AppointmentRow): Promise<void> =>
    createAppointmentStatusNotification(
        appointment,
        "Appointment Started",
        `Your appointment for ${appointment.appointment_date} at ${appointment.start_time} has started.`,
    );

export const createAppointmentReminder = async (appointment: AppointmentRow): Promise<void> => {
    if (appointment.customer_id === null) return;
    const settings = await settingsService.getSettings();
    const reminderMinutes = settings?.appointment_reminder_minutes ?? 15;
    const reminderTemplate = settings?.appointment_reminder_message ?? defaultAppointmentReminderMessage;
    const customerName = appointment.customer_name ?? "there";
    const salonName = appointment.salon_name ?? "the salon";
    const time = String(appointment.start_time).slice(0, 5);
    const message = `Hi ${customerName}! 👋 Just a friendly reminder that your appointment at ${salonName} is scheduled for ${time} today, which is in 15 minutes. We look forward to seeing you soon!\n\nආයුබෝවන් ${customerName}! 👋 මෙය ඔබගේ ඒපොයින්ට්මන්ට් එක පිළිබඳ සුහද මතක් කිරීමකි. ${salonName} හි ඔබගේ ඒපොයින්ට්මන්ට් එක අද ${time} ට, එනම් තවත් විනාඩි 15කින් යෙදී ඇත. ඔබව ඉක්මනින් හමුවීමට අපි බලාපොරොත්තු වෙමු!`;
    const notification = await repository.create({
        appointmentId: appointment.id,
        customerId: appointment.customer_id,
        type: "Email",
        title: "Appointment Reminder",
        message: reminderTemplate
            ? formatAppointmentMessage(reminderTemplate, appointment, reminderMinutes)
            : message,
    });
    if (!notification)
        return;

    const frontendUrl = process.env.FRONTEND_URL?.replace(/\/+$/, "");
    const cancellationUrl = frontendUrl ? `${frontendUrl}/appointments?cancel=${appointment.id}` : null;
    await deliverNotification(notification, cancellationUrl ? {
        text: `${formatAppointmentMessage(reminderTemplate, appointment, reminderMinutes)}\n\nNeed to cancel? Review and confirm your cancellation here: ${cancellationUrl}`,
        html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#2b2924;max-width:560px;margin:auto">
          <div style="padding:24px;border:1px solid #e5dfd4;border-radius:14px">
            <h2 style="margin:0 0 12px">Appointment reminder</h2>
            <p style="margin:0 0 18px">${formatAppointmentMessage(reminderTemplate, appointment, reminderMinutes)}</p>
            <p style="margin:0 0 10px;color:#6f675d">If you can no longer attend,
             you can review and confirm the cancellation securely in your account.</p>
            <a href="${cancellationUrl}" style="display:inline-block;padding:11px 18px;border-radius:8px;color:#fff;background:#b83249;
            text-decoration:none;font-weight:700">Cancel booking</a>
            <p style="margin:14px 0 0;color:#8a8176;font-size:12px">Signing in may be required. The appointment is not cancelled until you confirm.</p>
          </div>
        </div>`,
    } : undefined);
    const staffRecipients = [...new Set([
        appointment.admin_email,
        appointment.employee_email,
    ].filter((email): email is string => Boolean(email)))];
    await Promise.allSettled(
        staffRecipients.map((email) => sendEmail(email, "Appointment Reminder", formatAppointmentMessage(reminderTemplate, appointment, reminderMinutes))),
    );
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

    const result = await sendWhatsAppMessage(
        appointment.customer_phone,
        formatAppointmentMessage(reminderTemplate, appointment, reminderMinutes),
    );
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
        `Your appointment for ${appointment.appointment_date} at ${appointment.start_time} has been completed. Thank you for visiting us.`,
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
