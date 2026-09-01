import * as repository from "../repositories/notificationRepository.js";
import { sendEmail } from "./emailService.js";
export const deliverNotification = async (notification, emailContent) => {
    try {
        if (notification.notification_type !== "Email")
            throw new Error(`${notification.notification_type} provider is not configured.`);
        const email = await repository.getCustomerEmail(notification.customer_id);
        if (!email)
            throw new Error("Customer email not found.");
        await sendEmail(email, notification.title, emailContent?.text ?? notification.message, emailContent?.html);
        await repository.updateDeliveryStatus(notification.id, "Sent");
    }
    catch {
        await repository.updateDeliveryStatus(notification.id, "Failed");
    }
    return (await repository.findById(notification.id));
};
export const createAppointmentConfirmation = async (appointment) => {
    const serviceSummary = appointment.services?.length
        ? ` Services: ${appointment.services.map((service) => service.serviceName).join(", ")}.`
        : "";
    const notification = await repository.create({
        appointmentId: appointment.id, customerId: appointment.customer_id, type: "Email",
        title: "Appointment Confirmation",
        message: `Your appointment is confirmed for ${appointment.appointment_date} from ${appointment.start_time} to ${appointment.end_time}.${serviceSummary}`,
    });
    if (notification)
        await deliverNotification(notification);
};
const createAppointmentStatusNotification = async (appointment, title, message) => {
    const notification = await repository.create({
        appointmentId: appointment.id,
        customerId: appointment.customer_id,
        type: "Email",
        title,
        message,
    });
    if (notification)
        await deliverNotification(notification);
};
export const createAppointmentCancellation = (appointment) => createAppointmentStatusNotification(appointment, "Appointment Cancelled", `Your appointment for ${appointment.appointment_date} at ${appointment.start_time} 
        was automatically cancelled because it was not started within the allowed grace period.`);
export const createAppointmentStarted = (appointment) => createAppointmentStatusNotification(appointment, "Appointment Started", `Your appointment for ${appointment.appointment_date} at ${appointment.start_time} has started.`);
export const createAppointmentReminder = async (appointment) => {
    const message = `Reminder: appointment #${appointment.id} is scheduled for ${appointment.appointment_date} 
    from ${appointment.start_time} to ${appointment.end_time}.`;
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
    const cancellationUrl = frontendUrl ? `${frontendUrl}/appointments?cancel=${appointment.id}` : null;
    await deliverNotification(notification, cancellationUrl ? {
        text: `${message}\n\nNeed to cancel? Review and confirm your cancellation here: ${cancellationUrl}`,
        html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#2b2924;max-width:560px;margin:auto">
          <div style="padding:24px;border:1px solid #e5dfd4;border-radius:14px">
            <h2 style="margin:0 0 12px">Appointment reminder</h2>
            <p style="margin:0 0 18px">${message}</p>
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
        ].filter((email) => Boolean(email)))];
    await Promise.allSettled(staffRecipients.map((email) => sendEmail(email, "Appointment Reminder", message)));
};
export const createAppointmentCompletion = (appointment) => createAppointmentStatusNotification(appointment, "Appointment Completed", `Your appointment for ${appointment.appointment_date} at ${appointment.start_time} has been completed. Thank you for visiting us.`);
export const getNotifications = (filters) => repository.findAll(filters);
export const getNotification = (id) => repository.findById(id);
export const getMyNotifications = (customerId) => repository.findByCustomer(customerId);
export const getAppointmentNotifications = (appointmentId) => repository.findByAppointment(appointmentId);
export const retryNotification = async (id) => {
    const notification = await repository.findById(id);
    if (!notification)
        return null;
    await repository.updateDeliveryStatus(id, "Pending");
    return deliverNotification({ ...notification, sent_status: "Pending" });
};
//# sourceMappingURL=notificationService.js.map