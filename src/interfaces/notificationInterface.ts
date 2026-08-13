import type { NotificationStatus, NotificationType } from "../models/notificationModel.js";

export interface NotificationFilters {
    status?: NotificationStatus;
    type?: NotificationType;
    date?: string
}

export interface CreateNotificationInput {
    appointmentId: number;
    customerId: number;
    type: NotificationType;
    title: string;
    message: string;
}
