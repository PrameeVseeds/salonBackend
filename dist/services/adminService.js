import bcrypt from "bcryptjs";
import * as adminRepository from "../repositories/adminRepository.js";
const normalizeEmail = (email) => email.trim().toLowerCase();
// Finds an admin by email after normalizing the email.
export const findAdminByEmail = async (email) => {
    return adminRepository.findAdminByEmail(normalizeEmail(email));
};
// Creates an admin after enforcing unique email rules.
export const createAdmin = async (input) => {
    const normalizedEmail = normalizeEmail(input.email);
    if (await adminRepository.findAdminByEmail(normalizedEmail)) {
        throw new Error("Admin with this email already exists");
    }
    const passwordHash = await bcrypt.hash(input.password, 12);
    return adminRepository.createAdmin({
        ...input,
        email: normalizedEmail,
    }, passwordHash);
};
// Lists all admin users.
export const getAllAdmins = async () => {
    return adminRepository.findAllAdmins();
};
// Finds one admin by id.
export const findAdminById = async (id) => {
    return adminRepository.findAdminById(id);
};
// Updates an admin after enforcing unique email rules.
export const updateAdminById = async (adminId, input) => {
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
export const updateAdminStatusById = async (adminId, is_active) => {
    const updated = await adminRepository.updateAdminStatus(adminId, is_active);
    return updated ? adminRepository.findAdminById(adminId) : null;
};
// Resets an admin password.
export const resetAdminPasswordById = async (adminId, newPassword) => {
    const passwordHash = await bcrypt.hash(newPassword, 12);
    return adminRepository.updateAdminPasswordHash(adminId, passwordHash);
};
// Soft-deletes an admin by marking it inactive.
export const deleteAdminById = async (adminId) => {
    return adminRepository.deactivateAdmin(adminId);
};
//# sourceMappingURL=adminService.js.map