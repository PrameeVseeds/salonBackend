import { pool } from "../config/db.js";
const userSelectFields = `
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
const userPublicSelectFields = `
    id,
    first_name,
    last_name,
    email,
    role,
    is_active,
    created_at,
    updated_at
`;
// Finds one user by email for login and duplicate checks.
export const findUserByEmail = async (email) => {
    const [users] = await pool.execute(`SELECT ${userSelectFields}
         FROM users
         WHERE email = ?
         LIMIT 1`, [email]);
    return users[0] ?? null;
};
// Finds one user by id including password hash for password checks.
export const findUserById = async (userId) => {
    const [users] = await pool.execute(`SELECT ${userSelectFields}
         FROM users
         WHERE id = ?
         LIMIT 1`, [userId]);
    return users[0] ?? null;
};
// Returns public profile fields for one user.
export const findUserProfileById = async (userId) => {
    const [users] = await pool.execute(`SELECT ${userPublicSelectFields}
         FROM users
         WHERE id = ?
         LIMIT 1`, [userId]);
    return users[0] ?? null;
};
// Checks whether an email belongs to a different user.
export const userEmailExistsForAnotherUser = async (email, userId) => {
    const [users] = await pool.execute(`SELECT id
         FROM users
         WHERE email = ?
           AND id != ?
         LIMIT 1`, [email, userId]);
    return users.length > 0;
};
// Updates a user's profile fields.
export const updateUserProfile = async (userId, input) => {
    const [result] = await pool.execute(`UPDATE users
         SET
             first_name = ?,
             last_name = ?,
             email = ?
         WHERE id = ?`, [
        input.firstName.trim(),
        input.lastName.trim(),
        input.email.trim().toLowerCase(),
        userId,
    ]);
    return result.affectedRows > 0;
};
// Updates a user's password hash.
export const updateUserPasswordHash = async (userId, passwordHash) => {
    const [result] = await pool.execute(`UPDATE users
         SET password_hash = ?
         WHERE id = ?`, [passwordHash, userId]);
    return result.affectedRows > 0;
};
export const replacePasswordResetToken = async (userId, tokenHash, expiresAt) => {
    await pool.execute(`DELETE FROM user_password_reset_tokens 
        WHERE user_id = ? 
        OR expires_at < NOW() 
        OR used_at IS NOT NULL`, [userId]);
    await pool.execute(`INSERT INTO user_password_reset_tokens 
        (user_id, token_hash, expires_at) 
        VALUES (?, ?, ?)`, [userId, tokenHash, expiresAt]);
};
export const findValidPasswordResetToken = async (tokenHash) => {
    const [rows] = await pool.execute(`SELECT 
        id, user_id, token_hash, expires_at, used_at 
        FROM user_password_reset_tokens 
        WHERE token_hash = ? 
        AND used_at IS NULL AND expires_at > NOW() 
        LIMIT 1`, [tokenHash]);
    return rows[0] ?? null;
};
export const resetPasswordWithToken = async (token, passwordHash) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.execute(`UPDATE users 
            SET password_hash = ? 
            WHERE id = ?`, [passwordHash, token.user_id]);
        await connection.execute(`UPDATE user_password_reset_tokens 
            SET used_at = NOW() 
            WHERE id = ?`, [token.id]);
        await connection.commit();
    }
    catch (error) {
        await connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
};
//# sourceMappingURL=userRepository.js.map