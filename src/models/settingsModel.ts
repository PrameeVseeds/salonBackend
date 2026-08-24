import type { RowDataPacket } from "mysql2";

export interface SettingsRow extends RowDataPacket {
  id: number;
  salon_name: string;
  phone: string;
  email: string;
  address: string;
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
  created_at: Date;
  updated_at: Date;
}
