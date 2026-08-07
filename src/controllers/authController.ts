import type { Request, Response } from "express";
import { changeUserPassword, getUserProfileById, loginUser, updateUserProfileById } from "../services/authService.js";
import { AuthenticationRequest } from "../middleware/authMiddleware.js";
import { formatUserProfile } from "../utils/userMapper.js";
import { validateChangePassword, validateLogin, validateUpdateProfile } from "../validators/authValidator.js";

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = validateLogin(req.body);

        if (!validation.isValid) {
            res.status(400).json({
                success: false,
                message: validation.message,
            });
            return;
        }

        const result = await loginUser(validation.data);

        if (!result) {
            res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Login successful.",
            data: result,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Login failed.";

        res.status(500).json({
            success: false,
            message,
        });
    }
};

export const getProfile = async (req: AuthenticationRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "User is not authenticated.",
            });
            return;
        }

        const user = await getUserProfileById(userId);

        if (!user) {
            res.status(404).json({
                success: false,
                message: "User account not found.",
            });
            return;
        }

        if (!Boolean(user.is_active)) {
            res.status(403).json({
                success: false,
                message: "User account is inactive.",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Profile retrieved successfully.",
            data: {
                user: formatUserProfile(user),
            },
        });
    }
    catch {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve profile.",
        });
    }
};

export const updateProfile = async (req: AuthenticationRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const validation = validateUpdateProfile(req.body);

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "User is not authenticated.",
            });
            return;
        }

        if (!validation.isValid) {
            res.status(400).json({
                success: false,
                message: validation.message,
            });
            return;
        }

        const updatedUser = await updateUserProfileById(userId, validation.data);

        if (!updatedUser) {
            res.status(404).json({
                success: false,
                message: "User account not found.",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            data: {
                user: formatUserProfile(updatedUser),
            },
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update profile.";
        const statusCode = message.includes("already exists") ? 409 : 500;

        res.status(statusCode).json({
            success: false,
            message,
        });
    }
};

export const changePassword = async (req: AuthenticationRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const validation = validateChangePassword(req.body);

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "User is not authenticated.",
            });
            return;
        }

        if (!validation.isValid) {
            res.status(400).json({
                success: false,
                message: validation.message,
            });
            return;
        }

        const passwordChanged = await changeUserPassword(
            userId,
            validation.data.currentPassword,
            validation.data.newPassword,
        );

        if (!passwordChanged) {
            res.status(404).json({
                success: false,
                message: "User account not found.",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Password changed successfully.",
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to change password.";
        const statusCode = message === "Current password is incorrect." || message.includes("different") ? 400 : 500;

        res.status(statusCode).json({
            success: false,
            message,
        });
    }
};

export const getSuperAdminDashboard = (req: AuthenticationRequest, res: Response): void =>{
    res.status(200).json({
        success: true,
        message: "Welcome to the Super Admin Dashboard.",
         data: {
            user: req.user,
        },
    });
};