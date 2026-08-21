import bcrypt from "bcryptjs";
import type { LoginRequest, UpdateProfileInput } from "../interfaces/authInterface.js";
import type { UserRow } from "../models/userModel.js";
import * as userRepository from "../repositories/userRepository.js";
import { generateToken } from "../utils/jwtHelper.js";
import crypto from "node:crypto";

const normalizeEmail = (email: string): string => email.trim().toLowerCase();
const DEFAULT_PASSWORD_RESET_MINUTES = 30;

// Authenticates an active staff user and returns a JWT.
export const loginUser = async (input: LoginRequest) => {
   const user = await userRepository.findUserByEmail(normalizeEmail(input.email));

   if (!user) {
      return null;
   }

   if (!user.is_active) {
      throw new Error("Your account is inactive");
   }

   const passwordMatches = await bcrypt.compare(input.password, user.password_hash);

   if (!passwordMatches) {
      return null;
   }

   const token = generateToken({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
   });

   return {
      token,
      user: {
         id: user.id,
         name: `${user.first_name} ${user.last_name}`,
         email: user.email,
         role: user.role,
      },
   };
};

// Changes a staff user password after checking the current password.
export const changeUserPassword = async (
   userId: number,
   currentPassword: string,
   newPassword: string,
): Promise<boolean> => {
   const user = await userRepository.findUserById(userId);

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

   return userRepository.updateUserPasswordHash(userId, newPasswordHash);
};

// Returns the current staff user's profile.
export const getUserProfileById = async (userId: number): Promise<UserRow | null> => {
   return userRepository.findUserProfileById(userId);
};

// Updates a staff user's profile after enforcing unique email rules.
export const updateUserProfileById = async (
   userId: number,
   input: UpdateProfileInput,
): Promise<UserRow | null> => {
   const normalizedEmail = normalizeEmail(input.email);

   if (await userRepository.userEmailExistsForAnotherUser(normalizedEmail, userId)) {
      throw new Error("An account with this email already exists.");
   }

   const updated = await userRepository.updateUserProfile(userId, {
      ...input,
      email: normalizedEmail,
   });

   return updated ? userRepository.findUserProfileById(userId) : null;
};

export const createUserPasswordResetToken = async (email: string) => {
   const user = await userRepository.findUserByEmail(normalizeEmail(email));

   if (!user || !user.is_active) 
      return null;

   const resetToken = crypto.randomBytes(32).toString("hex");
   const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
   const configured = Number(process.env.PASSWORD_RESET_EXPIRES_MINUTES ?? DEFAULT_PASSWORD_RESET_MINUTES);
   const expiresInMinutes = Number.isInteger(configured) && configured > 0 ? configured : DEFAULT_PASSWORD_RESET_MINUTES;
   await userRepository.replacePasswordResetToken(user.id, tokenHash, new Date(Date.now() + expiresInMinutes * 60_000));

   return { 
      resetToken, 
      email: user.email, 
      firstName: user.first_name, 
      expiresInMinutes 
   };
};

export const resetUserPassword = async (resetToken: string, newPassword: string): Promise<boolean> => {
   const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
   const token = await userRepository.findValidPasswordResetToken(tokenHash);
   if (!token) 
      return false;
   
   await userRepository.resetPasswordWithToken(token, await bcrypt.hash(newPassword, 12));
   return true;
};
