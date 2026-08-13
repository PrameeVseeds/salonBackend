import type { ResultSetHeader } from "mysql2";
import { pool } from "../config/db.js";
import type { EmployeeServiceRow } from "../models/employeeServiceModel.js";
import type { ServiceRow } from "../models/serviceModel.js";

const serviceSelectFields =
    "s.id, s.name, s.description, s.duration_minutes, s.price, s.image_url, s.is_active, s.created_at, s.updated_at";

export const findAssignment = async (employeeId: number,serviceId: number,): Promise<EmployeeServiceRow | null> => {
    const [rows] = await pool.execute<EmployeeServiceRow[]>(
        `SELECT id, employee_id, service_id
         FROM employee_services
         WHERE employee_id = ? AND service_id = ?
         LIMIT 1`,
        [employeeId, serviceId],
    );

    return rows[0] ?? null;
};

export const assignService = async (employeeId: number,serviceId: number,): Promise<boolean> => {
    const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO employee_services (employee_id, service_id)
         VALUES (?, ?)`,
        [employeeId, serviceId],
    );

    return result.affectedRows > 0;
};

export const findServicesByEmployeeId = async (employeeId: number): Promise<ServiceRow[]> => {
    const [rows] = await pool.execute<ServiceRow[]>(
        `SELECT ${serviceSelectFields}
         FROM services s
         INNER JOIN employee_services es ON es.service_id = s.id
         WHERE es.employee_id = ?
         ORDER BY s.name ASC`,
        [employeeId],
    );

    return rows;
};

export const removeService = async (employeeId: number,serviceId: number,): Promise<boolean> => {
    const [result] = await pool.execute<ResultSetHeader>(
        `DELETE FROM employee_services
         WHERE employee_id = ? AND service_id = ?`,
        [employeeId, serviceId],
    );

    return result.affectedRows > 0;
};
