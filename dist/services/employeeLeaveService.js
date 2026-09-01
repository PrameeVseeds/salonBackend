import * as employeeRepository from "../repositories/employeeRepository.js";
import * as repository from "../repositories/employeeLeaveRepository.js";
const ensureEmployeeExists = async (employeeId) => {
    if (!(await employeeRepository.findEmployeeById(employeeId)))
        throw new Error("Employee not found.");
};
export const createLeave = async (input) => {
    await ensureEmployeeExists(input.employee_id);
    return repository.create(input);
};
export const getLeaves = () => repository.findAll();
export const getLeave = (id) => repository.findById(id);
export const getEmployeeLeaves = async (employeeId, date) => {
    if (!(await employeeRepository.findEmployeeById(employeeId)))
        return null;
    return repository.findByEmployee(employeeId, date);
};
export const updateLeave = async (id, input) => {
    if (!(await repository.findById(id)))
        return null;
    await ensureEmployeeExists(input.employee_id);
    return await repository.update(id, input) ? repository.findById(id) : null;
};
export const deleteLeave = (id) => repository.remove(id);
//# sourceMappingURL=employeeLeaveService.js.map