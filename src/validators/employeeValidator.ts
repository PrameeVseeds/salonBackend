import type { RegisterEmployeeInput, UpdateEmployeeInput } from "../interfaces/employeeInterface.js";
import { getString, type ValidationResult } from "./validationUtils.js";

export const validateRegisterEmployee = (body: Record<string, unknown>): ValidationResult<RegisterEmployeeInput> => {
    const firstName = getString(body.firstName);
    const lastName = getString(body.lastName);
    const phone = getString(body.phone);
    const email = getString(body.email);

    if (!firstName || !lastName || !phone || !email) {
        return {
            isValid: false,
            message: "First name, last name, phone and email are required.",
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


export const validateEmployeeId = (id: string | string[] | undefined): ValidationResult<number> => {
    if (Array.isArray(id)) {
        return {
            isValid: false,
            message: "Invalid Employee ID",
        };
    }

    const employeeId = Number(id);
    if (!Number.isInteger(employeeId) || employeeId <= 0) {
        return {
            isValid: false,
            message: "Invalid Employee ID"
        };
    }
    return {
        isValid: true,
        data: employeeId
    };
};

export const validateEmployeeEmail = (email: unknown, message = "Employee email is required",): ValidationResult<string> => {
    const normalizedEmail = getString(email);
    if (!normalizedEmail)
        return {
            isValid: false,
            message
        };

    return {
        isValid: true,
        data: normalizedEmail,
    };
};

export const validateEmployeeName = (name: unknown, message = "Employee name is required"): ValidationResult<string> => {
    const normalizedName = getString(name);
    if (!normalizedName) {
        return {
            isValid: false,
            message,
        };
    }

    return {
        isValid: true,
        data: normalizedName,
    };
};

export const validateEmployeePhone = (phone: unknown, message = "Employee phone is required"): ValidationResult<string> => {
    const normalizedPhone = getString(phone);
    if (!normalizedPhone) {
        return {
            isValid: false,
            message,
        };
    }

    return {
        isValid: true,
        data: normalizedPhone,
    };
};

export const validateEmployeeStatus = (body: Record<string, unknown>): ValidationResult<boolean> => {
    if (typeof body.isActive !== "boolean")
        return {
            isValid: false,
            message: "Active is must be true or false."
        };
    return {
        isValid: true,
        data: body.isActive,
    };
};

export const validateUpdateEmployee = (body: Record<string, unknown>): ValidationResult<UpdateEmployeeInput> => {
    const firstName = getString(body.firstName);
    const lastName = getString(body.lastName);
    const phone = getString(body.phone);
    const email = getString(body.email);

    if (!firstName || !lastName || !phone || !email) {
        return {
            isValid: false,
            message: "First name, last name, phone and email are required.",
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
