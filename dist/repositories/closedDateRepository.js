import { pool } from "../config/db.js";
const fields = "id, closed_date, reason, created_at, updated_at";
export const findById = async (id) => {
    const [rows] = await pool.execute(`SELECT ${fields} 
        FROM closed_dates 
        WHERE id = ? 
        LIMIT 1`, [id]);
    return rows[0] ?? null;
};
export const findByDate = async (date) => {
    const [rows] = await pool.execute(`SELECT ${fields} 
        FROM closed_dates 
        WHERE closed_date = ? 
        LIMIT 1`, [date]);
    return rows[0] ?? null;
};
export const findAll = async (date) => {
    const condition = date ? " WHERE closed_date = ?" : "";
    const [rows] = await pool.execute(`SELECT ${fields} 
        FROM closed_dates${condition} 
        ORDER BY closed_date ASC`, date ? [date] : []);
    return rows;
};
export const dateExistsForAnotherRecord = async (date, id) => {
    const [rows] = await pool.execute(`SELECT id 
        FROM closed_dates 
        WHERE closed_date = ? AND id != ? 
        LIMIT 1`, [date, id]);
    return rows.length > 0;
};
export const create = async (input) => {
    const [result] = await pool.execute(`INSERT INTO closed_dates (closed_date, reason) 
        VALUES (?, ?)`, [input.closed_date, input.reason]);
    return findById(result.insertId);
};
export const update = async (id, input) => {
    const [result] = await pool.execute(`UPDATE closed_dates 
        SET closed_date = ?, reason = ? 
        WHERE id = ?`, [input.closed_date, input.reason, id]);
    return result.affectedRows > 0;
};
export const remove = async (id) => {
    const [result] = await pool.execute(`DELETE FROM closed_dates WHERE id = ?`, [id]);
    return result.affectedRows > 0;
};
//# sourceMappingURL=closedDateRepository.js.map