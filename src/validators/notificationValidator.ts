import type { NotificationFilters } from "../interfaces/notificationInterface.js";
import type { NotificationStatus, NotificationType } from "../models/notificationModel.js";
import { getString, type ValidationResult } from "./validationUtils.js";

const statuses: NotificationStatus[] = ["Pending", "Sent", "Failed"];
const types: NotificationType[] = ["Email", "SMS", "WhatsApp"];

const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value)
    && !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime());

export const validateNotificationId = (value: string | string[] | undefined): ValidationResult<number> => {
    if (Array.isArray(value))
        return {
            isValid: false, message: "Invalid notification ID."
        };
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? {
        isValid: true, data: id
    } : {
        isValid: false, message: "Invalid notification ID."
    };
};

export const validateNotificationFilters = (query: Record<string, unknown>): ValidationResult<NotificationFilters> => {
    const status = getString(query.status) as NotificationStatus | null;
    const type = getString(query.type) as NotificationType | null;
    const date = getString(query.date);

    if (status && !statuses.includes(status))
        return { isValid: false, message: "Status must be Pending, Sent or Failed." };

    if (type && !types.includes(type))
        return { isValid: false, message: "Type must be Email, SMS or WhatsApp." };

    if (date && !validDate(date))
        return { isValid: false, message: "Date must use YYYY-MM-DD format." };

    return {
        isValid: true,
        data: { status: status ?? undefined, type: type ?? undefined, date: date ?? undefined }
    };
};
