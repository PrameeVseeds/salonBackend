import { pool } from "../config/db.js";
const fields = "id, break_date, start_time, end_time, reason, created_at, updated_at";
export const findById = async (id) => {
    const [rows] = await pool.execute(`SELECT ${fields} 
        FROM business_breaks 
        WHERE id = ? 
        LIMIT 1`, [id]);
    return rows[0] ?? null;
};
export const findAll = async (date) => {
    const condition = date ? " WHERE break_date = ?" : "";
    const [rows] = await pool.execute(`SELECT ${fields} 
        FROM business_breaks${condition} 
        ORDER BY break_date ASC, start_time ASC`, date ? [date] : []);
    return rows;
};
export const create = async (input) => {
    const [result] = await pool.execute(`INSERT INTO business_breaks 
        (break_date, start_time, end_time, reason) VALUES (?, ?, ?, ?)`, [input.break_date, input.start_time, input.end_time, input.reason]);
    return findById(result.insertId);
};
export const update = async (id, input) => {
    const [result] = await pool.execute(`UPDATE business_breaks 
        SET break_date = ?, start_time = ?, end_time = ?, reason = ?
         WHERE id = ?`, [input.break_date, input.start_time, input.end_time, input.reason, id]);
    return result.affectedRows > 0;
};
export const remove = async (id) => {
    const [result] = await pool.execute("DELETE FROM business_breaks WHERE id = ?", [id]);
    return result.affectedRows > 0;
};
//# sourceMappingURL=businessBreakRepository.js.map