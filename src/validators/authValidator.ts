import type { LoginRequest, UpdateProfileInput } from "../interfaces/authInterface.js";

type ValidationResult<T> =
    | { isValid: true; data: T }
    | { isValid: false; message: string };

interface ChangePasswordInput {
    currentPassword: string;
    newPassword: string;
}

const getString = (value: unknown): string | null => {
    if (typeof value !== "string") {
        return null;
    }

    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : null;
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
