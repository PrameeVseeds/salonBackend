import * as employeeRepository from "../repositories/employeeRepository.js";
const normalizeEmail = (email) => email.trim().toLowerCase();
const normalizePhone = (phone) => phone.trim();
export const getEmployeeByEmail = async (email) => {
    return employeeRepository.findEmployeeByEmail(normalizeEmail(email));
};
export const getEmployeeByPhone = async (phone) => {
    return employeeRepository.findEmployeeByPhone(normalizePhone(phone));
};
export const registerEmployee = async (input) => {
    const normalizedEmail = normalizeEmail(input.email);
    const normalizedPhone = normalizePhone(input.phone);
    if (await employeeRepository.findEmployeeByEmail(normalizedEmail)) {
        throw new Error("A customer with this email already exists");
    }
    if (await employeeRepository.findEmployeeByPhone(normalizedPhone)) {
        throw new Error("A customer with this phone already exists");
    }
    return employeeRepository.createEmployee({
        ...input,
        email: normalizedEmail,
        phone: normalizedPhone,
    });
};
export const getEmployeeById = async (employeeId) => {
    return employeeRepository.findEmployeeById(employeeId);
};
export const getEmployeeByName = async (name) => {
    return employeeRepository.findEmployeeByName(name);
};
export const getAllEmployees = async () => {
    return employeeRepository.findAllEmployees();
};
export const updateEmployeeById = async (employeeId, input) => {
    const normalizedEmail = normalizeEmail(input.email);
    const normalizedPhone = normalizePhone(input.phone);
    if (await employeeRepository.employeeEmailExistForAnotherEmployee(normalizedEmail, employeeId)) {
        throw new Error("An employee with this email already exists");
    }
    if (await employeeRepository.employeePhoneExistForAnotherEmployee(normalizedPhone, employeeId)) {
        throw new Error("An employee with this phone already exists");
    }
    const updated = await employeeRepository.updateEmployee(employeeId, {
        ...input,
        email: normalizedEmail,
        phone: normalizedPhone
    });
    return updated ? employeeRepository.findEmployeeById(employeeId) : null;
};
export const updateEmployeeStatusById = async (employeeId, isActive) => {
    const updated = await employeeRepository.updateEmployeeByStatus(employeeId, isActive);
    return updated ? employeeRepository.findEmployeeById(employeeId) : null;
};
export const updateEmployeeProfileImageById = async (employeeId, profileImage) => {
    const updated = await employeeRepository.updateEmployeeProfileImage(employeeId, profileImage);
    return updated ? employeeRepository.findEmployeeById(employeeId) : null;
};
export const deleteEmployee = async (employeeId) => {
    const existing = await employeeRepository.findEmployeeById(employeeId);
    if (!existing)
        return false;
    return employeeRepository.deleteEmployee(employeeId);
};
//# sourceMappingURL=employeeService.js.map