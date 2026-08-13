import type { ResultSetHeader } from "mysql2";
import { pool } from "../config/db.js";
import type { EmployeeLeaveInput, UpdateEmployeeLeaveInput } from "../interfaces/employeeLeaveInterface.js";
import type { EmployeeLeaveRow } from "../models/employeeLeavesModel.js";

const fields = "id, employee_id, leave_type, start_date, end_date, start_time, end_time, reason, status";

export const findById = async (id: number): Promise<EmployeeLeaveRow | null> => {
    const [rows] = await pool.execute<EmployeeLeaveRow[]>(
        `SELECT ${fields} 
        FROM employee_leaves 
        WHERE id = ? 
        LIMIT 1`, [id],
    );
    return rows[0] ?? null;
};

export const findAll = async (): Promise<EmployeeLeaveRow[]> => {
    const [rows] = await pool.execute<EmployeeLeaveRow[]>(
        `SELECT ${fields} 
        FROM employee_leaves 
        ORDER BY start_date DESC, start_time DESC`,
    );
    return rows;
};

export const findByEmployee = async (employeeId: number, date?: string): Promise<EmployeeLeaveRow[]> => {
    const dateCondition = date ? " AND ? BETWEEN start_date AND end_date" : "";
    const parameters: Array<number | string> = date ? [employeeId, date] : [employeeId];
    const [rows] = await pool.execute<EmployeeLeaveRow[]>(
        `SELECT ${fields} 
        FROM employee_leaves
         WHERE employee_id = ?${dateCondition}
         ORDER BY start_date DESC, start_time DESC`, parameters,
    );
    return rows;
};

export const create = async (input: EmployeeLeaveInput): Promise<EmployeeLeaveRow | null> => {
    const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO employee_leaves
         (employee_id, leave_type, start_date, end_date, start_time, end_time, reason, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [input.employee_id, input.leave_type, input.start_date, input.end_date,
            input.start_time, input.end_time, input.reason, input.status],
    );
    return findById(result.insertId);
};

export const update = async (id: number, input: UpdateEmployeeLeaveInput): Promise<boolean> => {
    const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE employee_leaves 
        SET 
        employee_id = ?, leave_type = ?, start_date = ?, end_date = ?, start_time = ?, end_time = ?, reason = ?, status = ? WHERE id = ?`,
        [input.employee_id, input.leave_type, input.start_date, input.end_date,
            input.start_time, input.end_time, input.reason, input.status, id],
    );
    return result.affectedRows > 0;
};

export const remove = async (id: number): Promise<boolean> => {
    const [result] = await pool.execute<ResultSetHeader>("DELETE FROM employee_leaves WHERE id = ?", [id]);
    return result.affectedRows > 0;
};
