import type { EmployeeLeaveInput, UpdateEmployeeLeaveInput } from "../interfaces/employeeLeaveInterface.js";
import type { EmployeeLeaveRow } from "../models/employeeLeavesModel.js";
import * as employeeRepository from "../repositories/employeeRepository.js";
import * as repository from "../repositories/employeeLeaveRepository.js";

const ensureEmployeeExists = async (employeeId: number): Promise<void> => {
    if (!(await employeeRepository.findEmployeeById(employeeId))) throw new Error("Employee not found.");
};

export const createLeave = async (input: EmployeeLeaveInput): Promise<EmployeeLeaveRow | null> => {
    await ensureEmployeeExists(input.employee_id);
    return repository.create(input);
};

export const getLeaves = (): Promise<EmployeeLeaveRow[]> => repository.findAll();

export const getLeave = (id: number): Promise<EmployeeLeaveRow | null> => repository.findById(id);

export const getEmployeeLeaves = async (employeeId: number, date?: string): Promise<EmployeeLeaveRow[] | null> => {
    if (!(await employeeRepository.findEmployeeById(employeeId))) return null;
    return repository.findByEmployee(employeeId, date);
};

export const updateLeave = async (id: number, input: UpdateEmployeeLeaveInput): Promise<EmployeeLeaveRow | null> => {
    if (!(await repository.findById(id))) return null;
    await ensureEmployeeExists(input.employee_id);
    return await repository.update(id, input) ? repository.findById(id) : null;
};

export const deleteLeave = (id: number): Promise<boolean> => repository.remove(id);
