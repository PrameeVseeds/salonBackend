import type { RowDataPacket } from "mysql2";

export type ReminderChannel = "email" | "whatsapp";
export type ReminderStatus = "pending" | "sent" | "failed";

export interface AppointmentReminderLogRow extends RowDataPacket {
  id: number;
  appointment_id: number;
  channel: ReminderChannel;
  scheduled_at: Date;
  sent_at: Date | null;
  status: ReminderStatus;
  provider_message_id: string | null;
  error_message: string | null;
  created_at: Date;
  updated_at: Date;
}
