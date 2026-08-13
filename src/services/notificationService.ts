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

export const getNotifications = (filters: NotificationFilters) => repository.findAll(filters);

export const getNotification = (id: number) => repository.findById(id);

export const getMyNotifications = (customerId: number) => repository.findByCustomer(customerId);

export const getAppointmentNotifications = (appointmentId: number) => repository.findByAppointment(appointmentId);

export const retryNotification = async (id: number): Promise<NotificationRow | null> => {
    const notification = await repository.findById(id); if (!notification) return null;
    await repository.updateDeliveryStatus(id, "Pending");
    return deliverNotification({ ...notification, sent_status: "Pending" } as NotificationRow);
};
