import type { EmployeeLeaveInput, EmployeeLeaveStatus } from "../interfaces/employeeLeaveInterface.js";
import { validateEmployeeId } from "./employeeValidator.js";
import { getString, type ValidationResult } from "./validationUtils.js";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;
const statuses: EmployeeLeaveStatus[] = ["pending", "approved", "rejected"];

const normalizeTime = (value: unknown): string | null => {
    const time = getString(value);
    if (!time || !TIME_PATTERN.test(time)) return null;
    return time.length === 5 ? `${time}:00` : time;
};

const validDate = (value: string): boolean => {
    if (!DATE_PATTERN.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export const validateEmployeeLeaveId = validateEmployeeId;

export const validateLeaveDate = (value: unknown): ValidationResult<string | undefined> => {
    if (value === undefined) return { isValid: true, data: undefined };
    const date = getString(value);
    if (!date || !validDate(date)) return { isValid: false, message: "Date must use YYYY-MM-DD format." };
    return { isValid: true, data: date };
};

export const validateEmployeeLeave = (body: Record<string, unknown>,): ValidationResult<EmployeeLeaveInput> => {
    const employee = validateEmployeeId(String(body.employee_id ?? body.employeeId ?? ""));
    const leaveType = getString(body.leave_type ?? body.leaveType);
    const leaveDate = getString(body.leave_date ?? body.leaveDate);
    const startTime = normalizeTime(body.start_time ?? body.startTime);
    const endTime = normalizeTime(body.end_time ?? body.endTime);
    const reason = getString(body.reason);
    const status = (getString(body.status) ?? "pending") as EmployeeLeaveStatus;

    if (!employee.isValid) return { isValid: false, message: "A valid employee ID is required." };
    if (!leaveType || !leaveDate) {
        return { isValid: false, message: "Employee, leave type and leave date are required." };
    }
    if (!validDate(leaveDate)) {
        return { isValid: false, message: "Leave date must use valid YYYY-MM-DD format." };
    }
    if (!startTime || !endTime) {
        return { isValid: false, message: "Start and end times are required and must use HH:mm or HH:mm:ss format." };
    }
    if (endTime <= startTime) {
        return { isValid: false, message: "End time must be later than start time." };
    }
    if (!statuses.includes(status)) {
        return { isValid: false, message: "Status must be pending, approved or rejected." };
    }

    return { isValid: true, data: {
        employee_id: employee.data, leave_type: leaveType, leave_date: leaveDate,
        start_time: startTime, end_time: endTime, reason: reason ?? null, status,
    } };
};
