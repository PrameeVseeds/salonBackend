import type { NotificationFilters } from "../interfaces/notificationInterface.js";
import type { AppointmentRow } from "../models/appointmentModel.js";
import type { NotificationRow } from "../models/notificationModel.js";
import * as repository from "../repositories/notificationRepository.js";
import { sendEmail } from "./emailService.js";

export const deliverNotification = async (notification: NotificationRow): Promise<NotificationRow> => {
    try {
        if (notification.notification_type !== "Email")
            throw new Error(`${notification.notification_type} provider is not configured.`);

        const email = await repository.getCustomerEmail(notification.customer_id);

        if (!email)
            throw new Error("Customer email not found.");

        await sendEmail(email, notification.title, notification.message);
        await repository.updateDeliveryStatus(notification.id, "Sent");

    } catch {
        await repository.updateDeliveryStatus(notification.id, "Failed");
    }
    return (await repository.findById(notification.id))!;
};

export const createAppointmentConfirmation = async (appointment: AppointmentRow): Promise<void> => {
    const notification = await repository.create({
        appointmentId: appointment.id, customerId: appointment.customer_id, type: "Email",
        title: "Appointment Confirmation",
        message: `Your appointment is confirmed for ${appointment.appointment_date} from ${appointment.start_time} to ${appointment.end_time}.`,
    });
    if (notification) await deliverNotification(notification);
};

const createAppointmentStatusNotification = async (
    appointment: AppointmentRow,
    title: string,
    message: string,
): Promise<void> => {
    const notification = await repository.create({
        appointmentId: appointment.id,
        customerId: appointment.customer_id,
        type: "Email",
        title,
        message,
    });
    if (notification) await deliverNotification(notification);
};

export const createAppointmentCancellation = (appointment: AppointmentRow): Promise<void> =>
    createAppointmentStatusNotification(
        appointment,
        "Appointment Cancelled",
        `Your appointment for ${appointment.appointment_date} at ${appointment.start_time} was automatically cancelled because it was not started within the allowed grace period.`,
    );

export const createAppointmentStarted = (appointment: AppointmentRow): Promise<void> =>
    createAppointmentStatusNotification(
        appointment,
        "Appointment Started",
        `Your appointment for ${appointment.appointment_date} at ${appointment.start_time} has started.`,
    );

export const createAppointmentReminder = async (appointment: AppointmentRow): Promise<void> => {
    const message = `Reminder: appointment #${appointment.id} is scheduled for ${appointment.appointment_date} from ${appointment.start_time} to ${appointment.end_time}.`;
    const notification = await repository.create({
        appointmentId: appointment.id,
        customerId: appointment.customer_id,
        type: "Email",
        title: "Appointment Reminder",
        message,
    });
    if (!notification) return;

    await deliverNotification(notification);
    const staffRecipients = [...new Set([
        appointment.admin_email,
        appointment.employee_email,
    ].filter((email): email is string => Boolean(email)))];
    await Promise.allSettled(
        staffRecipients.map((email) => sendEmail(email, "Appointment Reminder", message)),
    );
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
