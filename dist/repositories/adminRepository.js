import { pool } from "../config/db.js";
const adminSelectFields = `
    id,
    first_name,
    last_name,
    email,
    password_hash,
    role,
    is_active,
    created_at,
    updated_at
`;
const adminPublicSelectFields = `
    id,
    first_name,
    last_name,
    email,
    role,
    is_active,
    created_at,
    updated_at
`;
// Finds one admin by email for duplicate checks.
export const findAdminByEmail = async (email) => {
    const [rows] = await pool.execute(`SELECT ${adminSelectFields}
         FROM users
         WHERE email = ?
           AND role = 'admin'
         LIMIT 1`, [email]);
    return rows[0] ?? null;
};
// Inserts a new admin user and returns the created row.
export const createAdmin = async (input, passwordHash) => {
    const [result] = await pool.execute(`INSERT INTO users
             (first_name, last_name, email, password_hash, role, is_active)
         VALUES
             (?, ?, ?, ?, 'admin', TRUE)`, [
        input.first_name.trim(),
        input.last_name.trim(),
        input.email.trim().toLowerCase(),
        passwordHash,
    ]);
    return findAdminById(result.insertId);
};
// Lists all admin users.
export const findAllAdmins = async () => {
    const [rows] = await pool.execute(`SELECT ${adminPublicSelectFields}
         FROM users
         WHERE role = 'admin'
         ORDER BY created_at DESC`);
    return rows;
};
// Finds one admin by id.
export const findAdminById = async (adminId) => {
    const [rows] = await pool.execute(`SELECT ${adminPublicSelectFields}
         FROM users
         WHERE id = ?
           AND role = 'admin'
         LIMIT 1`, [adminId]);
    return rows[0] ?? null;
};
// Checks whether an email belongs to another account.
export const adminEmailExistsForAnotherUser = async (email, adminId) => {
    const [rows] = await pool.execute(`SELECT id
         FROM users
         WHERE email = ?
           AND id != ?
         LIMIT 1`, [email, adminId]);
    return rows.length > 0;
};
// Updates admin profile and active status fields.
export const updateAdmin = async (adminId, input) => {
    const [result] = await pool.execute(`UPDATE users
         SET
             first_name = ?,
             last_name = ?,
             email = ?,
             is_active = ?
         WHERE id = ?
           AND role = 'admin'`, [
        input.first_name.trim(),
        input.last_name.trim(),
        input.email.trim().toLowerCase(),
        input.is_active,
        adminId,
    ]);
    return result.affectedRows > 0;
};
// Updates an admin active/inactive status.
export const updateAdminStatus = async (adminId, isActive) => {
    const [result] = await pool.execute(`UPDATE users
         SET is_active = ?
         WHERE id = ?
           AND role = 'admin'`, [isActive, adminId]);
    return result.affectedRows > 0;
};
// Updates an admin password hash.
export const updateAdminPasswordHash = async (adminId, passwordHash) => {
    const [result] = await pool.execute(`UPDATE users
         SET password_hash = ?
         WHERE id = ?
           AND role = 'admin'`, [passwordHash, adminId]);
    return result.affectedRows > 0;
};
// Soft-deletes an admin by marking it inactive.
export const deactivateAdmin = async (adminId) => {
    const [result] = await pool.execute(`UPDATE users
         SET is_active = FALSE
         WHERE id = ?
           AND role = 'admin'`, [adminId]);
    return result.affectedRows > 0;
};
//# sourceMappingURL=adminRepository.js.map