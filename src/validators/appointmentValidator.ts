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
    const employeeValue = body.employeeId ?? body.employee_id;
    const employeeId = employeeValue === null || employeeValue === undefined || employeeValue === "" ? null : positiveId(employeeValue);
    const rawServiceIds = Array.isArray(body.serviceIds) ? body.serviceIds : [body.serviceId ?? body.service_id];
    const serviceIds = rawServiceIds.map(positiveId).filter((id): id is number => id !== null);
    const serviceId = serviceIds[0] ?? null;
    const rawSubServiceIds = Array.isArray(body.subServiceIds) ? body.subServiceIds : [];
    const subServiceIds = serviceIds.map((_, index) => positiveId(rawSubServiceIds[index]) ?? null);
    const appointmentDate = getString(body.appointmentDate ?? body.appointment_date);
    const startTime = normalizeTime(body.startTime ?? body.start_time);

    if (!serviceId || (employeeValue !== null && employeeValue !== undefined && employeeValue !== "" && !employeeId))
        return { isValid: false, message: "A valid service ID and optional employee ID are required." };

    if (!appointmentDate || !validDate(appointmentDate))
        return { isValid: false, message: "Appointment date must use valid YYYY-MM-DD format." };

    if (!startTime)
        return { isValid: false, message: "Start time must use HH:mm or HH:mm:ss format." };

    return {
        isValid: true,
        data: { employeeId, serviceId, serviceIds, subServiceIds, appointmentDate, startTime, notes: getString(body.notes) }
    };
};

export const validateAvailabilityQuery = (query: Record<string, unknown>): ValidationResult<AvailabilityQuery> => {
    const employeeValue = query.employeeId;
    const employeeId = employeeValue === undefined || employeeValue === null || employeeValue === "" ? null : positiveId(employeeValue);
    const serviceIds = String(query.serviceIds ?? query.serviceId ?? "").split(",").map(positiveId).filter((id): id is number => id !== null);
    const serviceId = serviceIds[0] ?? null;
    const rawSubServiceIds = String(query.subServiceIds ?? "").split(",");
    const subServiceIds = serviceIds.map((_, index) => positiveId(rawSubServiceIds[index]) ?? null);
    const date = getString(query.date);
    if (!serviceId || (employeeValue !== undefined && employeeValue !== null && employeeValue !== "" && !employeeId))
        return { isValid: false, message: "A valid service ID and optional employee ID are required." };
    if (!date || !validDate(date))
        return { isValid: false, message: "Appointment date must use valid YYYY-MM-DD format." };

    return {
        isValid: true, data: { date, serviceId, serviceIds, subServiceIds, employeeId }
    };
};

export const validateAppointmentFilters = (query: Record<string, unknown>): ValidationResult<AppointmentFilters> => {
    const dateValue = query.date === undefined ? undefined : getString(query.date);
    if (dateValue !== undefined && (!dateValue || !validDate(dateValue)))
        return { isValid: false, message: "Date must use valid YYYY-MM-DD format." };

    const employeeId = query.employeeId === undefined ? undefined : positiveId(query.employeeId);
    const customerId = query.customerId === undefined ? undefined : positiveId(query.customerId);
    const status = query.status === undefined ? undefined : getString(query.status);
    const statuses = ["Scheduled", "In Progress", "Completed", "Cancelled"] as const;
    const search = query.search === undefined ? undefined : getString(query.search);

    if (query.employeeId !== undefined && !employeeId)
        return { isValid: false, message: "Invalid employee ID." };

    if (query.customerId !== undefined && !customerId)
        return { isValid: false, message: "Invalid customer ID." };
    if (status !== undefined && !statuses.includes(status as typeof statuses[number]))
        return { isValid: false, message: "Invalid appointment status." };
    if (query.search !== undefined && !search)
        return { isValid: false, message: "Search text cannot be empty." };

    return {
        isValid: true, data:
            {
                date: dateValue,
                employeeId: employeeId ?? undefined,
                customerId: customerId ?? undefined,
                status: status as AppointmentFilters["status"],
                search: search ?? undefined,
            }
    };
};
