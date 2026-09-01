import { getString } from "./validationUtils.js";
export const validateRegisterEmployee = (body) => {
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
export const validateEmployeeId = (id) => {
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
export const validateEmployeeEmail = (email, message = "Employee email is required") => {
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
export const validateEmployeeName = (name, message = "Employee name is required") => {
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
export const validateEmployeePhone = (phone, message = "Employee phone is required") => {
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
export const validateEmployeeStatus = (body) => {
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
export const validateUpdateEmployee = (body) => {
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
//# sourceMappingURL=employeeValidator.js.map