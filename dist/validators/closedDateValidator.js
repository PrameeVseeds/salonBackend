import { getString } from "./validationUtils.js";
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const isValidDate = (value) => {
    if (!datePattern.test(value))
        return false;
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};
export const validateClosedDateId = (value) => {
    if (Array.isArray(value))
        return { isValid: false, message: "Invalid closed-date ID." };
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0)
        return { isValid: false, message: "Invalid closed-date ID." };
    return { isValid: true, data: id };
};
export const validateClosedDateQuery = (value) => {
    if (value === undefined)
        return { isValid: true, data: undefined };
    const date = getString(value);
    if (!date || !isValidDate(date))
        return { isValid: false, message: "Date must use valid YYYY-MM-DD format." };
    return { isValid: true, data: date };
};
export const validateClosedDate = (body) => {
    const closedDate = getString(body.closed_date ?? body.closedDate);
    const reason = getString(body.reason);
    if (!closedDate || !isValidDate(closedDate)) {
        return { isValid: false, message: "Closed date must use valid YYYY-MM-DD format." };
    }
    return { isValid: true, data: { closed_date: closedDate, reason: reason ?? null } };
};
//# sourceMappingURL=closedDateValidator.js.map