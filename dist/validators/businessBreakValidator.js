import { getString } from "./validationUtils.js";
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;
const isValidDate = (value) => {
    if (!datePattern.test(value))
        return false;
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};
const normalizeTime = (value) => {
    const time = getString(value);
    if (!time || !timePattern.test(time))
        return null;
    return time.length === 5 ? `${time}:00` : time;
};
export const validateBusinessBreakId = (value) => {
    if (Array.isArray(value))
        return { isValid: false, message: "Invalid business-break ID." };
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0)
        return { isValid: false, message: "Invalid business-break ID." };
    return {
        isValid: true,
        data: id
    };
};
export const validateBusinessBreakDate = (value) => {
    if (value === undefined)
        return { isValid: true, data: undefined };
    const date = getString(value);
    if (!date || !isValidDate(date))
        return { isValid: false, message: "Date must use valid YYYY-MM-DD format." };
    return {
        isValid: true,
        data: date
    };
};
export const validateBusinessBreak = (body) => {
    const breakDate = getString(body.break_date ?? body.breakDate);
    const startTime = normalizeTime(body.start_time ?? body.startTime);
    const endTime = normalizeTime(body.end_time ?? body.endTime);
    const reason = getString(body.reason);
    if (!breakDate || !isValidDate(breakDate))
        return { isValid: false, message: "Break date must use valid YYYY-MM-DD format." };
    if (!startTime || !endTime)
        return { isValid: false, message: "Start and end times are required and must use HH:mm or HH:mm:ss format." };
    if (endTime <= startTime)
        return { isValid: false, message: "End time must be later than start time." };
    return {
        isValid: true,
        data: { break_date: breakDate, start_time: startTime, end_time: endTime, reason: reason ?? null }
    };
};
//# sourceMappingURL=businessBreakValidator.js.map