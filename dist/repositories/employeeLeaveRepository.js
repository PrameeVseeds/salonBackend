import { pool } from "../config/db.js";
const fields = "id, employee_id, leave_type, leave_date, start_time, end_time, reason, status, created_at";
export const findById = async (id) => {
    const [rows] = await pool.execute(`SELECT ${fields} 
        FROM employee_leaves 
        WHERE id = ? 
        LIMIT 1`, [id]);
    return rows[0] ?? null;
};
export const findAll = async () => {
    const [rows] = await pool.execute(`SELECT ${fields} 
        FROM employee_leaves 
        ORDER BY leave_date DESC, start_time DESC`);
    return rows;
};
export const findByEmployee = async (employeeId, date) => {
    const dateCondition = date ? " AND leave_date = ?" : "";
    const parameters = date ? [employeeId, date] : [employeeId];
    const [rows] = await pool.execute(`SELECT ${fields} 
        FROM employee_leaves
         WHERE employee_id = ?${dateCondition}
         ORDER BY leave_date DESC, start_time DESC`, parameters);
    return rows;
};
export const create = async (input) => {
    const [result] = await pool.execute(`INSERT INTO employee_leaves
         (employee_id, leave_type, leave_date, start_time, end_time, reason, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`, [input.employee_id, input.leave_type, input.leave_date,
        input.start_time, input.end_time, input.reason, input.status]);
    return findById(result.insertId);
};
export const update = async (id, input) => {
    const [result] = await pool.execute(`UPDATE employee_leaves 
        SET 
        employee_id = ?, leave_type = ?, leave_date = ?, start_time = ?, end_time = ?, reason = ?, status = ? WHERE id = ?`, [input.employee_id, input.leave_type, input.leave_date,
        input.start_time, input.end_time, input.reason, input.status, id]);
    return result.affectedRows > 0;
};
export const remove = async (id) => {
    const [result] = await pool.execute("DELETE FROM employee_leaves WHERE id = ?", [id]);
    return result.affectedRows > 0;
};
//# sourceMappingURL=employeeLeaveRepository.js.map