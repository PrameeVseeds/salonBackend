import type { RowDataPacket } from "mysql2";

export type NotificationType = "Email" | "SMS" | "WhatsApp";
export type NotificationStatus = "Pending" | "Sent" | "Failed";

export interface NotificationRow extends RowDataPacket {
    id: number;
    appointment_id: number;
    customer_id: number;
    notification_type: NotificationType;
    title: string;
    message: string;
    sent_status: NotificationStatus;
    sent_at: Date | null;
    created_at: Date;
    updated_at: Date;
}
