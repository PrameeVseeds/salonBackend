import type { Request, Response } from "express";
import { createAdmin, deleteAdminById, findAdminById, getAllAdmins, resetAdminPasswordById, updateAdminById, updateAdminStatusById } from "../services/adminService.js";
import { formatAdmin } from "../utils/adminMapper.js";
import { validateAdminId, validateAdminStatus, validateCreateAdmin, validateResetAdminPassword, validateUpdateAdmin } from "../validators/adminValidator.js";

export const createAdminAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = validateCreateAdmin(req.body);

        if (!validation.isValid) {
            res.status(400).json({
                success: false,
                message: validation.message,
            });
            return;
        };

        const admin = await createAdmin(validation.data);

        res.status(201).json({
            success: true,
            message: "Admin created successfully.",
            data: admin ? formatAdmin(admin) : null,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create admin account.";
        const statusCode = message.includes("already exists") ? 409 : 500;

        res.status(statusCode).json({
            success: false,
            message,
        });
    }
};

export const getAdmins = async (req: Request, res: Response): Promise<void> => {
    try {
        const admins = await getAllAdmins();

        res.status(200).json({
            success: true,
            message: "Admins retrieved successfully.",
            data: admins.map(formatAdmin),
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve admins.",
        });
    }
};

export const getAdminById = async (req: Request, res: Response): Promise<void> => {
    try {
        const idValidation = validateAdminId(req.params.id);

        if (!idValidation.isValid) {
            res.status(400).json({
                success: false,
                message: idValidation.message,
            });
            return;
        }
        const admin = await findAdminById(idValidation.data);
        if (!admin) {
            res.status(404).json({
                success: false,
                message: "Admin not found.",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Admin retrieved successfully.",
            data: {
                admin: formatAdmin(admin),
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve admin.",
        });
    }
};

export const updateAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const idValidation = validateAdminId(req.params.id);
        const bodyValidation = validateUpdateAdmin(req.body);

        if (!idValidation.isValid) {
            res.status(400).json({
                success: false,
                message: idValidation.message,
            });
            return;
        }

        if (!bodyValidation.isValid) {
            res.status(400).json({
                success: false,
                message: bodyValidation.message,
            });
            return;
        }

        const updatedAdmin = await updateAdminById(idValidation.data, bodyValidation.data);

        if (!updatedAdmin) {
            res.status(404).json({
                success: false,
                message: "Admin not found.",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Admin updated successfully.",
            data: {
                admin: formatAdmin(updatedAdmin),
            }
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update admin.";
        const statusCode = message.includes("already exists") ? 409 : 500;

        res.status(statusCode).json({
            success: false,
            message,
        });
    }
};

export const updateAdminStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const idValidation = validateAdminId(req.params.id);
        const statusValidation = validateAdminStatus(req.body);

        if (!idValidation.isValid) {
            res.status(400).json({
                success: false,
                message: idValidation.message,
            });
            return;
        }

        if (!statusValidation.isValid) {
            res.status(400).json({
                success: false,
                message: statusValidation.message,
            });
            return;
        }

        const updatedAdmin = await updateAdminStatusById(idValidation.data, statusValidation.data);

        if (!updatedAdmin) {
            res.status(404).json({
                success: false,
                message: "Admin not found.",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: statusValidation.data ? "Admin activated successfully." : "Admin deactivated successfully.",
            data: {
                admin: formatAdmin(updatedAdmin),
            },
        });
    }
    catch {
        res.status(500).json({
            success: false,
            message: "Failed to update admin status.",
        });
    }
};

export const resetAdminPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const idValidation = validateAdminId(req.params.id);
        const passwordValidation = validateResetAdminPassword(req.body);

        if (!idValidation.isValid) {
            res.status(400).json({
                success: false,
                message: idValidation.message,
            });
            return;
        }

        if (!passwordValidation.isValid) {
            res.status(400).json({
                success: false,
                message: passwordValidation.message,
            });
            return;
        }

        const passwordUpdated = await resetAdminPasswordById(idValidation.data, passwordValidation.data.newPassword);

        if (!passwordUpdated) {
            res.status(404).json({
                success: false,
                message: "Admin not found.",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Admin password reset successfully.",
        });
    }
    catch {
        res.status(500).json({
            success: false,
            message: "Failed to reset admin password.",
        });
    }
};

export const deleteAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const idValidation = validateAdminId(req.params.id);

        if (!idValidation.isValid) {
            res.status(400).json({
                success: false,
                message: idValidation.message,
            });
            return;
        }

        const admin = await findAdminById(idValidation.data);

        if (!admin) {
            res.status(404).json({
                success: false,
                message: "Admin not found.",
            });
            return;
        }

        if (!Boolean(admin.is_active)) {
            res.status(409).json({
                success: false,
                message: "Admin account is already inactive.",
            });
            return;
        }

        const deleted = await deleteAdminById(idValidation.data);

        if (!deleted) {
            res.status(404).json({
                success: false,
                message: "Admin not found.",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Admin account deleted successfully.",
        });
    }
    catch {
        res.status(500).json({
            success: false,
            message: "Failed to delete admin account.",
        });
    }
};
