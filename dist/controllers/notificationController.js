import * as service from "../services/notificationService.js";
import { formatNotification } from "../utils/mappers/notificationMapper.js";
import { sendBadRequest } from "../utils/responseHelper.js";
import { validateNotificationFilters, validateNotificationId } from "../validators/notificationValidator.js";
export const getAll = async (req, res) => {
    const validation = validateNotificationFilters(req.query);
    if (!validation.isValid)
        return sendBadRequest(res, validation.message);
    try {
        const items = await service.getNotifications(validation.data);
        res.status(200).json({
            success: true, message: "Notifications retrieved successfully.",
            data: { notifications: items.map(formatNotification) }
        });
    }
    catch {
        res.status(500).json({ success: false, message: "Failed to retrieve notifications." });
    }
};
export const getById = async (req, res) => {
    const validation = validateNotificationId(req.params.id);
    if (!validation.isValid)
        return sendBadRequest(res, validation.message);
    try {
        const item = await service.getNotification(validation.data);
        if (!item) {
            res.status(404).json({ success: false, message: "Notification not found." });
            return;
        }
        res.status(200).json({
            success: true, message: "Notification retrieved successfully.",
            data: { notification: formatNotification(item) }
        });
    }
    catch {
        res.status(500).json({ success: false, message: "Failed to retrieve notification." });
    }
};
export const getMy = async (req, res) => {
    try {
        const items = await service.getMyNotifications(req.customer.id);
        res.status(200).json({
            success: true, message: "Notifications retrieved successfully.",
            data: { notifications: items.map(formatNotification) }
        });
    }
    catch {
        res.status(500).json({ success: false, message: "Failed to retrieve notifications." });
    }
};
export const getByAppointment = async (req, res) => {
    const validation = validateNotificationId(req.params.appointmentId);
    if (!validation.isValid)
        return sendBadRequest(res, "Invalid appointment ID.");
    try {
        const items = await service.getAppointmentNotifications(validation.data);
        res.status(200).json({
            success: true, message: "Appointment notifications retrieved successfully.",
            data: { notifications: items.map(formatNotification) }
        });
    }
    catch {
        res.status(500).json({ success: false, message: "Failed to retrieve appointment notifications." });
    }
};
export const retry = async (req, res) => {
    const validation = validateNotificationId(req.params.id);
    if (!validation.isValid)
        return sendBadRequest(res, validation.message);
    try {
        const item = await service.retryNotification(validation.data);
        if (!item) {
            res.status(404).json({ success: false, message: "Notification not found." });
            return;
        }
        res.status(200).json({
            success: true,
            message: item.sent_status === "Sent" ? "Notification sent successfully." : "Notification delivery failed.",
            data: { notification: formatNotification(item) }
        });
    }
    catch {
        res.status(500).json({ success: false, message: "Failed to retry notification." });
    }
};
//# sourceMappingURL=notificationController.js.map