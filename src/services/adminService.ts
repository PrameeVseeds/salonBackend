import bcrypt from "bcryptjs";
import type { CreateAdminRequest, UpdateAdminRequest } from "../interfaces/adminInterface.js";
import type { AdminRow } from "../models/adminModel.js";
import * as adminRepository from "../repositories/adminRepository.js";

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

// Finds an admin by email after normalizing the email.
export const findAdminByEmail = async (email: string): Promise<AdminRow | null> => {
    return adminRepository.findAdminByEmail(normalizeEmail(email));
};

// Creates an admin after enforcing unique email rules.
export const createAdmin = async (input: CreateAdminRequest): Promise<AdminRow | null> => {
    const normalizedEmail = normalizeEmail(input.email);

    if (await adminRepository.findAdminByEmail(normalizedEmail)) {
        throw new Error("Admin with this email already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    return adminRepository.createAdmin(
        {
            ...input,
            email: normalizedEmail,
        },
        passwordHash,
    );
};

// Lists all admin users.
export const getAllAdmins = async (): Promise<AdminRow[]> => {
    return adminRepository.findAllAdmins();
};

// Finds one admin by id.
export const findAdminById = async (id: number): Promise<AdminRow | null> => {
    return adminRepository.findAdminById(id);
};

// Updates an admin after enforcing unique email rules.
export const updateAdminById = async (adminId: number, input: UpdateAdminRequest): Promise<AdminRow | null> => {
    const normalizedEmail = normalizeEmail(input.email);

    if (await adminRepository.adminEmailExistsForAnotherUser(normalizedEmail, adminId)) {
        throw new Error("An account with this email already exists");
    }

    const updated = await adminRepository.updateAdmin(adminId, {
        ...input,
        email: normalizedEmail,
    });

    return updated ? adminRepository.findAdminById(adminId) : null;
};

// Activates or deactivates an admin account.
export const updateAdminStatusById = async (adminId: number, is_active: boolean): Promise<AdminRow | null> => {
    const updated = await adminRepository.updateAdminStatus(adminId, is_active);

    return updated ? adminRepository.findAdminById(adminId) : null;
};

// Resets an admin password.
export const resetAdminPasswordById = async (adminId: number, newPassword: string): Promise<boolean> => {
    const passwordHash = await bcrypt.hash(newPassword, 12);

    return adminRepository.updateAdminPasswordHash(adminId, passwordHash);
};

// Soft-deletes an admin by marking it inactive.
export const deleteAdminById = async (adminId: number): Promise<boolean> => {
    return adminRepository.deactivateAdmin(adminId);
};
