import type { NotificationFilters } from "../interfaces/notificationInterface.js";
import type { AppointmentRow } from "../models/appointmentModel.js";
import type { NotificationRow } from "../models/notificationModel.js";
import * as repository from "../repositories/notificationRepository.js";
import * as reminderLogRepository from "../repositories/appointmentReminderLogRepository.js";
import { sendEmail } from "./emailService.js";
import { buildAppointmentWhatsAppReminder, shouldSendWhatsAppAppointmentReminder } from "./appointmentReminderMessageService.js";
import { sendWhatsAppMessage } from "./whatsappService.js";
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

    } catch {
        await repository.updateDeliveryStatus(notification.id, "Failed");
    }
    return (await repository.findById(notification.id))!;
};

export const createAppointmentConfirmation = async (appointment: AppointmentRow): Promise<void> => {
    if (appointment.customer_id === null) return;
    const customerName = appointment.customer_name ?? "Customer";
    const salonName = appointment.salon_name ?? "A Line Salon";
    const date = formatAppointmentDate(appointment.appointment_date);
    const time = formatAppointmentTime(appointment.start_time);
    const notification = await repository.create({
        appointmentId: appointment.id, customerId: appointment.customer_id, type: "Email",
        title: "Appointment Confirmation",
        message: [
            "Hi " + customerName + "!",
            "Your appointment at " + salonName + " has been confirmed for " + date + " at " + time + ".",
            "Thank you for booking with us!",
            "",
            "ආයුබෝවන් " + customerName + "!",
            salonName + " වෙත ඔබ යොමුකළ ඒපොයින්ට්මන්ට් එක " + date + " දින " + time + " වේලාවට තහවුරු කරන ලදී.",
            "ස්තූතියි!",
        ].join("\n"),
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
        [
            "Hi " + (appointment.customer_name ?? "Customer") + "!",
            "As the scheduled time (" + formatAppointmentTime(appointment.start_time) + ") has passed, your appointment at " + (appointment.salon_name ?? "A Line Salon") + " has been automatically cancelled.",
            "Please visit our website to rebook.",
            "",
            "ආයුබෝවන් " + (appointment.customer_name ?? "Customer") + "!",
            "නියමිත වේලාව (" + formatAppointmentTime(appointment.start_time) + ") පසුවී ඇති බැවින් " + (appointment.salon_name ?? "A Line Salon") + " හි ඔබගේ ඒපොයින්ට්මන්ට් එක අවලංගු (Cancel) වී ඇත.",
            "නැවත ඒපොයින්ට්මන්ට් එකක් වෙන්කර ගැනීමට කරුණාකර අපගේ වෙබ්සයිට් එක වෙත පිවිසෙන්න.",
        ].join("\n"),
    );

export const createAppointmentStarted = (appointment: AppointmentRow): Promise<void> =>
    createAppointmentStatusNotification(
        appointment,
        "Appointment Started",
        `Your appointment for ${formatAppointmentDate(appointment.appointment_date)} at ${formatAppointmentTime(appointment.start_time)} has started.`,
    );

export const createAppointmentReminder = async (appointment: AppointmentRow): Promise<void> => {
    if (appointment.customer_id === null) return;
    const customerName = appointment.customer_name ?? "Customer";
    const salonName = appointment.salon_name ?? "A Line Salon";
    const time = formatAppointmentTime(appointment.start_time);
    const message = [
        "Hi " + customerName + "!",
        "Friendly reminder that your appointment at " + salonName + " is in 15 minutes at " + time + ". We are waiting for you!",
        "",
        "ආයුබෝවන් " + customerName + "!",
        salonName + " හි ඔබගේ ඒපොයින්ට්මන්ට් එක තව විනාඩි 15කින් (" + time + "ට) යෙදී ඇත. කරුණාකර වේලාවට පැමිණෙන්න.",
    ].join("\n");
    const notification = await repository.create({
        appointmentId: appointment.id,
        customerId: appointment.customer_id,
        type: "Email",
        title: "Appointment Reminder",
        message,
    });
    if (!notification)
        return;

    const frontendUrl = process.env.FRONTEND_URL?.replace(/\/+$/, "");
    const cancellationUrl = frontendUrl ? frontendUrl + "/appointments?cancel=" + appointment.id : null;
    await deliverNotification(notification, cancellationUrl ? {
        text: `${message}\n\nNeed to cancel? Review and confirm your cancellation here: ${cancellationUrl}`,
        html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#2b2924;max-width:560px;margin:auto">
          <div style="padding:24px;border:1px solid #e5dfd4;border-radius:14px">
            <h2 style="margin:0 0 12px">Appointment reminder</h2>
            <p style="margin:0 0 18px;white-space:pre-line">${message}</p>
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
        staffRecipients.map((email) => sendEmail(email, "Appointment Reminder", message)),
    );
    await createWhatsAppAppointmentReminder(appointment);
};

const createWhatsAppAppointmentReminder = async (appointment: AppointmentRow): Promise<void> => {
    if (!shouldSendWhatsAppAppointmentReminder(appointment)) return;
    if (!appointment.customer_phone) return;

    const claimed = await reminderLogRepository.createPending(
        appointment.id, "whatsapp", new Date(),
    );
    if (!claimed) return;

    const result = await sendWhatsAppMessage(
        appointment.customer_phone,
        buildAppointmentWhatsAppReminder(appointment, appointment.salon_name ?? "A Line Salon"),
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
