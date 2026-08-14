import type { AppointmentFilters, AppointmentRequest, AvailabilityQuery } from "../interfaces/appointmentInterface.js";
import { getString, type ValidationResult } from "./validationUtils.js";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;

const positiveId = (value: unknown): number | null => {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
};

const validDate = (value: string): boolean => {
    if (!datePattern.test(value))
        return false;

    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const normalizeTime = (value: unknown): string | null => {
    const time = getString(value);
    if (!time || !timePattern.test(time))
        return null;

    return time.length === 5 ? `${time}:00` : time;
};

export const validateAppointmentId = (value: string | string[] | undefined): ValidationResult<number> => {
    if (Array.isArray(value))
        return { isValid: false, message: "Invalid appointment ID." };
    const id = positiveId(value);
    return id ? { isValid: true, data: id } : { isValid: false, message: "Invalid appointment ID." };
};

export const validateAppointmentRequest = (body: Record<string, unknown>): ValidationResult<AppointmentRequest> => {
    const employeeId = positiveId(body.employeeId ?? body.employee_id);
    const serviceId = positiveId(body.serviceId ?? body.service_id);
    const appointmentDate = getString(body.appointmentDate ?? body.appointment_date);
    const startTime = normalizeTime(body.startTime ?? body.start_time);

    if (!employeeId || !serviceId)
        return { isValid: false, message: "Valid employee and service IDs are required." };

    if (!appointmentDate || !validDate(appointmentDate))
        return { isValid: false, message: "Appointment date must use valid YYYY-MM-DD format." };

    if (!startTime)
        return { isValid: false, message: "Start time must use HH:mm or HH:mm:ss format." };

    return {
        isValid: true,
        data: { employeeId, serviceId, appointmentDate, startTime, notes: getString(body.notes) }
    };
};

export const validateAvailabilityQuery = (query: Record<string, unknown>): ValidationResult<AvailabilityQuery> => {
    const result = validateAppointmentRequest({
        employeeId: query.employeeId,
        serviceId: query.serviceId,
        appointmentDate: query.date,
        startTime: "00:00",
    });
    if (!result.isValid)
        return result;

    return {
        isValid: true, data:
            { date: result.data.appointmentDate, serviceId: result.data.serviceId, employeeId: result.data.employeeId }
    };
};

export const validateAppointmentFilters = (query: Record<string, unknown>): ValidationResult<AppointmentFilters> => {
    const dateValue = query.date === undefined ? undefined : getString(query.date);
    if (dateValue !== undefined && (!dateValue || !validDate(dateValue)))
        return { isValid: false, message: "Date must use valid YYYY-MM-DD format." };

    const employeeId = query.employeeId === undefined ? undefined : positiveId(query.employeeId);
    const customerId = query.customerId === undefined ? undefined : positiveId(query.customerId);

    if (query.employeeId !== undefined && !employeeId)
        return { isValid: false, message: "Invalid employee ID." };

    if (query.customerId !== undefined && !customerId)
        return { isValid: false, message: "Invalid customer ID." };

    return {
        isValid: true, data:
            { date: dateValue, employeeId: employeeId ?? undefined, customerId: customerId ?? undefined }
    };
};
