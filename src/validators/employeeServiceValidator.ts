import { validateEmployeeId } from "./employeeValidator.js";
import { validateServiceId } from "./serviceValidator.js";
import type { ValidationResult } from "./validationUtils.js";

interface EmployeeServiceIds {
    employeeId: number;
    serviceId: number;
}

export const validateEmployeeServiceIds = (
    employeeId: string | string[] | undefined,serviceId: string | string[] | undefined,): ValidationResult<EmployeeServiceIds> => {
    const employeeValidation = validateEmployeeId(employeeId);
    if (!employeeValidation.isValid) {
        return employeeValidation;
    }

    const serviceValidation = validateServiceId(serviceId);
    if (!serviceValidation.isValid) {
        return serviceValidation;
    }

    return {
        isValid: true,
        data: {
            employeeId: employeeValidation.data,
            serviceId: serviceValidation.data,
        },
    };
};
