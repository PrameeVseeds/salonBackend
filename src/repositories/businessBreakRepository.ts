import type { ResultSetHeader } from "mysql2";
import { pool } from "../config/db.js";
import type { BusinessBreakInput } from "../interfaces/businessBreakInterface.js";
import type { BusinessBreakRow } from "../models/businessBreakModel.js";

const fields = "id, break_date, start_time, end_time, reason, created_at, updated_at";

export const findById = async (id: number): Promise<BusinessBreakRow | null> => {
    const [rows] = await pool.execute<BusinessBreakRow[]>
        (
            `SELECT ${fields} 
        FROM business_breaks 
        WHERE id = ? 
        LIMIT 1`, [id]);
    return rows[0] ?? null;
};

export const findAll = async (date?: string): Promise<BusinessBreakRow[]> => {
    const condition = date ? " WHERE break_date = ?" : "";
    const [rows] = await pool.execute<BusinessBreakRow[]>(
        `SELECT ${fields} 
        FROM business_breaks${condition} 
        ORDER BY break_date ASC, start_time ASC`,
        date ? [date] : [],
    );
    return rows;
};

export const create = async (input: BusinessBreakInput): Promise<BusinessBreakRow | null> => {
    const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO business_breaks 
        (break_date, start_time, end_time, reason) VALUES (?, ?, ?, ?)`,
        [input.break_date, input.start_time, input.end_time, input.reason],
    );
    return findById(result.insertId);
};

export const update = async (id: number, input: BusinessBreakInput): Promise<boolean> => {
    const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE business_breaks 
        SET break_date = ?, start_time = ?, end_time = ?, reason = ?
         WHERE id = ?`,
        [input.break_date, input.start_time, input.end_time, input.reason, id],
    );
    return result.affectedRows > 0;
};

export const remove = async (id: number): Promise<boolean> => {
    const [result] = await pool.execute<ResultSetHeader>("DELETE FROM business_breaks WHERE id = ?", [id]);
    return result.affectedRows > 0;
};
