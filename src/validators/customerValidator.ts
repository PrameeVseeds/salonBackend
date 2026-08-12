import type { CustomerLoginInput, RegisterCustomerInput, UpdateCustomerProfileInput } from "../interfaces/customerInterface.js";
import { getString, type ValidationResult } from "./validationUtils.js";

interface ChangeCustomerPasswordInput {
    currentPassword: string;
    newPassword: string;
}

interface ResetCustomerPasswordInput {
    token: string;
    newPassword: string;
}

// Validates customer registration input.
export const validateRegisterCustomer = (body: Record<string, unknown>): ValidationResult<RegisterCustomerInput> => {
    if (!body.firstName || !body.lastName || !body.phone || !body.email || !body.password || !body.confirmPassword) {
        return {
            isValid: false,
            message: "All fields are required.",
        };
    }

    const firstName = getString(body.firstName);
    const lastName = getString(body.lastName);
    const phone = getString(body.phone);
    const email = getString(body.email);
    const password = getString(body.password);
    const confirmPassword = getString(body.confirmPassword);

    if (!firstName || !lastName || !phone || !email || !password || !confirmPassword) {
        return {
            isValid: false,
            message: "All fields must contain valid text values.",
        };
    }

    if (password !== confirmPassword) {
        return {
            isValid: false,
            message: "Passwords do not match.",
        };
    }

    if (password.length < 8) {
        return {
            isValid: false,
            message: "Password must contain at least 8 characters.",
        };
    }

    return {
        isValid: true,
        data: {
            firstName,
            lastName,
            phone,
            email,
            password,
        },
    };
};

// Validates route ids used by customer management endpoints.
export const validateCustomerId = (id: string | string[] | undefined): ValidationResult<number> => {
    if (Array.isArray(id)) {
        return {
            isValid: false,
            message: "Invalid customer ID.",
        };
    }

    const customerId = Number(id);

    if (!Number.isInteger(customerId) || customerId <= 0) {
        return {
            isValid: false,
            message: "Invalid customer ID.",
        };
    }

    return {
        isValid: true,
        data: customerId,
    };
};

// Validates customer email query/body values.
export const validateCustomerEmail = (
    email: unknown,
    message = "Customer email is required.",
): ValidationResult<string> => {
    const normalizedEmail = getString(email);

    if (!normalizedEmail) {
        return {
            isValid: false,
            message,
        };
    }

    return {
        isValid: true,
        data: normalizedEmail,
    };
};

// Validates admin status changes for customer accounts.
export const validateCustomerStatus = (body: Record<string, unknown>): ValidationResult<boolean> => {
    if (typeof body.isActive !== "boolean") {
        return {
            isValid: false,
            message: "isActive must be true or false.",
        };
    }

    return {
        isValid: true,
        data: body.isActive,
    };
};

// Validates forgot-password requests.
export const validateForgotCustomerPassword = (body: Record<string, unknown>): ValidationResult<string> => {
    return validateCustomerEmail(body.email, "Email is required.");
};

// Validates reset-password requests.
export const validateResetCustomerPassword = (body: Record<string, unknown>): ValidationResult<ResetCustomerPasswordInput> => {
    const token = typeof body.token === "string" && body.token.length > 0 ? body.token : null;
    const newPassword = typeof body.newPassword === "string" && body.newPassword.length > 0 ? body.newPassword : null;
    const confirmPassword = typeof body.confirmPassword === "string" && body.confirmPassword.length > 0
        ? body.confirmPassword
        : null;

    if (!token || !newPassword || !confirmPassword) {
        return {
            isValid: false,
            message: "Token, new password and confirm password are required.",
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
            token,
            newPassword,
        },
    };
};

// Validates customer login input.
export const validateCustomerLogin = (body: Record<string, unknown>): ValidationResult<CustomerLoginInput> => {
    const email = getString(body.email);
    const password = typeof body.password === "string" && body.password.length > 0 ? body.password : null;

    if (!email || !password) {
        return {
            isValid: false,
            message: "Email and password are required.",
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

// Validates customer profile update input.
export const validateUpdateCustomerProfile = (body: Record<string, unknown>): ValidationResult<UpdateCustomerProfileInput> => {
    if (!body.firstName || !body.lastName || !body.phone || !body.email) {
        return {
            isValid: false,
            message: "First name, last name, phone and email are required.",
        };
    }

    const firstName = getString(body.firstName);
    const lastName = getString(body.lastName);
    const phone = getString(body.phone);
    const email = getString(body.email);

    if (!firstName || !lastName || !phone || !email) {
        return {
            isValid: false,
            message: "Profile fields must contain valid text values.",
        };
    }

    return {
        isValid: true,
        data: {
            firstName,
            lastName,
            phone,
            email,
        },
    };
};

// Validates customer password change input.
export const validateChangeCustomerPassword = (body: Record<string, unknown>): ValidationResult<ChangeCustomerPasswordInput> => {
    const currentPassword = typeof body.currentPassword === "string" && body.currentPassword.length > 0
        ? body.currentPassword
        : null;
    const newPassword = typeof body.newPassword === "string" && body.newPassword.length > 0
        ? body.newPassword
        : null;
    const confirmPassword = typeof body.confirmPassword === "string" && body.confirmPassword.length > 0
        ? body.confirmPassword
        : null;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return {
            isValid: false,
            message: "Current password, new password and confirm password are required.",
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
