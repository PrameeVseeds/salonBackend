import type { LoginRequest, UpdateProfileInput } from "../interfaces/authInterface.js";
import { getString, type ValidationResult } from "./validationUtils.js";

interface ChangePasswordInput {
    currentPassword: string;
    newPassword: string;
}

interface ResetPasswordInput { token: string; newPassword: string; }

export const validateForgotPassword = (body: Record<string, unknown>): ValidationResult<string> => {
    const email = getString(body.email);
    return email ? { isValid: true, data: email } :
        { isValid: false, message: "Email address is required." };
};

export const validateResetPassword = (body: Record<string, unknown>): ValidationResult<ResetPasswordInput> => {
    const token = getString(body.token);
    const newPassword = getString(body.newPassword);
    const confirmPassword = getString(body.confirmPassword);

    if (!token || !newPassword || !confirmPassword)
        return {
            isValid: false,
            message: "Reset token, new password and confirmation password are required."
        };

    if (newPassword !== confirmPassword)
        return {
            isValid: false,
            message: "New passwords do not match."
        };

    if (newPassword.length < 8)
        return {
            isValid: false,
            message: "New password must contain at least 8 characters."
        };

    return { isValid: true, data: { token, newPassword } };
};

export const validateLogin = (body: Record<string, unknown>): ValidationResult<LoginRequest> => {
    const email = getString(body.email);
    const password = getString(body.password);

    if (!email || !password) {
        return {
            isValid: false,
            message: "Email and password are required",
        };
    }

    return {
        isValid: true,
        data: {
            email,
            password,
        },
    };
};

export const validateChangePassword = (body: Record<string, unknown>): ValidationResult<ChangePasswordInput> => {
    const currentPassword = getString(body.currentPassword);
    const newPassword = getString(body.newPassword);
    const confirmPassword = getString(body.confirmPassword);

    if (!currentPassword || !newPassword || !confirmPassword) {
        return {
            isValid: false,
            message: "Current password, new password and confirmation password are required.",
        };
    }

    if (newPassword !== confirmPassword) {
        return {
            isValid: false,
            message: "New passwords do not match.",
        };
    }

    if (newPassword.length < 8) {
        return {
            isValid: false,
            message: "New password must contain at least 8 characters.",
        };
    }

    return {
        isValid: true,
        data: {
            currentPassword,
            newPassword,
        },
    };
};

export const validateUpdateProfile = (body: Record<string, unknown>): ValidationResult<UpdateProfileInput> => {
    const firstName = getString(body.firstName);
    const lastName = getString(body.lastName);
    const email = getString(body.email);

    if (!firstName || !lastName || !email) {
        return {
            isValid: false,
            message: "First name, last name and email are required.",
        };
    }

    return {
        isValid: true,
        data: {
            firstName,
            lastName,
            email,
        },
    };
};
