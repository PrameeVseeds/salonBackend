import { getString } from "./validationUtils.js";
const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;
const normalizeTime = (value) => {
    const time = getString(value);
    if (!time || !timePattern.test(time))
        return null;
    return time.length === 5 ? `${time}:00` : time;
};
export const validateWorkingHoursId = (value) => {
    if (Array.isArray(value))
        return { isValid: false, message: "Invalid working-hours ID." };
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0)
        return { isValid: false, message: "Invalid working-hours ID." };
    return { isValid: true, data: id };
};
export const validateWorkingHours = (body) => {
    const day = getString(body.day_of_week ?? body.dayOfWeek);
    const openingTime = normalizeTime(body.opening_time ?? body.openingTime);
    const closingTime = normalizeTime(body.closing_time ?? body.closingTime);
    const isClosed = body.is_closed ?? body.isClosed;
    if (!day || !weekdays.includes(day)) {
        return { isValid: false, message: "Day of week must be Monday through Sunday." };
    }
    if (!openingTime || !closingTime) {
        return { isValid: false, message: "Opening and closing times must use HH:mm or HH:mm:ss format." };
    }
    if (openingTime >= closingTime) {
        return { isValid: false, message: "Closing time must be later than opening time." };
    }
    if (typeof isClosed !== "boolean") {
        return { isValid: false, message: "Closed status must be true or false." };
    }
    return { isValid: true, data: { day_of_week: day, opening_time: openingTime, closing_time: closingTime, is_closed: isClosed } };
};
export const validateWorkingHoursStatus = (body) => {
    const isClosed = body.is_closed ?? body.isClosed;
    if (typeof isClosed !== "boolean")
        return { isValid: false, message: "Closed status must be true or false." };
    return { isValid: true, data: isClosed };
};
//# sourceMappingURL=workingHoursValidator.js.map