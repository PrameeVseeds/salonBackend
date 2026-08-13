import type { ResultSetHeader } from "mysql2";
import { pool } from "../config/db.js";
import type { WorkingHoursInput } from "../interfaces/workingHoursInterface.js";
import type { BusinessHoursRow } from "../models/businessHoursModel.js";

const fields = "id, day_of_week, opening_time, closing_time, is_closed, created_at, updated_at";

export const findById = async (id: number): Promise<BusinessHoursRow | null> => {
    const [rows] = await pool.execute<BusinessHoursRow[]>
        (
            `SELECT ${fields} 
        FROM salon_working_hours 
        WHERE id = ? LIMIT 1`, [id]);
    return rows[0] ?? null;
};

export const findByDay = async (day: string): Promise<BusinessHoursRow | null> => {
    const [rows] = await pool.execute<BusinessHoursRow[]>
        (
            `SELECT ${fields} 
        FROM salon_working_hours 
        WHERE day_of_week = ? LIMIT 1`, [day]);
    return rows[0] ?? null;
};
export const findAll = async (): Promise<BusinessHoursRow[]> => {
    const [rows] = await pool.execute<BusinessHoursRow[]>(
        `SELECT ${fields} 
        FROM salon_working_hours
         ORDER BY FIELD(day_of_week, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')`,
    );
    return rows;
};
export const dayExistsForAnotherRecord = async (day: string, id: number): Promise<boolean> => {
    const [rows] = await pool.execute<BusinessHoursRow[]>("SELECT id FROM salon_working_hours WHERE day_of_week = ? AND id != ? LIMIT 1", [day, id]);
    return rows.length > 0;
};
export const create = async (input: WorkingHoursInput): Promise<BusinessHoursRow | null> => {
    const [result] = await pool.execute<ResultSetHeader>(
        "INSERT INTO salon_working_hours (day_of_week, opening_time, closing_time, is_closed) VALUES (?, ?, ?, ?)",
        [input.day_of_week, input.opening_time, input.closing_time, input.is_closed],
    );
    return findById(result.insertId);
};
export const update = async (id: number, input: WorkingHoursInput): Promise<boolean> => {
    const [result] = await pool.execute<ResultSetHeader>(
        "UPDATE salon_working_hours SET day_of_week = ?, opening_time = ?, closing_time = ?, is_closed = ? WHERE id = ?",
        [input.day_of_week, input.opening_time, input.closing_time, input.is_closed, id],
    );
    return result.affectedRows > 0;
};
export const updateStatus = async (id: number, isClosed: boolean): Promise<boolean> => {
    const [result] = await pool.execute<ResultSetHeader>("UPDATE salon_working_hours SET is_closed = ? WHERE id = ?", [isClosed, id]);
    return result.affectedRows > 0;
};
