import { pool } from "../config/db.js";
const fields = "id, day_of_week, opening_time, closing_time, is_closed, created_at, updated_at";
export const findById = async (id) => {
    const [rows] = await pool.execute(`SELECT ${fields} 
        FROM salon_working_hours 
        WHERE id = ? LIMIT 1`, [id]);
    return rows[0] ?? null;
};
export const findByDay = async (day) => {
    const [rows] = await pool.execute(`SELECT ${fields} 
        FROM salon_working_hours 
        WHERE day_of_week = ? LIMIT 1`, [day]);
    return rows[0] ?? null;
};
export const findAll = async () => {
    const [rows] = await pool.execute(`SELECT ${fields} 
        FROM salon_working_hours
         ORDER BY FIELD(day_of_week, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')`);
    return rows;
};
export const dayExistsForAnotherRecord = async (day, id) => {
    const [rows] = await pool.execute("SELECT id FROM salon_working_hours WHERE day_of_week = ? AND id != ? LIMIT 1", [day, id]);
    return rows.length > 0;
};
export const create = async (input) => {
    const [result] = await pool.execute("INSERT INTO salon_working_hours (day_of_week, opening_time, closing_time, is_closed) VALUES (?, ?, ?, ?)", [input.day_of_week, input.opening_time, input.closing_time, input.is_closed]);
    return findById(result.insertId);
};
export const update = async (id, input) => {
    const [result] = await pool.execute("UPDATE salon_working_hours SET day_of_week = ?, opening_time = ?, closing_time = ?, is_closed = ? WHERE id = ?", [input.day_of_week, input.opening_time, input.closing_time, input.is_closed, id]);
    return result.affectedRows > 0;
};
export const updateStatus = async (id, isClosed) => {
    const [result] = await pool.execute("UPDATE salon_working_hours SET is_closed = ? WHERE id = ?", [isClosed, id]);
    return result.affectedRows > 0;
};
//# sourceMappingURL=workingHoursRepository.js.map