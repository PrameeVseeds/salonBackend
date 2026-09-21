import type { ResultSetHeader } from "mysql2";
import { pool } from "../config/db.js";
import type { AppointmentReminderLogRow, ReminderChannel } from "../models/appointmentReminderLogModel.js";

export const createPending = async (appointmentId: number, channel: ReminderChannel, scheduledAt: Date): Promise<boolean> => {
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO appointment_reminder_logs (appointment_id, channel, scheduled_at, status)
       VALUES (?, ?, ?, 'pending')`, [appointmentId, channel, scheduledAt],
    );
    return result.affectedRows === 1;
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ER_DUP_ENTRY") return false;
    throw error;
  }
};

export const markSent = async (appointmentId: number, channel: ReminderChannel, providerMessageId?: string): Promise<void> => {
  await pool.execute(`UPDATE appointment_reminder_logs
    SET status = 'sent', sent_at = CURRENT_TIMESTAMP, provider_message_id = ?, error_message = NULL
    WHERE appointment_id = ? AND channel = ?`, [providerMessageId ?? null, appointmentId, channel]);
};

export const markFailed = async (appointmentId: number, channel: ReminderChannel, errorMessage: string): Promise<void> => {
  await pool.execute(`UPDATE appointment_reminder_logs
    SET status = 'failed', error_message = ?
    WHERE appointment_id = ? AND channel = ?`, [errorMessage.slice(0, 1000), appointmentId, channel]);
};

export const findByAppointmentAndChannel = async (appointmentId: number, channel: ReminderChannel): Promise<AppointmentReminderLogRow | null> => {
  const [rows] = await pool.execute<AppointmentReminderLogRow[]>(
    `SELECT * FROM appointment_reminder_logs WHERE appointment_id = ? AND channel = ? LIMIT 1`, [appointmentId, channel],
  );
  return rows[0] ?? null;
};
