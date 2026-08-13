import type { NotificationRow } from "../../models/notificationModel.js";
export const formatNotification = (item: NotificationRow) => ({
    id: item.id, 
    appointmentId: item.appointment_id, 
    customerId: item.customer_id,
    notificationType: item.notification_type, 
    title: item.title, 
    message: item.message,
    sentStatus: item.sent_status, 
    sentAt: item.sent_at, 
    createdAt: item.created_at, 
    updatedAt: item.updated_at,
});
