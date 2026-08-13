import type { ResultSetHeader } from "mysql2";
import { pool } from "../config/db.js";
import type { ClosedDateInput } from "../interfaces/closedDateInterface.js";
import type { ClosedDateRow } from "../models/closedDateModel.js";

const fields = "id, closed_date, reason, created_at, updated_at";
export const findById = async (id: number): Promise<ClosedDateRow | null> => {
    const [rows] = await pool.execute<ClosedDateRow[]>
    (
        `SELECT ${fields} 
        FROM closed_dates 
        WHERE id = ? 
        LIMIT 1`, [id]);
    return rows[0] ?? null;
};

export const findByDate = async (date: string): Promise<ClosedDateRow | null> => {
    const [rows] = await pool.execute<ClosedDateRow[]>
    (
        `SELECT ${fields} 
        FROM closed_dates 
        WHERE closed_date = ? 
        LIMIT 1`, [date]);
    return rows[0] ?? null;
};

export const findAll = async (date?: string): Promise<ClosedDateRow[]> => {
    const condition = date ? " WHERE closed_date = ?" : "";
    const [rows] = await pool.execute<ClosedDateRow[]>
    (
        `SELECT ${fields} 
        FROM closed_dates${condition} 
        ORDER BY closed_date ASC`, date ? [date] : []);
    return rows;
};

export const dateExistsForAnotherRecord = async (date: string, id: number): Promise<boolean> => {
    const [rows] = await pool.execute<ClosedDateRow[]>
    (
        `SELECT id 
        FROM closed_dates 
        WHERE closed_date = ? AND id != ? 
        LIMIT 1`, [date, id]);
    return rows.length > 0;
};

export const create = async (input: ClosedDateInput): Promise<ClosedDateRow | null> => {
    const [result] = await pool.execute<ResultSetHeader>
    (
        `INSERT INTO closed_dates (closed_date, reason) 
        VALUES (?, ?)`, [input.closed_date, input.reason]
    );
    return findById(result.insertId);
};

export const update = async (id: number, input: ClosedDateInput): Promise<boolean> => {
    const [result] = await pool.execute<ResultSetHeader>
    (
        `UPDATE closed_dates 
        SET closed_date = ?, reason = ? 
        WHERE id = ?`, [input.closed_date, input.reason, id]
    );
    return result.affectedRows > 0;
};

export const remove = async (id: number): Promise<boolean> => {
    const [result] = await pool.execute<ResultSetHeader>
    (
        `DELETE FROM closed_dates WHERE id = ?`, [id]
    );
    return result.affectedRows > 0;
};
