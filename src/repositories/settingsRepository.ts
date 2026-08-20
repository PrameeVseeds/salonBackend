import type { SettingsInput } from "../interfaces/settingsInterface.js";
import type { SettingsRow } from "../models/settingsModel.js";
import { pool } from "../config/db.js";

const settingsSelectFields = `id, salon_name, phone, email, address, logo_url, facebook_url, 
instagram_url, whatsapp_number, allow_customer_choose_employee, enable_online_payment, 
booking_interval_minutes, appointment_buffer_minutes, appointment_grace_period_minutes, created_at, updated_at`;

const insertSettingsFields = `id, salon_name, phone, email, address, facebook_url, instagram_url, whatsapp_number, 
allow_customer_choose_employee, enable_online_payment, booking_interval_minutes, appointment_buffer_minutes,
appointment_grace_period_minutes`;

export const getSettings = async (): Promise<SettingsRow | null> => {
  const [rows] = await pool.execute<SettingsRow[]>(
    `SELECT ${settingsSelectFields} 
    FROM settings 
    WHERE id = 1 
    LIMIT 1`,
  );
  return rows[0] ?? null;
};

export const updateSettings = async (input: SettingsInput,): Promise<SettingsRow | null> => {
  await pool.execute(
    `INSERT INTO settings (${insertSettingsFields})
        VALUES (1,?,?,?,?,?,?,?,?,?,?,?,?)
        ON DUPLICATE KEY 
        UPDATE salon_name=VALUES(salon_name), 
        phone=VALUES(phone), email=VALUES(email), 
        address=VALUES(address), facebook_url=VALUES(facebook_url), 
        instagram_url=VALUES(instagram_url), whatsapp_number=VALUES(whatsapp_number), 
        allow_customer_choose_employee=VALUES(allow_customer_choose_employee), 
        enable_online_payment=VALUES(enable_online_payment), 
        booking_interval_minutes=VALUES(booking_interval_minutes), 
        appointment_buffer_minutes=VALUES(appointment_buffer_minutes),
        appointment_grace_period_minutes=VALUES(appointment_grace_period_minutes)`,
    [
      input.salon_name,
      input.phone,
      input.email,
      input.address,
      input.facebook_url,
      input.instagram_url,
      input.whatsapp_number,
      input.allow_customer_choose_employee,
      input.enable_online_payment,
      input.booking_interval_minutes,
      input.appointment_buffer_minutes,
      input.appointment_grace_period_minutes,
    ],
  );
  return getSettings();
};
export const updateLogo = async (url: string): Promise<SettingsRow | null> => {
  await pool.execute("UPDATE settings SET logo_url = ? WHERE id = 1", [url]);
  return getSettings();
};
