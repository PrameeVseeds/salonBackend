import * as employeeRepository from "../repositories/employeeRepository.js";
import * as employeeServiceRepository from "../repositories/employeeServiceRepository.js";
import * as serviceRepository from "../repositories/serviceRepository.js";
export const assignServiceToEmployee = async (employeeId, serviceId) => {
    if (!(await employeeRepository.findEmployeeById(employeeId))) {
        throw new Error("Employee not found.");
    }
    if (!(await serviceRepository.findServiceById(serviceId))) {
        throw new Error("Service not found.");
    }
    if (await employeeServiceRepository.findAssignment(employeeId, serviceId)) {
        throw new Error("Service is already assigned to this employee.");
    }
    await employeeServiceRepository.assignService(employeeId, serviceId);
};
export const getEmployeeServices = async (employeeId) => {
    if (!(await employeeRepository.findEmployeeById(employeeId))) {
        return null;
    }
    return employeeServiceRepository.findServicesByEmployeeId(employeeId);
};
export const removeServiceFromEmployee = async (employeeId, serviceId) => {
    if (!(await employeeRepository.findEmployeeById(employeeId))) {
        return null;
    }
    return employeeServiceRepository.removeService(employeeId, serviceId);
};
//# sourceMappingURL=employeeServiceAssignmentService.js.map