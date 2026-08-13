import type { ResultSetHeader } from "mysql2";
import { pool } from "../config/db.js";
import type { CreateNotificationInput, NotificationFilters } from "../interfaces/notificationInterface.js";
import type { NotificationRow, NotificationStatus } from "../models/notificationModel.js";

const fields = "id, appointment_id, customer_id, notification_type, title, message, sent_status, sent_at, created_at, updated_at";

export const create = async (input: CreateNotificationInput): Promise<NotificationRow | null> => {
    const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO notifications 
        (appointment_id, customer_id, notification_type, title, message)
         VALUES (?, ?, ?, ?, ?)`,
        [input.appointmentId, input.customerId, input.type, input.title, input.message],
    );
    return findById(result.insertId);
};

export const findById = async (id: number): Promise<NotificationRow | null> => {
    const [rows] = await pool.execute<NotificationRow[]>
        (
            `SELECT ${fields} 
        FROM notifications 
        WHERE id = ? 
        LIMIT 1`, [id]);
    return rows[0] ?? null;
};

export const findAll = async (filters: NotificationFilters): Promise<NotificationRow[]> => {
    const clauses: string[] = [];
    const values: string[] = [];

    if (filters.status) {
        clauses.push("sent_status = ?"); values.push(filters.status);
    }

    if (filters.type) {
        clauses.push("notification_type = ?"); values.push(filters.type);
    }

    if (filters.date) {
        clauses.push("DATE(created_at) = ?"); values.push(filters.date);
    }

    const where = clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "";

    const [rows] = await pool.execute<NotificationRow[]>
        (
            `SELECT ${fields} 
        FROM notifications${where} 
        ORDER BY created_at DESC`, values);
    return rows;
};

export const findByCustomer = async (customerId: number): Promise<NotificationRow[]> => {
    const [rows] = await pool.execute<NotificationRow[]>
        (
            `SELECT ${fields} 
        FROM notifications 
        WHERE customer_id = ? 
        ORDER BY created_at DESC`, [customerId]);
    return rows;
};

export const findByAppointment = async (appointmentId: number): Promise<NotificationRow[]> => {
    const [rows] = await pool.execute<NotificationRow[]>(
        `SELECT ${fields} 
        FROM notifications 
        WHERE appointment_id = ? 
        ORDER BY created_at DESC`, [appointmentId]);
    return rows;
};

export const getCustomerEmail = async (customerId: number): Promise<string | null> => {
    const [rows] = await pool.execute<import("mysql2").RowDataPacket[]>
        (
            `SELECT email 
        FROM customers 
        WHERE id = ? LIMIT 1`, [customerId]);
    return typeof rows[0]?.email === "string" ? rows[0].email : null;
};

export const updateDeliveryStatus = async (id: number, status: NotificationStatus): Promise<void> => {
    await pool.execute(
        `UPDATE notifications 
        SET sent_status = ?, sent_at = IF(? = 'Sent', NOW(), NULL) 
        WHERE id = ?`,
        [status, status, id]
    );
};
