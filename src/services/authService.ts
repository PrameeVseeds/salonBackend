import bcrypt from "bcryptjs";
import type { ResultSetHeader } from "mysql2";
import { pool } from "../config/db.js";
import { LoginRequest, UpdateProfileInput, UserRow } from "../interfaces/authInterface.js";
import { generateToken } from "../utils/jwtHelper.js";

export const loginUser = async (input: LoginRequest) => {
   const email = input.email.trim().toLowerCase();

   const [users] = await pool.execute<UserRow[]>(
      `SELECT id,first_name,last_name,email,password_hash,role,is_active
         FROM users
         WHERE email = ?
         LIMIT 1`, [email]
   );

   const user = users[0];
   if (!user)
      return null;

   if (!user.is_active)
      throw new Error("Your account is inactive");

   const passwordMatches = await bcrypt.compare(input.password, user.password_hash);

   if (!passwordMatches)
      return null;

   const token = generateToken({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role
   });

   return {
      token,
      user: {
         id: user.id,
         name: `${user.first_name} ${user.last_name}`,
         email: user.email,
         role: user.role
      },
   };
};

export const changeUserPassword = async (userId: number, currentPassword: string, newPassword: string): Promise<boolean> => {
   const [users] = await pool.execute<UserRow[]>(
      `SELECT id, password_hash
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [userId]
   );

   const user = users[0];

   if (!user) {
      return false;
   }

   const passwordMatches = await bcrypt.compare(currentPassword, user.password_hash);

   if (!passwordMatches) {
      throw new Error("Current password is incorrect.");
   }

   const isSamePassword = await bcrypt.compare(newPassword, user.password_hash);

   if (isSamePassword) {
      throw new Error("New password must be different from the current password.");
   }

   const newPasswordHash = await bcrypt.hash(newPassword, 12);

   const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE users
       SET password_hash = ?
       WHERE id = ?`,
      [newPasswordHash, userId]
   );

   return result.affectedRows > 0;
};

export const getUserProfileById = async (userId: number): Promise<UserRow | null> => {
   const [users] = await pool.execute<UserRow[]>(
      `SELECT id, first_name, last_name, email, role, is_active, created_at, updated_at
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [userId]
   );

   return users[0] ?? null;
};

export const updateUserProfileById = async (userId: number, input: UpdateProfileInput): Promise<UserRow | null> => {
   const normalizedEmail = input.email.trim().toLowerCase();

   const [existingUsers] = await pool.execute<UserRow[]>(
      `SELECT id
       FROM users
       WHERE email = ?
         AND id != ?
       LIMIT 1`,
      [normalizedEmail, userId]
   );

   if (existingUsers.length > 0) {
      throw new Error("An account with this email already exists.");
   }

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
         normalizedEmail,
         userId,
      ]
   );

   if (result.affectedRows === 0) {
      return null;
   }

   return getUserProfileById(userId);
};
