import { pool } from "../config/db.js";
const fields = "id, appointment_id, customer_id, notification_type, title, message, sent_status, sent_at, created_at, updated_at";
export const create = async (input) => {
    const [result] = await pool.execute(`INSERT INTO notifications 
        (appointment_id, customer_id, notification_type, title, message)
         VALUES (?, ?, ?, ?, ?)`, [input.appointmentId, input.customerId, input.type, input.title, input.message]);
    return findById(result.insertId);
};
export const findById = async (id) => {
    const [rows] = await pool.execute(`SELECT ${fields} 
        FROM notifications 
        WHERE id = ? 
        LIMIT 1`, [id]);
    return rows[0] ?? null;
};
export const findAll = async (filters) => {
    const clauses = [];
    const values = [];
    if (filters.status) {
        clauses.push("sent_status = ?");
        values.push(filters.status);
    }
    if (filters.type) {
        clauses.push("notification_type = ?");
        values.push(filters.type);
    }
    if (filters.date) {
        clauses.push("DATE(created_at) = ?");
        values.push(filters.date);
    }
    const where = clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "";
    const [rows] = await pool.execute(`SELECT ${fields} 
        FROM notifications${where} 
        ORDER BY created_at DESC`, values);
    return rows;
};
export const findByCustomer = async (customerId) => {
    const [rows] = await pool.execute(`SELECT ${fields} 
        FROM notifications 
        WHERE customer_id = ? 
        ORDER BY created_at DESC`, [customerId]);
    return rows;
};
export const findByAppointment = async (appointmentId) => {
    const [rows] = await pool.execute(`SELECT ${fields} 
        FROM notifications 
        WHERE appointment_id = ? 
        ORDER BY created_at DESC`, [appointmentId]);
    return rows;
};
export const getCustomerEmail = async (customerId) => {
    const [rows] = await pool.execute(`SELECT email 
        FROM customers 
        WHERE id = ? LIMIT 1`, [customerId]);
    return typeof rows[0]?.email === "string" ? rows[0].email : null;
};
export const updateDeliveryStatus = async (id, status) => {
    await pool.execute(`UPDATE notifications 
        SET sent_status = ?, sent_at = IF(? = 'Sent', NOW(), NULL) 
        WHERE id = ?`, [status, status, id]);
};
//# sourceMappingURL=notificationRepository.js.map