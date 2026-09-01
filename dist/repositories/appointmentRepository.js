import { pool } from "../config/db.js";
const fields = `id, customer_id, employee_id, service_id, appointment_date, 
start_time, end_time, total_amount, notes, status, started_at, completed_at,
cancelled_at, cancellation_reason, created_at, updated_at`;
const customerDetailFields = `a.id, a.customer_id, a.employee_id, a.service_id, a.appointment_date,
  a.start_time, a.end_time, a.total_amount, a.notes, a.status, a.started_at, a.completed_at,
  a.cancelled_at, a.cancellation_reason, a.created_at, a.updated_at,
  CASE WHEN e.id IS NULL THEN NULL ELSE CONCAT(e.first_name, ' ', e.last_name) END AS employee_name,
  s.name AS service_name, s.duration_minutes AS service_duration_minutes`;
export const findActiveService = async (serviceId, db = pool) => {
    const [rows] = await db.execute(`SELECT id, duration_minutes, price, is_active, max_concurrent_appointments
        FROM services WHERE id = ? AND is_active = TRUE 
        LIMIT 1`, [serviceId]);
    return rows[0] ?? null;
};
export const findActiveServices = async (serviceIds, db = pool) => {
    if (!serviceIds.length)
        return [];
    const placeholders = serviceIds.map(() => "?").join(",");
    const [rows] = await db.execute(`SELECT id, duration_minutes, price, is_active, max_concurrent_appointments
       FROM services 
       WHERE is_active = TRUE 
       AND id 
       IN (${placeholders})`, serviceIds);
    return serviceIds.map((id) => rows.find((row) => row.id === id)).filter((row) => Boolean(row));
};
export const findActiveSubServices = async (subServiceIds, db = pool) => {
    const ids = subServiceIds.filter((id) => id !== null);
    if (!ids.length)
        return subServiceIds.map(() => null);
    const placeholders = ids.map(() => "?").join(",");
    const [rows] = await db.execute(`SELECT id, service_id, duration_minutes, price, is_active FROM sub_services
     WHERE is_active = TRUE AND id IN (${placeholders})`, ids);
    return subServiceIds.map((id) => id === null ? null : rows.find((row) => row.id === id) ?? null);
};
export const lockService = async (db, serviceId) => {
    const [rows] = await db.execute("SELECT id FROM services WHERE id = ? AND is_active = TRUE FOR UPDATE", [serviceId]);
    return rows.length > 0;
};
export const countActiveEmployeesForService = async (serviceId, db = pool) => {
    const [rows] = await db.execute(`SELECT COUNT(*) AS count 
    FROM employee_services es
     INNER JOIN employees e ON e.id = es.employee_id
     WHERE es.service_id = ? AND e.is_active = TRUE`, [serviceId]);
    return Number(rows[0]?.count ?? 0);
};
export const findActiveEmployeeIdsForService = async (serviceId, db = pool) => {
    const [rows] = await db.execute(`SELECT e.id 
    FROM employee_services es
     INNER JOIN employees e ON e.id = es.employee_id
     WHERE es.service_id = ? AND e.is_active = TRUE 
     ORDER BY e.id`, [serviceId]);
    return rows.map((row) => Number(row.id));
};
export const employeeOffersService = async (employeeId, serviceId, db = pool) => {
    const [rows] = await db.execute(`SELECT es.id 
    FROM employee_services es
         INNER JOIN employees e ON e.id = es.employee_id
         WHERE es.employee_id = ? 
         AND es.service_id = ? 
         AND e.is_active = TRUE LIMIT 1`, [employeeId, serviceId]);
    return rows.length > 0;
};
export const isClosedDate = async (date, db = pool) => {
    const [rows] = await db.execute(`SELECT id 
        FROM closed_dates 
        WHERE closed_date = ? 
        LIMIT 1`, [date]);
    return rows.length > 0;
};
export const findWorkingDay = async (day, db = pool) => {
    const [rows] = await db.execute(`SELECT opening_time, closing_time, is_closed 
        FROM salon_working_hours 
        WHERE day_of_week = ? 
        LIMIT 1`, [day]);
    return rows[0] ?? null;
};
export const findBusinessBreaks = async (date, db = pool) => {
    const [rows] = await db.execute(`SELECT start_time, end_time 
        FROM business_breaks 
        WHERE break_date = ?`, [date]);
    return rows;
};
export const findApprovedEmployeeLeaves = async (employeeId, date, db = pool) => {
    const [rows] = await db.execute(`SELECT start_time, end_time 
        FROM employee_leaves 
        WHERE employee_id = ? 
        AND leave_date = ? 
        AND status = 'approved'`, [employeeId, date]);
    return rows;
};
export const findAppointmentTimeRanges = async (employeeId, date, excludeAppointmentId, db = pool) => {
    const exclusion = excludeAppointmentId ? " AND a.id != ?" : "";
    const values = excludeAppointmentId
        ? [employeeId, date, excludeAppointmentId]
        : [employeeId, date];
    const [rows] = await db.execute(`SELECT aps.start_time, aps.end_time
       FROM appointment_services aps
       INNER JOIN appointments a ON a.id = aps.appointment_id
      WHERE aps.employee_id = ? AND a.appointment_date = ?
        AND a.status IN ('Scheduled', 'In Progress')${exclusion}`, values);
    return rows;
};
export const findServiceAppointmentTimeRanges = async (serviceId, date, excludeAppointmentId, db = pool) => {
    const exclusion = excludeAppointmentId ? " AND a.id != ?" : "";
    const values = excludeAppointmentId
        ? [serviceId, date, excludeAppointmentId]
        : [serviceId, date];
    const [rows] = await db.execute(`SELECT aps.start_time, aps.end_time
       FROM appointment_services aps
       INNER JOIN appointments a ON a.id = aps.appointment_id
      WHERE aps.service_id = ? AND a.appointment_date = ?
        AND a.status IN ('Scheduled', 'In Progress')${exclusion}`, values);
    return rows;
};
export const findCustomerAppointmentTimeRanges = async (customerId, date, excludeAppointmentId, db = pool) => {
    const exclusion = excludeAppointmentId ? " AND id != ?" : "";
    const values = excludeAppointmentId
        ? [customerId, date, excludeAppointmentId]
        : [customerId, date];
    const [rows] = await db.execute(`SELECT start_time, end_time
       FROM appointments
      WHERE customer_id = ? AND appointment_date = ?
        AND status IN ('Scheduled', 'In Progress')${exclusion}`, values);
    return rows;
};
export const findSchedulingSettings = async (db = pool) => {
    const [rows] = await db.execute(`SELECT booking_interval_minutes, appointment_buffer_minutes 
        FROM settings 
        WHERE id = 1 
        LIMIT 1`);
    return (rows[0] ??
        {
            booking_interval_minutes: 30,
            appointment_buffer_minutes: 0,
        });
};
export const findById = async (id) => {
    const [rows] = await pool.execute(`SELECT ${customerDetailFields}
        FROM appointments a
        LEFT JOIN employees e ON e.id = a.employee_id
        INNER JOIN services s ON s.id = a.service_id
        WHERE a.id = ?
        LIMIT 1`, [id]);
    if (rows[0])
        rows[0].services = await findAppointmentServices(rows[0].id);
    return rows[0] ?? null;
};
export const findAppointmentServices = async (appointmentId) => {
    const [rows] = await pool.execute(`SELECT aps.service_id AS serviceId, aps.sub_service_id AS subServiceId,
            COALESCE(ss.name, s.name) AS serviceName,
            aps.employee_id AS employeeId,
            CASE WHEN e.id IS NULL THEN NULL ELSE CONCAT(e.first_name, ' ', e.last_name) END AS employeeName,
            COALESCE(ss.duration_minutes, s.duration_minutes) AS durationMinutes, aps.start_time AS startTime,
            aps.end_time AS endTime, aps.price
       FROM appointment_services aps
       INNER JOIN services s ON s.id = aps.service_id
       LEFT JOIN sub_services ss ON ss.id = aps.sub_service_id
       LEFT JOIN employees e ON e.id = aps.employee_id
      WHERE aps.appointment_id = ? ORDER BY aps.sequence_number`, [appointmentId]);
    return rows.map((row) => ({
        serviceId: Number(row.serviceId), subServiceId: row.subServiceId === null ? null : Number(row.subServiceId), serviceName: String(row.serviceName),
        employeeId: row.employeeId === null ? null : Number(row.employeeId), employeeName: row.employeeName === null ? null : String(row.employeeName),
        durationMinutes: Number(row.durationMinutes), startTime: String(row.startTime), endTime: String(row.endTime), price: Number(row.price),
    }));
};
export const attachAppointmentServices = async (appointments) => {
    await Promise.all(appointments.map(async (appointment) => { appointment.services = await findAppointmentServices(appointment.id); }));
    return appointments;
};
export const findOwnedById = async (id, customerId) => {
    const [rows] = await pool.execute(`SELECT ${customerDetailFields}
        FROM appointments a
        LEFT JOIN employees e ON e.id = a.employee_id
        INNER JOIN services s ON s.id = a.service_id
        WHERE a.id = ? AND a.customer_id = ?
        LIMIT 1`, [id, customerId]);
    return rows[0] ?? null;
};
export const findByCustomer = async (customerId) => {
    const [rows] = await pool.execute(`SELECT ${customerDetailFields}
        FROM appointments a
        LEFT JOIN employees e ON e.id = a.employee_id
        INNER JOIN services s ON s.id = a.service_id
        WHERE a.customer_id = ?
        ORDER BY a.appointment_date DESC, a.start_time DESC`, [customerId]);
    return rows;
};
export const findAll = async (filters) => {
    const conditions = [];
    const values = [];
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
    const [rows] = await pool.execute(`SELECT a.id, a.customer_id, a.employee_id, a.service_id, a.appointment_date,
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
        ORDER BY a.appointment_date DESC, a.start_time DESC`, values);
    return rows;
};
export const findTodayScheduled = async () => {
    const [rows] = await pool.execute(`SELECT a.id, a.start_time, a.end_time, a.total_amount,
            CURRENT_TIMESTAMP BETWEEN
              TIMESTAMP(a.appointment_date, a.start_time)
              AND TIMESTAMP(a.appointment_date, a.end_time) AS can_start,
            CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
            COALESCE(
              GROUP_CONCAT(aps_service.name ORDER BY aps.start_time SEPARATOR ', '),
              s.name
            ) AS service_name
       FROM appointments a
       INNER JOIN customers c ON c.id = a.customer_id
       INNER JOIN services s ON s.id = a.service_id
       LEFT JOIN appointment_services aps ON aps.appointment_id = a.id
       LEFT JOIN services aps_service ON aps_service.id = aps.service_id
      WHERE a.appointment_date = CURRENT_DATE
        AND a.status = 'Scheduled'
      GROUP BY a.id, a.appointment_date, a.start_time, a.end_time, a.total_amount,
               c.first_name, c.last_name, s.name
      ORDER BY a.start_time ASC`);
    return rows;
};
export const findForSchedule = async (employeeId, date) => {
    const [rows] = await pool.execute(`SELECT ${fields} 
        FROM appointments 
        WHERE employee_id = ? AND appointment_date = ? 
        ORDER BY start_time`, [employeeId, date]);
    return rows;
};
export const withTransaction = async (work) => {
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
export const lockEmployee = async (connection, employeeId) => {
    const [rows] = await connection.execute(`SELECT id 
        FROM employees 
        WHERE id = ? AND is_active = TRUE FOR UPDATE`, [employeeId]);
    return rows.length > 0;
};
export const lockCustomer = async (connection, customerId) => {
    const [rows] = await connection.execute("SELECT id FROM customers WHERE id = ? AND is_active = TRUE FOR UPDATE", [customerId]);
    return rows.length > 0;
};
export const lockOwnedAppointment = async (connection, id, customerId) => {
    const [rows] = await connection.execute(`SELECT ${fields} 
        FROM appointments 
        WHERE id = ? AND customer_id = ? 
        LIMIT 1 FOR UPDATE`, [id, customerId]);
    return rows[0] ?? null;
};
export const insert = async (connection, values) => {
    const [result] = await connection.execute(`INSERT INTO appointments 
        (customer_id, employee_id, service_id, appointment_date, start_time, end_time, total_amount, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
        values.customerId,
        values.employeeId,
        values.serviceId,
        values.date,
        values.startTime,
        values.endTime,
        values.amount,
        values.notes,
    ]);
    return result.insertId;
};
export const replaceAppointmentServices = async (connection, appointmentId, segments) => {
    await connection.execute("DELETE FROM appointment_services WHERE appointment_id = ?", [appointmentId]);
    for (const [index, segment] of segments.entries()) {
        await connection.execute(`INSERT INTO appointment_services
        (appointment_id, service_id, sub_service_id, employee_id, sequence_number, start_time, end_time, price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [appointmentId, segment.serviceId, segment.subServiceId, segment.employeeId, index + 1, segment.startTime, segment.endTime, segment.price]);
    }
};
export const updateOwned = async (connection, id, customerId, values) => {
    const [result] = await connection.execute(`UPDATE appointments 
        SET employee_id = ?, service_id = ?, appointment_date = ?, start_time = ?, end_time = ?, total_amount = ?, notes = ?
         WHERE id = ? AND customer_id = ?`, [
        values.employeeId,
        values.serviceId,
        values.date,
        values.startTime,
        values.endTime,
        values.amount,
        values.notes,
        id,
        customerId,
    ]);
    return result.affectedRows > 0;
};
export const removeOwned = async (id, customerId) => {
    const [result] = await pool.execute("DELETE FROM appointments WHERE id = ? AND customer_id = ?", [id, customerId]);
    return result.affectedRows > 0;
};
export const updateStatus = async (id, fromStatus, toStatus) => {
    const timestampColumn = toStatus === "In Progress"
        ? "started_at"
        : toStatus === "Completed"
            ? "completed_at"
            : "cancelled_at";
    const [result] = await pool.execute(`UPDATE appointments
        SET status = ?, ${timestampColumn} = CURRENT_TIMESTAMP
      WHERE id = ? AND status = ?`, [toStatus, id, fromStatus]);
    return result.affectedRows > 0;
};
export const assignEmployee = async (id, employeeId) => {
    return withTransaction(async (connection) => {
        const [result] = await connection.execute(`UPDATE appointments
          SET employee_id = ?
        WHERE id = ? AND status = 'Scheduled'`, [employeeId, id]);
        if (!result.affectedRows)
            return false;
        await connection.execute(`UPDATE appointment_services
          SET employee_id = ?
        WHERE appointment_id = ?`, [employeeId, id]);
        return true;
    });
};
export const assignServiceEmployee = async (appointmentId, serviceId, employeeId) => {
    const [result] = await pool.execute(`UPDATE appointment_services aps
       INNER JOIN appointments a ON a.id = aps.appointment_id
        SET aps.employee_id = ?
      WHERE aps.appointment_id = ? AND aps.service_id = ? AND a.status = 'Scheduled'`, [employeeId, appointmentId, serviceId]);
    if (!result.affectedRows)
        return false;
    await pool.execute(`UPDATE appointments a
        SET employee_id = (
          SELECT IF(COUNT(*) = COUNT(aps.employee_id) AND COUNT(DISTINCT aps.employee_id) = 1, MAX(aps.employee_id), NULL)
            FROM appointment_services aps WHERE aps.appointment_id = a.id
        ) WHERE a.id = ?`, [appointmentId]);
    return true;
};
export const startWithinScheduledWindow = async (id) => {
    const [result] = await pool.execute(`UPDATE appointments
        SET status = 'In Progress', started_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND status = 'Scheduled'
        AND CURRENT_TIMESTAMP BETWEEN
            TIMESTAMP(appointment_date, start_time)
            AND TIMESTAMP(appointment_date, end_time)`, [id]);
    return result.affectedRows > 0;
};
export const findOverdueScheduled = async () => {
    const [rows] = await pool.execute(`SELECT ${customerDetailFields}
       FROM appointments a
       LEFT JOIN employees e ON e.id = a.employee_id
       INNER JOIN services s ON s.id = a.service_id
       INNER JOIN settings settings_row ON settings_row.id = 1
      WHERE a.status = 'Scheduled'
        AND TIMESTAMP(a.appointment_date, a.start_time)
            + INTERVAL settings_row.appointment_grace_period_minutes MINUTE <= CURRENT_TIMESTAMP`);
    return rows;
};
export const findDueReminders = async () => {
    const [rows] = await pool.execute(`SELECT ${customerDetailFields}, e.email AS employee_email,
            settings_row.email AS admin_email
       FROM appointments a
       LEFT JOIN employees e ON e.id = a.employee_id
       INNER JOIN services s ON s.id = a.service_id
       INNER JOIN settings settings_row ON settings_row.id = 1
      WHERE a.status = 'Scheduled'
        AND TIMESTAMP(a.appointment_date, a.start_time) > CURRENT_TIMESTAMP
        AND TIMESTAMP(a.appointment_date, a.start_time)
            - INTERVAL settings_row.appointment_reminder_minutes MINUTE <= CURRENT_TIMESTAMP
        AND NOT EXISTS (
          SELECT 1 FROM notifications n
           WHERE n.appointment_id = a.id
             AND n.title = 'Appointment Reminder'
        )`);
    return rows;
};
export const findDueInProgress = async () => {
    const [rows] = await pool.execute(`SELECT ${customerDetailFields}
       FROM appointments a
       LEFT JOIN employees e ON e.id = a.employee_id
       INNER JOIN services s ON s.id = a.service_id
      WHERE a.status = 'In Progress'
        AND a.started_at + INTERVAL (TIMESTAMPDIFF(MINUTE, a.start_time, a.end_time)) MINUTE <= CURRENT_TIMESTAMP`);
    return rows;
};
export const cancelScheduledAsOverdue = async (id) => {
    const [result] = await pool.execute(`UPDATE appointments
        SET status = 'Cancelled', cancelled_at = CURRENT_TIMESTAMP,
            cancellation_reason = 'Customer did not arrive within the configured grace period.'
      WHERE id = ? AND status = 'Scheduled'`, [id]);
    return result.affectedRows > 0;
};
export const cancel = async (id, reason) => {
    const [result] = await pool.execute(`UPDATE appointments
        SET status = 'Cancelled', cancelled_at = CURRENT_TIMESTAMP, cancellation_reason = ?
      WHERE id = ? AND status IN ('Scheduled', 'In Progress')`, [reason, id]);
    return result.affectedRows > 0;
};
export const cancelOwned = async (id, customerId, reason) => {
    const [result] = await pool.execute(`UPDATE appointments
        SET status = 'Cancelled', cancelled_at = CURRENT_TIMESTAMP, cancellation_reason = ?
      WHERE id = ? AND customer_id = ? AND status = 'Scheduled'`, [reason, id, customerId]);
    return result.affectedRows > 0;
};
//# sourceMappingURL=appointmentRepository.js.map