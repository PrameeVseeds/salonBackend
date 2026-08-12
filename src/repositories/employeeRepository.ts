import { ResultSetHeader } from "mysql2";
import { pool } from "../config/db.js";
import { RegisterEmployeeInput, UpdateEmployeeInput } from "../interfaces/employeeInterface.js";
import { EmployeeRow } from "../models/employeeModel.js";

const employeeSelectFields =
    `id,first_name,last_name,phone,email,profile_image,is_active,created_at,updated_at`;

const employeePublicSelectFields =
    `id,first_name,last_name,phone,email,profile_image,is_active,created_at,updated_at`;

export const findEmployeeByEmail = async (email: string): Promise<EmployeeRow | null> => {
    const [rows] = await pool.execute<EmployeeRow[]>(
        `SELECT ${employeeSelectFields}
        FROM employees
        WHERE email = ?
        LIMIT 1`, [email]
    );
    return rows[0] ?? null;
};

export const findEmployeeByPhone = async (phone: string): Promise<EmployeeRow | null> => {
    const [rows] = await pool.execute<EmployeeRow[]>(
        `SELECT ${employeeSelectFields}
        FROM employees
        WHERE phone = ?
        LIMIT 1`, [phone]
    );
    return rows[0] ?? null;
};

export const findEmployeeByName = async (name: string): Promise<EmployeeRow | null> => {
    const normalizedName = name.trim();
    const [rows] = await pool.execute<EmployeeRow[]>(
        `SELECT ${employeeSelectFields}
        FROM employees
        WHERE CONCAT(first_name, ' ', last_name) = ?
        LIMIT 1`, [normalizedName]
    );
    return rows[0] ?? null;
};

export const findEmployeeById = async (employeeId: number): Promise<EmployeeRow | null> => {
    const [rows] = await pool.execute<EmployeeRow[]>(
        `SELECT ${employeePublicSelectFields}
        FROM employees
        WHERE id = ?
        LIMIT 1`, [employeeId]
    );
    return rows[0] ?? null;
};

export const findAllEmployees = async (): Promise<EmployeeRow[]> => {
    const [rows] = await pool.execute<EmployeeRow[]>(
        `SELECT ${employeePublicSelectFields}
        FROM employees
        ORDER BY created_at DESC`,
    );
    return rows;
};

export const employeeEmailExistForAnotherEmployee = async (email: string, employeeId: number): Promise<boolean> => {
    const [rows] = await pool.execute<EmployeeRow[]>(
        `SELECT id 
        FROM employees
        WHERE email = ? AND id != ?
        LIMIT 1`, [email, employeeId]
    );
    return rows.length > 0;
};

export const employeePhoneExistForAnotherEmployee = async (phone: string, employeeId: number): Promise<boolean> => {
    const [rows] = await pool.execute<EmployeeRow[]>(
        `SELECT id 
        FROM employees
        WHERE phone = ? AND id != ?
        LIMIT 1`, [phone, employeeId]
    );
    return rows.length > 0;
};

export const createEmployee = async (input: RegisterEmployeeInput): Promise<EmployeeRow | null> => {
    const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO employees
        (first_name, last_name, phone, email, is_active)
        VALUES
        (?,?,?,?,TRUE)`, [
        input.firstName.trim(),
        input.lastName.trim(),
        input.phone.trim(),
        input.email.trim().toLowerCase(),
    ],
    );
    return findEmployeeById(result.insertId);
};

export const updateEmployee = async (employeeId: number, input: UpdateEmployeeInput): Promise<boolean> => {
    const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE employees
        SET
        first_name = ?,
        last_name = ?,
        phone = ?,
        email = ?
        WHERE id = ?`, [
        input.firstName.trim(),
        input.lastName.trim(),
        input.phone.trim(),
        input.email.trim().toLowerCase(),
        employeeId,
    ],
    );
    return result.affectedRows > 0;
};

export const updateEmployeeByStatus = async (employeeId: number, isActive: boolean): Promise<boolean> => {
    const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE employees
        SET is_active = ?
        WHERE id = ?`, [isActive, employeeId]
    );
    return result.affectedRows > 0;
};

export const updateEmployeeProfileImage = async (employeeId: number, profileImage: string): Promise<boolean> => {
    const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE employees
        SET profile_image = ?
        WHERE id = ?`, [profileImage, employeeId]
    );
    return result.affectedRows > 0;
};

export const deleteEmployee = async (employeeId: number): Promise<boolean> => {
    const [result] = await pool.execute<ResultSetHeader>(
        `DELETE FROM employees
        WHERE id = ?`, [employeeId]
    );
    return result.affectedRows > 0;
};
