import type { CreateAdminRequest, UpdateAdminRequest } from "../interfaces/adminInterface.js";

type ValidationResult<T> =
    | { isValid: true; data: T }
    | { isValid: false; message: string };

interface ResetAdminPasswordRequest {
    newPassword: string;
}

const getString = (value: unknown): string | null => {
    if (typeof value !== "string") {
        return null;
    }

    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : null;
};

const getAdminName = (body: Record<string, unknown>, snakeCaseKey: string, camelCaseKey: string): string | null => {
    return getString(body[snakeCaseKey]) ?? getString(body[camelCaseKey]);
};

export const validateAdminId = (id: string | string[] | undefined): ValidationResult<number> => {
    if (Array.isArray(id)) {
        return {
            isValid: false,
            message: "Invalid admin ID.",
        };
    }

    const adminId = Number(id);

    if (!Number.isInteger(adminId) || adminId <= 0) {
        return {
            isValid: false,
            message: "Invalid admin ID.",
        };
    }

    return {
        isValid: true,
        data: adminId,
    };
};

export const validateCreateAdmin = (body: Record<string, unknown>): ValidationResult<CreateAdminRequest> => {
    const firstName = getAdminName(body, "first_name", "firstName");
    const lastName = getAdminName(body, "last_name", "lastName");
    const email = getString(body.email);
    const password = getString(body.password);

    if (!firstName || !lastName || !email || !password) {
        return {
            isValid: false,
            message: "All fields are required",
        };
    }

    if (password.length < 8) {
        return {
            isValid: false,
            message: "Password must be at least 8 characters long",
        };
    }

    return {
        isValid: true,
        data: {
            first_name: firstName,
            last_name: lastName,
            email,
            password,
        },
    };
};

export const validateUpdateAdmin = (body: Record<string, unknown>): ValidationResult<UpdateAdminRequest> => {
    const firstName = getAdminName(body, "first_name", "firstName");
    const lastName = getAdminName(body, "last_name", "lastName");
    const email = getString(body.email);
    const isActive = body.is_active ?? body.isActive;

    if (!firstName || !lastName || !email) {
        return {
            isValid: false,
            message: "First Name, Last name, and Email is Required",
        };
    }

    if (typeof isActive !== "boolean") {
        return {
            isValid: false,
            message: "Active is must be true or false",
        };
    }

    return {
        isValid: true,
        data: {
            first_name: firstName,
            last_name: lastName,
            email,
            is_active: isActive,
        },
    };
};

export const validateAdminStatus = (body: Record<string, unknown>): ValidationResult<boolean> => {
    const isActive = body.is_active ?? body.isActive;

    if (typeof isActive !== "boolean") {
        return {
            isValid: false,
            message: "Status must be true or false.",
        };
    }

    return {
        isValid: true,
        data: isActive,
    };
};

export const validateResetAdminPassword = (body: Record<string, unknown>): ValidationResult<ResetAdminPasswordRequest> => {
    const newPassword = getString(body.newPassword);
    const confirmPassword = getString(body.confirmPassword);

    if (!newPassword || !confirmPassword) {
        return {
            isValid: false,
            message: "New password and confirmation password are required.",
        };
    }

    if (newPassword !== confirmPassword) {
        return {
            isValid: false,
            message: "Passwords do not match.",
        };
    }

    if (newPassword.length < 8) {
        return {
            isValid: false,
            message: "Password must contain at least 8 characters.",
        };
    }

    return {
        isValid: true,
        data: {
            newPassword,
        },
    };
};
