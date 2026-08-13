import type { EmployeeLeaveInput, EmployeeLeaveStatus } from "../interfaces/employeeLeaveInterface.js";
import { validateEmployeeId } from "./employeeValidator.js";
import { getString, type ValidationResult } from "./validationUtils.js";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;
const statuses: EmployeeLeaveStatus[] = ["pending", "approved", "rejected"];

const normalizeTime = (value: unknown): string | null => {
    if (value === undefined || value === null || value === "") return "00:00:00";
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
    const startDate = getString(body.start_date ?? body.startDate);
    const endDate = getString(body.end_date ?? body.endDate);
    const startTime = normalizeTime(body.start_time ?? body.startTime);
    const endTime = normalizeTime(body.end_time ?? body.endTime);
    const reason = getString(body.reason);
    const status = getString(body.status) as EmployeeLeaveStatus | null;

    if (!employee.isValid) return { isValid: false, message: "A valid employee ID is required." };
    if (!leaveType || !startDate || !endDate || !reason || !status) {
        return { isValid: false, message: "Employee, leave type, dates, reason and status are required." };
    }
    if (!validDate(startDate) || !validDate(endDate)) {
        return { isValid: false, message: "Dates must use valid YYYY-MM-DD format." };
    }
    if (!startTime || !endTime) {
        return { isValid: false, message: "Times must use HH:mm or HH:mm:ss format." };
    }
    if (!statuses.includes(status)) {
        return { isValid: false, message: "Status must be pending, approved or rejected." };
    }
    if (startDate > endDate || (startDate === endDate && startTime > endTime)) {
        return { isValid: false, message: "Leave end date/time cannot be before its start date/time." };
    }

    return { isValid: true, data: {
        employee_id: employee.data, leave_type: leaveType, start_date: startDate,
        end_date: endDate, start_time: startTime, end_time: endTime, reason, status,
    } };
};
