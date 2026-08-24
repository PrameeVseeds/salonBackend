import type { PoolConnection, ResultSetHeader } from "mysql2/promise";
import { pool } from "../config/db.js";
import type { AppointmentFilters } from "../interfaces/appointmentInterface.js";
import * as appointmentsServiceInterface from "../interfaces/appointmentServiceInterface.js";
import type { AppointmentRow } from "../models/appointmentModel.js";

const fields =`id, customer_id, employee_id, service_id, appointment_date, 
start_time, end_time, total_amount, notes, status, started_at, completed_at,
cancelled_at, cancellation_reason, created_at, updated_at`;
const customerDetailFields = `a.id, a.customer_id, a.employee_id, a.service_id, a.appointment_date,
  a.start_time, a.end_time, a.total_amount, a.notes, a.status, a.started_at, a.completed_at,
  a.cancelled_at, a.cancellation_reason, a.created_at, a.updated_at,
  CASE WHEN e.id IS NULL THEN NULL ELSE CONCAT(e.first_name, ' ', e.last_name) END AS employee_name,
  s.name AS service_name, s.duration_minutes AS service_duration_minutes`;

export const findActiveService = async (
  serviceId: number,
  db: appointmentsServiceInterface.AppointmentQueryExecutor = pool,
): Promise<appointmentsServiceInterface.AppointmentServiceInfo | null> => {
  const [rows] = await db.execute<appointmentsServiceInterface.AppointmentServiceInfo[]>(
    `SELECT id, duration_minutes, price, is_active, max_concurrent_appointments
        FROM services WHERE id = ? AND is_active = TRUE 
        LIMIT 1`,
    [serviceId],
  );
  return rows[0] ?? null;
};

export const lockService = async (db: PoolConnection, serviceId: number): Promise<boolean> => {
  const [rows] = await db.execute<import("mysql2").RowDataPacket[]>(
    "SELECT id FROM services WHERE id = ? AND is_active = TRUE FOR UPDATE",
    [serviceId],
  );
  return rows.length > 0;
};

export const countActiveEmployeesForService = async (
  serviceId: number,
  db: appointmentsServiceInterface.AppointmentQueryExecutor = pool,
): Promise<number> => {
  const [rows] = await db.execute<import("mysql2").RowDataPacket[]>(
    `SELECT COUNT(*) AS count 
    FROM employee_services es
     INNER JOIN employees e ON e.id = es.employee_id
     WHERE es.service_id = ? AND e.is_active = TRUE`,
    [serviceId],
  );
  return Number(rows[0]?.count ?? 0);
};

export const findActiveEmployeeIdsForService = async (
  serviceId: number,
  db: appointmentsServiceInterface.AppointmentQueryExecutor = pool,
): Promise<number[]> => {
  const [rows] = await db.execute<import("mysql2").RowDataPacket[]>(
    `SELECT e.id 
    FROM employee_services es
     INNER JOIN employees e ON e.id = es.employee_id
     WHERE es.service_id = ? AND e.is_active = TRUE 
     ORDER BY e.id`,
    [serviceId],
  );
  return rows.map((row) => Number(row.id));
};

export const employeeOffersService = async (employeeId: number,serviceId: number,
  db: appointmentsServiceInterface.AppointmentQueryExecutor = pool,
): Promise<boolean> => {
  const [rows] = await db.execute<import("mysql2").RowDataPacket[]>(
    `SELECT es.id 
    FROM employee_services es
         INNER JOIN employees e ON e.id = es.employee_id
         WHERE es.employee_id = ? 
         AND es.service_id = ? 
         AND e.is_active = TRUE LIMIT 1`,
    [employeeId, serviceId],
  );
  return rows.length > 0;
};

export const isClosedDate = async (
  date: string,
  db: appointmentsServiceInterface.AppointmentQueryExecutor = pool,
): Promise<boolean> => {
  const [rows] = await db.execute<import("mysql2").RowDataPacket[]>(
    `SELECT id 
        FROM closed_dates 
        WHERE closed_date = ? 
        LIMIT 1`,[date],
  );
  return rows.length > 0;
};

export const findWorkingDay = async (
  day: string,
  db: appointmentsServiceInterface.AppointmentQueryExecutor = pool,
): Promise<appointmentsServiceInterface.AppointmentWorkingDay | null> => {
  const [rows] = await db.execute<appointmentsServiceInterface.AppointmentWorkingDay[]>(
    `SELECT opening_time, closing_time, is_closed 
        FROM salon_working_hours 
        WHERE day_of_week = ? 
        LIMIT 1`,
    [day],
  );
  return rows[0] ?? null;
};

export const findBusinessBreaks = async (
  date: string,
  db: appointmentsServiceInterface.AppointmentQueryExecutor = pool,
): Promise<appointmentsServiceInterface.AppointmentTimeRange[]> => {
  const [rows] = await db.execute<appointmentsServiceInterface.AppointmentTimeRange[]>(
    `SELECT start_time, end_time 
        FROM business_breaks 
        WHERE break_date = ?`,[date],
  );
  return rows;
};

export const findApprovedEmployeeLeaves = async (
  employeeId: number,
  date: string,
  db: appointmentsServiceInterface.AppointmentQueryExecutor = pool,
): Promise<appointmentsServiceInterface.AppointmentTimeRange[]> => {
  const [rows] = await db.execute<appointmentsServiceInterface.AppointmentTimeRange[]>(
    `SELECT start_time, end_time 
        FROM employee_leaves 
        WHERE employee_id = ? 
        AND leave_date = ? 
        AND status = 'approved'`,
    [employeeId, date],
  );
  return rows;
};

export const findAppointmentTimeRanges = async (
  employeeId: number,
  date: string,
  excludeAppointmentId?: number,
  db: appointmentsServiceInterface.AppointmentQueryExecutor = pool,
): Promise<appointmentsServiceInterface.AppointmentTimeRange[]> => {
  const exclusion = excludeAppointmentId ? " AND id != ?" : "";
  const values: Array<number | string> = excludeAppointmentId
    ? [employeeId, date, excludeAppointmentId]
    : [employeeId, date];
  const [rows] = await db.execute<appointmentsServiceInterface.AppointmentTimeRange[]>(
    `SELECT start_time, end_time 
        FROM appointments
         WHERE employee_id = ? AND appointment_date = ?
           AND status IN ('Scheduled', 'In Progress')${exclusion}`,
    values,
  );
  return rows;
};

export const findServiceAppointmentTimeRanges = async (
  serviceId: number,
  date: string,
  excludeAppointmentId?: number,
  db: appointmentsServiceInterface.AppointmentQueryExecutor = pool,
): Promise<appointmentsServiceInterface.AppointmentTimeRange[]> => {
  const exclusion = excludeAppointmentId ? " AND id != ?" : "";
  const values: Array<number | string> = excludeAppointmentId
    ? [serviceId, date, excludeAppointmentId]
    : [serviceId, date];
  const [rows] = await db.execute<appointmentsServiceInterface.AppointmentTimeRange[]>(
    `SELECT start_time, end_time 
        FROM appointments
         WHERE service_id = ? AND appointment_date = ?
           AND status IN ('Scheduled', 'In Progress')${exclusion}`,
    values,
  );
  return rows;
};

export const findSchedulingSettings = async (
  db: appointmentsServiceInterface.AppointmentQueryExecutor = pool,
): Promise<appointmentsServiceInterface.AppointmentSchedulingSettings> => {
  const [rows] = await db.execute<
    appointmentsServiceInterface.AppointmentSchedulingSettings[]>(
    `SELECT booking_interval_minutes, appointment_buffer_minutes 
        FROM settings 
        WHERE id = 1 
        LIMIT 1`,
  );
  return (
    rows[0] ??
    ({
      booking_interval_minutes: 30,
      appointment_buffer_minutes: 0,
    } as appointmentsServiceInterface.AppointmentSchedulingSettings)
  );
};

export const findById = async (id: number): Promise<AppointmentRow | null> => {
  const [rows] = await pool.execute<AppointmentRow[]>(
    `SELECT ${customerDetailFields}
        FROM appointments a
        LEFT JOIN employees e ON e.id = a.employee_id
        INNER JOIN services s ON s.id = a.service_id
        WHERE a.id = ?
        LIMIT 1`, [id]);
  return rows[0] ?? null;
};

export const findOwnedById = async (id: number, customerId: number): Promise<AppointmentRow | null> => {
  const [rows] = await pool.execute<AppointmentRow[]>
  (
    `SELECT ${customerDetailFields}
        FROM appointments a
        LEFT JOIN employees e ON e.id = a.employee_id
        INNER JOIN services s ON s.id = a.service_id
        WHERE a.id = ? AND a.customer_id = ?
        LIMIT 1`, [id, customerId]);
  return rows[0] ?? null;
};

export const findByCustomer = async (customerId: number,): Promise<AppointmentRow[]> => {
  const [rows] = await pool.execute<AppointmentRow[]>(
    `SELECT ${customerDetailFields}
        FROM appointments a
        LEFT JOIN employees e ON e.id = a.employee_id
        INNER JOIN services s ON s.id = a.service_id
        WHERE a.customer_id = ?
        ORDER BY a.appointment_date DESC, a.start_time DESC`,
    [customerId],
  );
  return rows;
};

export const findAll = async (filters: AppointmentFilters,): Promise<AppointmentRow[]> => {
  const conditions: string[] = [];
  const values: Array<string | number> = [];
  if (filters.date) {
    conditions.push("a.appointment_date = ?");
    values.push(filters.date);
  }

  if (filters.employeeId) {
    conditions.push("a.employee_id = ?");
    values.push(filters.employeeId);
  }

  if (filters.customerId) {
    conditions.push("a.customer_id = ?");
    values.push(filters.customerId);
  }
  if (filters.status) {
    conditions.push("a.status = ?");
    values.push(filters.status);
  }
  if (filters.search) {
    conditions.push("(CONCAT(c.first_name, ' ', c.last_name) LIKE ? OR c.phone LIKE ? OR c.email LIKE ?)");
    const term = `%${filters.search}%`;
    values.push(term, term, term);
  }

  const where = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";

  const [rows] = await pool.execute<AppointmentRow[]>(
    `SELECT a.id, a.customer_id, a.employee_id, a.service_id, a.appointment_date,
            a.start_time, a.end_time, a.total_amount, a.notes, a.status, a.started_at,
            a.completed_at, a.cancelled_at, a.cancellation_reason, a.created_at, a.updated_at,
            CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
            c.phone AS customer_phone, c.email AS customer_email,
            CASE WHEN e.id IS NULL THEN NULL ELSE CONCAT(e.first_name, ' ', e.last_name) END AS employee_name,
            s.name AS service_name, s.duration_minutes AS service_duration_minutes
        FROM appointments a
        INNER JOIN customers c ON c.id = a.customer_id
        LEFT JOIN employees e ON e.id = a.employee_id
        INNER JOIN services s ON s.id = a.service_id${where}
        ORDER BY a.appointment_date DESC, a.start_time DESC`,
    values
  );
  return rows;
};

export const findForSchedule = async (employeeId: number,date: string,): Promise<AppointmentRow[]> => {
  const [rows] = await pool.execute<AppointmentRow[]>(
    `SELECT ${fields} 
        FROM appointments 
        WHERE employee_id = ? AND appointment_date = ? 
        ORDER BY start_time`,
    [employeeId, date],
  );
  return rows;
};

export const withTransaction = async <T>(work: (connection: PoolConnection) => Promise<T>,): Promise<T> => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } 
  catch (error) {
    await connection.rollback();
    throw error;
  } 
  finally {
    connection.release();
  }
};

export const lockEmployee = async (connection: PoolConnection,employeeId: number,): Promise<boolean> => {
  const [rows] = await connection.execute<import("mysql2").RowDataPacket[]>(
    `SELECT id 
        FROM employees 
        WHERE id = ? AND is_active = TRUE FOR UPDATE`,
    [employeeId],
  );
  return rows.length > 0;
};

export const lockOwnedAppointment = async (connection: PoolConnection,id: number,customerId: number,
): Promise<AppointmentRow | null> => {
  const [rows] = await connection.execute<AppointmentRow[]>(
    `SELECT ${fields} 
        FROM appointments 
        WHERE id = ? AND customer_id = ? 
        LIMIT 1 FOR UPDATE`,
    [id, customerId],
  );
  return rows[0] ?? null;
};

export const insert = async (
  connection: PoolConnection,
  values: {
    customerId: number;
    employeeId: number | null;
    serviceId: number;
    date: string;
    startTime: string;
    endTime: string;
    amount: number;
    notes: string | null;
  },
): Promise<number> => {
  const [result] = await connection.execute<ResultSetHeader>(
    `INSERT INTO appointments 
        (customer_id, employee_id, service_id, appointment_date, start_time, end_time, total_amount, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      values.customerId,
      values.employeeId,
      values.serviceId,
      values.date,
      values.startTime,
      values.endTime,
      values.amount,
      values.notes,
    ],
  );
  return result.insertId;
};

export const updateOwned = async (
  connection: PoolConnection,
  id: number,
  customerId: number,
  values: {
    employeeId: number | null;
    serviceId: number;
    date: string;
    startTime: string;
    endTime: string;
    amount: number;
    notes: string | null;
  },
): Promise<boolean> => {
  const [result] = await connection.execute<ResultSetHeader>(
    `UPDATE appointments 
        SET employee_id = ?, service_id = ?, appointment_date = ?, start_time = ?, end_time = ?, total_amount = ?, notes = ?
         WHERE id = ? AND customer_id = ?`,
    [
      values.employeeId,
      values.serviceId,
      values.date,
      values.startTime,
      values.endTime,
      values.amount,
      values.notes,
      id,
      customerId,
    ],
  );
  return result.affectedRows > 0;
};

export const removeOwned = async (id: number,customerId: number,): Promise<boolean> => {
  const [result] = await pool.execute<ResultSetHeader>(
    "DELETE FROM appointments WHERE id = ? AND customer_id = ?",
    [id, customerId],
  );
  return result.affectedRows > 0;
};

export const updateStatus = async (id: number,fromStatus: AppointmentRow["status"],
  toStatus: AppointmentRow["status"]): Promise<boolean> => {
  const timestampColumn = toStatus === "In Progress"
    ? "started_at"
    : toStatus === "Completed"
      ? "completed_at"
      : "cancelled_at";
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE appointments
        SET status = ?, ${timestampColumn} = CURRENT_TIMESTAMP
      WHERE id = ? AND status = ?`,
    [toStatus, id, fromStatus],
  );
  return result.affectedRows > 0;
};

export const startWithinScheduledWindow = async (id: number): Promise<boolean> => {
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE appointments
        SET status = 'In Progress', started_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND status = 'Scheduled'
        AND CURRENT_TIMESTAMP BETWEEN
            TIMESTAMP(appointment_date, start_time)
            AND TIMESTAMP(appointment_date, end_time)`,
    [id],
  );
  return result.affectedRows > 0;
};

export const findOverdueScheduled = async (): Promise<AppointmentRow[]> => {
  const [rows] = await pool.execute<AppointmentRow[]>(
    `SELECT ${customerDetailFields}
       FROM appointments a
       LEFT JOIN employees e ON e.id = a.employee_id
       INNER JOIN services s ON s.id = a.service_id
       INNER JOIN settings settings_row ON settings_row.id = 1
      WHERE a.status = 'Scheduled'
        AND TIMESTAMP(a.appointment_date, a.start_time)
            + INTERVAL settings_row.appointment_grace_period_minutes MINUTE <= CURRENT_TIMESTAMP`,
  );
  return rows;
};

export const findDueInProgress = async (): Promise<AppointmentRow[]> => {
  const [rows] = await pool.execute<AppointmentRow[]>(
    `SELECT ${customerDetailFields}
       FROM appointments a
       LEFT JOIN employees e ON e.id = a.employee_id
       INNER JOIN services s ON s.id = a.service_id
      WHERE a.status = 'In Progress'
        AND a.started_at + INTERVAL s.duration_minutes MINUTE <= CURRENT_TIMESTAMP`,
  );
  return rows;
};

export const cancelScheduledAsOverdue = async (id: number): Promise<boolean> => {
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE appointments
        SET status = 'Cancelled', cancelled_at = CURRENT_TIMESTAMP,
            cancellation_reason = 'Customer did not arrive within the configured grace period.'
      WHERE id = ? AND status = 'Scheduled'`,
    [id],
  );
  return result.affectedRows > 0;
};

export const cancel = async (id: number, reason: string): Promise<boolean> => {
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE appointments
        SET status = 'Cancelled', cancelled_at = CURRENT_TIMESTAMP, cancellation_reason = ?
      WHERE id = ? AND status IN ('Scheduled', 'In Progress')`,
    [reason, id],
  );
  return result.affectedRows > 0;
};

export const cancelOwned = async (id: number, customerId: number, reason: string): Promise<boolean> => {
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE appointments
        SET status = 'Cancelled', cancelled_at = CURRENT_TIMESTAMP, cancellation_reason = ?
      WHERE id = ? AND customer_id = ? AND status = 'Scheduled'`,
    [reason, id, customerId],
  );
  return result.affectedRows > 0;
};
