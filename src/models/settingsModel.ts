import type { RowDataPacket } from "mysql2";

export interface SettingsRow extends RowDataPacket {
  id: number;
  salon_name: string;
  phone: string;
  email: string;
  address: string;
  map_url: string | null;
  logo_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  whatsapp_number: string | null;
  allow_customer_choose_employee: boolean;
  enable_online_payment: boolean;
  booking_interval_minutes: number;
  appointment_buffer_minutes: number;
  appointment_grace_period_minutes: number;
  appointment_reminder_minutes: number;
  enable_whatsapp_appointment_reminders: boolean;
  restrict_customer_booking_hours: boolean;
  customer_booking_restricted_start_time: string;
  customer_booking_restricted_end_time: string;
  created_at: Date;
  updated_at: Date;
}
