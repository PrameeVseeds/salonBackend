import { validateEmployeeId } from "./employeeValidator.js";
import { validateServiceId } from "./serviceValidator.js";
export const validateEmployeeServiceIds = (employeeId, serviceId) => {
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
//# sourceMappingURL=employeeServiceValidator.js.map