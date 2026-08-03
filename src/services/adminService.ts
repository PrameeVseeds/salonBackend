import { ResultSetHeader } from "mysql2";
import { pool } from "../config/db.js";
import { AdminRow, CreateAdminRequest, UpdateAdminRequest } from "../interfaces/adminInterface.js";
import bcrypt from "bcryptjs";

export const findAdminByEmail = async (email: string): Promise<AdminRow | null> => {
    const [rows] = await pool.execute<AdminRow[]>(
        `SELECT * FROM users
        WHERE email = ? 
        LIMIT 1`, [email]
    );

    return rows[0] ?? null;
};

export const createAdmin = async (input: CreateAdminRequest): Promise<AdminRow | null> => {
    const normalizedEmail = input.email.trim().toLowerCase();
    const existingAdmin = await findAdminByEmail(normalizedEmail);

    if (existingAdmin)
        throw new Error("Admin with this email already exists");

    const passwordHash = await bcrypt.hash(input.password, 12);

    const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO users
        (first_name, last_name, email, password_hash, role, is_active)
        VALUES
        (?,?,?,?,'admin',TRUE)`,
        [
            input.first_name.trim(),
            input.last_name.trim(),
            normalizedEmail,
            passwordHash,
        ]
    );

    const [rows] = await pool.execute<AdminRow[]>(
        `SELECT * FROM users
         WHERE id = ? 
         LIMIT 1`, [result.insertId]
    );

    return rows[0] ?? null;
};

export const getAllAdmins = async (): Promise<AdminRow[]> => {
    const [rows] = await pool.execute<AdminRow[]>(
        `SELECT id, first_name, last_name, email, role, is_active, created_at, updated_at
         FROM users
         WHERE role = 'admin'
         ORDER BY created_at DESC`
    );
    return rows;
};

export const findAdminById = async (id: number): Promise<AdminRow | null> => {
    const [rows] = await pool.execute<AdminRow[]>(
        `SELECT id, first_name, last_name, email, role, is_active, created_at, updated_at
         FROM users
         WHERE id = ? AND role = 'admin'
         LIMIT 1`, [id]
    );
    return rows[0] ?? null;
};

export const updateAdminById = async (adminId: number, input: UpdateAdminRequest): Promise<AdminRow | null> => {
    const normalizedEmail = input.email.trim().toLowerCase();
    const [existingRows] = await pool.execute<AdminRow[]>(
        `SELECT id FROM users
         WHERE email = ? AND id != ?
         LIMIT 1`,
        [normalizedEmail, adminId],
    );

    if (existingRows.length > 0) {
        throw new Error("An account with this email already exists");
    }

    const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE users SET
             first_name = ?,
             last_name = ?,
             email = ?,
             is_active = ?
         WHERE id = ?
           AND role = 'admin'`,
        [
            input.first_name.trim(),
            input.last_name.trim(),
            normalizedEmail,
            input.is_active,
            adminId,
        ],
    );

    if (result.affectedRows === 0) {
        return null;
    }

    return findAdminById(adminId);
};

export const updateAdminStatusById = async (adminId: number,is_active: boolean): Promise<AdminRow | null> => {
  const [result] = await pool.execute<ResultSetHeader>(
    `
      UPDATE users
      SET is_Active = ?
      WHERE id = ?
        AND role = 'admin'
    `,
    [is_active, adminId]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return findAdminById(adminId);
};

export const resetAdminPasswordById = async (adminId: number,newPassword: string): Promise<boolean> => {
  const passwordHash = await bcrypt.hash(newPassword, 12);

  const [result] = await pool.execute<ResultSetHeader>(
    `
      UPDATE users
      SET password_hash = ?
      WHERE id = ?
        AND role = 'admin'
    `,
    [passwordHash, adminId]
  );

  return result.affectedRows > 0;
};

export const deleteAdminById = async (adminId: number): Promise<boolean> => {
  const [result] = await pool.execute<ResultSetHeader>(
    `
      UPDATE users
      SET is_Active = FALSE
      WHERE id = ?
        AND role = 'admin'
    `,
    [adminId]
  );

  return result.affectedRows > 0;
};