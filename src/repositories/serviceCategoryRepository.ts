import type { ResultSetHeader } from "mysql2";
import { pool } from "../config/db.js";
import type { ServiceCategoryRow } from "../models/serviceCategoryModel.js";

const fields = `sc.id, sc.name, sc.description, sc.is_active, sc.created_at, sc.updated_at,
  (SELECT COUNT(*) 
  FROM services s 
  WHERE s.category_id = sc.id) 
  AS service_count`;

export const findAll = async (): Promise<ServiceCategoryRow[]> => {
  const [rows] = await pool.execute<ServiceCategoryRow[]>(
    `SELECT ${fields} FROM service_categories sc ORDER BY sc.name`,
  );
  return rows;
};

export const findById = async (id: number): Promise<ServiceCategoryRow | null> => {
  const [rows] = await pool.execute<ServiceCategoryRow[]>(
    `SELECT ${fields} 
    FROM service_categories sc 
    WHERE sc.id = ? 
    LIMIT 1`, [id],
  );
  return rows[0] ?? null;
};

export const create = async (input: { name: string; description: string; is_active: boolean }) => {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO service_categories (name, description, is_active) 
    VALUES (?, ?, ?)`,
    [input.name, input.description, input.is_active],
  );
  return findById(result.insertId);
};

export const update = async (id: number, input: { name: string; description: string; is_active: boolean }) => {
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE service_categories 
    SET name = ?, description = ?, is_active = ? WHERE id = ?`,
    [input.name, input.description, input.is_active, id],
  );
  return result.affectedRows ? findById(id) : null;
};

export const remove = async (id: number): Promise<boolean> => {
  const [result] = await pool.execute<ResultSetHeader>(
    `DELETE FROM service_categories 
    WHERE id = ?`, [id],
  );
  return result.affectedRows > 0;
};
