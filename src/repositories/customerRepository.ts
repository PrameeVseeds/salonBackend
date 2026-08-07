import type { PoolConnection, ResultSetHeader } from "mysql2/promise";
import { pool } from "../config/db.js";
import type { RegisterCustomerInput, UpdateCustomerProfileInput } from "../interfaces/customerInterface.js";
import type { CustomerRow, PasswordResetTokenRow } from "../models/customerModel.js";

const customerSelectFields =
    `id,
    first_name,
    last_name,
    phone,
    email,
    password_hash,
    profile_image,
    is_active,
    created_at,
    updated_at`;

const customerPublicSelectFields =
    `id,
    first_name,
    last_name,
    phone,
    email,
    profile_image,
    is_active,
    created_at,
    updated_at`;

export const findCustomerByEmail = async (email: string): Promise<CustomerRow | null> => {
    const [rows] = await pool.execute<CustomerRow[]>(
        `SELECT ${customerSelectFields}
         FROM customers
         WHERE email = ?
         LIMIT 1`,
        [email],
    );

    return rows[0] ?? null;
};

export const findCustomerByPhone = async (phone: string): Promise<CustomerRow | null> => {
    const [rows] = await pool.execute<CustomerRow[]>(
        `SELECT ${customerSelectFields}
         FROM customers
         WHERE phone = ?
         LIMIT 1`,
        [phone],
    );

    return rows[0] ?? null;
};

export const createCustomer = async (input: RegisterCustomerInput,passwordHash: string,): Promise<CustomerRow | null> => {
    const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO customers
             (first_name, last_name, phone, email, password_hash, is_active)
         VALUES
             (?, ?, ?, ?, ?, TRUE)`,
        [
            input.firstName.trim(),
            input.lastName.trim(),
            input.phone.trim(),
            input.email.trim().toLowerCase(),
            passwordHash,
        ],
    );

    return findCustomerById(result.insertId);
};

export const findCustomerProfileById = async (customerId: number): Promise<CustomerRow | null> => {
    const [rows] = await pool.execute<CustomerRow[]>(
        `SELECT ${customerPublicSelectFields}
         FROM customers
         WHERE id = ?
         LIMIT 1`,
        [customerId],
    );

    return rows[0] ?? null;
};

export const findCustomerById = async (customerId: number): Promise<CustomerRow | null> => {
    const [rows] = await pool.execute<CustomerRow[]>(
        `SELECT ${customerSelectFields}
         FROM customers
         WHERE id = ?
         LIMIT 1`,
        [customerId],
    );

    return rows[0] ?? null;
};

export const findAllCustomers = async (): Promise<CustomerRow[]> => {
    const [rows] = await pool.execute<CustomerRow[]>(
        `SELECT ${customerPublicSelectFields}
         FROM customers
         ORDER BY created_at DESC`,
    );

    return rows;
};

export const customerEmailExistsForAnotherCustomer = async (email: string,customerId: number,): Promise<boolean> => {
    const [rows] = await pool.execute<CustomerRow[]>(
        `SELECT id
         FROM customers
         WHERE email = ?
           AND id != ?
         LIMIT 1`,
        [email, customerId],
    );

    return rows.length > 0;
};

export const customerPhoneExistsForAnotherCustomer = async (phone: string,customerId: number,): Promise<boolean> => {
    const [rows] = await pool.execute<CustomerRow[]>(
        `SELECT id
         FROM customers
         WHERE phone = ?
           AND id != ?
         LIMIT 1`,
        [phone, customerId],
    );

    return rows.length > 0;
};

export const updateCustomerProfile = async (customerId: number,input: UpdateCustomerProfileInput,): Promise<boolean> => {
    const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE customers
         SET
             first_name = ?,
             last_name = ?,
             phone = ?,
             email = ?
         WHERE id = ?`,
        [
            input.firstName.trim(),
            input.lastName.trim(),
            input.phone.trim(),
            input.email.trim().toLowerCase(),
            customerId,
        ],
    );

    return result.affectedRows > 0;
};

export const updateCustomerStatus = async (customerId: number, isActive: boolean): Promise<boolean> => {
    const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE customers
         SET is_active = ?
         WHERE id = ?`,
        [isActive, customerId],
    );

    return result.affectedRows > 0;
};

export const updateCustomerProfileImage = async (customerId: number,profileImage: string,): Promise<boolean> => {
    const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE customers
         SET profile_image = ?
         WHERE id = ?`,
        [profileImage, customerId],
    );

    return result.affectedRows > 0;
};

export const updateCustomerPasswordHash = async (customerId: number,passwordHash: string,): Promise<boolean> => {
    const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE customers
         SET password_hash = ?
         WHERE id = ?`,
        [passwordHash, customerId],
    );

    return result.affectedRows > 0;
};

export const deleteCustomerPasswordResetTokens = async (customerId: number): Promise<void> => {
    await pool.execute(
        `DELETE FROM customer_password_reset_tokens
         WHERE customer_id = ?
            OR expires_at < NOW()
            OR used_at IS NOT NULL`,
        [customerId],
    );
};

export const createCustomerPasswordResetToken = async (customerId: number,tokenHash: string,expiresAt: Date): Promise<void> => {
    await pool.execute(
        `INSERT INTO customer_password_reset_tokens
             (customer_id, token_hash, expires_at)
         VALUES
             (?, ?, ?)`,
        [customerId, tokenHash, expiresAt],
    );
};

export const findValidCustomerPasswordResetToken = async (tokenHash: string): Promise<PasswordResetTokenRow | null> => {
    const [rows] = await pool.execute<PasswordResetTokenRow[]>(
        `SELECT id, customer_id, token_hash, expires_at, used_at
         FROM customer_password_reset_tokens
         WHERE token_hash = ?
           AND used_at IS NULL
           AND expires_at > NOW()
         LIMIT 1`,
        [tokenHash],
    );

    return rows[0] ?? null;
};

export const resetCustomerPasswordWithToken = async (tokenRecord: PasswordResetTokenRow,passwordHash: string,): Promise<void> => {
    const connection: PoolConnection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        await connection.execute(
            `UPDATE customers
             SET password_hash = ?
             WHERE id = ?`,
            [passwordHash, tokenRecord.customer_id],
        );

        await connection.execute(
            `UPDATE customer_password_reset_tokens
             SET used_at = NOW()
             WHERE id = ?`,
            [tokenRecord.id],
        );

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
