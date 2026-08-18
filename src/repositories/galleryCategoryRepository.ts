import type { ResultSetHeader } from "mysql2";
import { pool } from "../config/db.js";
import type { GalleryCategoryRow } from "../models/galleryCategoryModel.js";

const fields = "id, name, is_active, created_at, updated_at";

export const findAll = async () => {
  const [rows] = await pool.execute<GalleryCategoryRow[]>(
    `SELECT ${fields} FROM gallery_categories ORDER BY name`,
  );
  return rows;
};

export const findById = async (id: number) => {
  const [rows] = await pool.execute<GalleryCategoryRow[]>(
    `SELECT ${fields} FROM gallery_categories WHERE id = ? LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
};

export const create = async (input: { name: string; is_active: boolean }) => {
  const [result] = await pool.execute<ResultSetHeader>(
    "INSERT INTO gallery_categories (name,is_active) VALUES (?,?)",
    [input.name, input.is_active],
  );
  return findById(result.insertId);
};

export const update = async (id: number,input: { name: string; is_active: boolean }) => {
  const [result] = await pool.execute<ResultSetHeader>(
    "UPDATE gallery_categories SET name=?,is_active=? WHERE id=?",
    [input.name, input.is_active, id],
  );
  return result.affectedRows > 0 ? findById(id) : null;
};

export const remove = async (id: number) => {
  const [result] = await pool.execute<ResultSetHeader>(
    "DELETE FROM gallery_categories WHERE id=?",
    [id],
  );
  return result.affectedRows > 0;
};
