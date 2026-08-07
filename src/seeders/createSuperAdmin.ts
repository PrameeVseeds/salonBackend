import "dotenv/config";
import bcrypt from "bcryptjs";
import type { ResultSetHeader } from "mysql2";
import { pool } from "../config/db.js";
import type { UserRow } from "../models/userModel.js";

const SUPER_ADMIN = {
  firstName: "Super",
  lastName: "Admin",
  email: "superadmin@salon.com",
  password: "Admin@123",
} as const;

// Inserts the default super admin account when it does not already exist.
const createSuperAdmin = async (): Promise<void> => {
  const normalizedEmail = SUPER_ADMIN.email.trim().toLowerCase();

  const [existingUsers] = await pool.execute<UserRow[]>(
    `SELECT id
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [normalizedEmail],
  );

  if (existingUsers.length > 0) {
    console.log("Super admin already exists.");
    return;
  }

  const passwordHash = await bcrypt.hash(SUPER_ADMIN.password, 12);

  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO users
       (first_name, last_name, email, password_hash, role, is_active)
     VALUES
       (?, ?, ?, ?, 'super_admin', TRUE)`,
    [
      SUPER_ADMIN.firstName,
      SUPER_ADMIN.lastName,
      normalizedEmail,
      passwordHash,
    ],
  );

  console.log(`Super admin created with id ${result.insertId}.`);
};

createSuperAdmin()
  .catch((error) => {
    console.error("Failed to create super admin.");
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
