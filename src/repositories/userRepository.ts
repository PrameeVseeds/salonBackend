import type { ResultSetHeader } from "mysql2";
import { pool } from "../config/db.js";
import type { UpdateProfileInput } from "../interfaces/authInterface.js";
import type { UserRow } from "../models/userModel.js";

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
export const findUserByEmail = async (email: string): Promise<UserRow | null> => {
    const [users] = await pool.execute<UserRow[]>(
        `SELECT ${userSelectFields}
         FROM users
         WHERE email = ?
         LIMIT 1`,
        [email],
    );

    return users[0] ?? null;
};

// Finds one user by id including password hash for password checks.
export const findUserById = async (userId: number): Promise<UserRow | null> => {
    const [users] = await pool.execute<UserRow[]>(
        `SELECT ${userSelectFields}
         FROM users
         WHERE id = ?
         LIMIT 1`,
        [userId],
    );

    return users[0] ?? null;
};

// Returns public profile fields for one user.
export const findUserProfileById = async (userId: number): Promise<UserRow | null> => {
    const [users] = await pool.execute<UserRow[]>(
        `SELECT ${userPublicSelectFields}
         FROM users
         WHERE id = ?
         LIMIT 1`,
        [userId],
    );

    return users[0] ?? null;
};

// Checks whether an email belongs to a different user.
export const userEmailExistsForAnotherUser = async (email: string, userId: number): Promise<boolean> => {
    const [users] = await pool.execute<UserRow[]>(
        `SELECT id
         FROM users
         WHERE email = ?
           AND id != ?
         LIMIT 1`,
        [email, userId],
    );

    return users.length > 0;
};

// Updates a user's profile fields.
export const updateUserProfile = async (userId: number, input: UpdateProfileInput): Promise<boolean> => {
    const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE users
         SET
             first_name = ?,
             last_name = ?,
             email = ?
         WHERE id = ?`,
        [
            input.firstName.trim(),
            input.lastName.trim(),
            input.email.trim().toLowerCase(),
            userId,
        ],
    );

    return result.affectedRows > 0;
};

// Updates a user's password hash.
export const updateUserPasswordHash = async (userId: number, passwordHash: string): Promise<boolean> => {
    const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE users
         SET password_hash = ?
         WHERE id = ?`,
        [passwordHash, userId],
    );

    return result.affectedRows > 0;
};
