import { pool } from "../config/db.js";
const employeeSelectFields = `id,first_name,last_name,phone,email,profile_image,is_active,created_at,updated_at`;
const employeePublicSelectFields = `id,first_name,last_name,phone,email,profile_image,is_active,created_at,updated_at`;
export const findEmployeeByEmail = async (email) => {
    const [rows] = await pool.execute(`SELECT ${employeeSelectFields}
        FROM employees
        WHERE email = ?
        LIMIT 1`, [email]);
    return rows[0] ?? null;
};
export const findEmployeeByPhone = async (phone) => {
    const [rows] = await pool.execute(`SELECT ${employeeSelectFields}
        FROM employees
        WHERE phone = ?
        LIMIT 1`, [phone]);
    return rows[0] ?? null;
};
export const findEmployeeByName = async (name) => {
    const normalizedName = name.trim();
    const [rows] = await pool.execute(`SELECT ${employeeSelectFields}
        FROM employees
        WHERE CONCAT(first_name, ' ', last_name) = ?
        LIMIT 1`, [normalizedName]);
    return rows[0] ?? null;
};
export const findEmployeeById = async (employeeId) => {
    const [rows] = await pool.execute(`SELECT ${employeePublicSelectFields}
        FROM employees
        WHERE id = ?
        LIMIT 1`, [employeeId]);
    return rows[0] ?? null;
};
export const findAllEmployees = async () => {
    const [rows] = await pool.execute(`SELECT ${employeePublicSelectFields}
        FROM employees
        ORDER BY created_at DESC`);
    return rows;
};
export const employeeEmailExistForAnotherEmployee = async (email, employeeId) => {
    const [rows] = await pool.execute(`SELECT id 
        FROM employees
        WHERE email = ? AND id != ?
        LIMIT 1`, [email, employeeId]);
    return rows.length > 0;
};
export const employeePhoneExistForAnotherEmployee = async (phone, employeeId) => {
    const [rows] = await pool.execute(`SELECT id 
        FROM employees
        WHERE phone = ? AND id != ?
        LIMIT 1`, [phone, employeeId]);
    return rows.length > 0;
};
export const createEmployee = async (input) => {
    const [result] = await pool.execute(`INSERT INTO employees
        (first_name, last_name, phone, email, is_active)
        VALUES
        (?,?,?,?,TRUE)`, [
        input.firstName.trim(),
        input.lastName.trim(),
        input.phone.trim(),
        input.email.trim().toLowerCase(),
    ]);
    return findEmployeeById(result.insertId);
};
export const updateEmployee = async (employeeId, input) => {
    const [result] = await pool.execute(`UPDATE employees
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
    ]);
    return result.affectedRows > 0;
};
export const updateEmployeeByStatus = async (employeeId, isActive) => {
    const [result] = await pool.execute(`UPDATE employees
        SET is_active = ?
        WHERE id = ?`, [isActive, employeeId]);
    return result.affectedRows > 0;
};
export const updateEmployeeProfileImage = async (employeeId, profileImage) => {
    const [result] = await pool.execute(`UPDATE employees
        SET profile_image = ?
        WHERE id = ?`, [profileImage, employeeId]);
    return result.affectedRows > 0;
};
export const deleteEmployee = async (employeeId) => {
    const [result] = await pool.execute(`DELETE FROM employees
        WHERE id = ?`, [employeeId]);
    return result.affectedRows > 0;
};
//# sourceMappingURL=employeeRepository.js.map