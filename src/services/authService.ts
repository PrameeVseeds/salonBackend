import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";
import { LoginRequest, UserRow } from "../interfaces/authInterface.js";
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