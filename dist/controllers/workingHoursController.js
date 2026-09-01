import * as service from "../services/workingHoursService.js";
import { formatWorkingHours } from "../utils/mappers/workingHoursMapper.js";
import { sendBadRequest } from "../utils/responseHelper.js";
import { validateWorkingHours, validateWorkingHoursId, validateWorkingHoursStatus } from "../validators/workingHoursValidator.js";
export const create = async (req, res) => {
    const validation = validateWorkingHours(req.body ?? {});
    if (!validation.isValid)
        return sendBadRequest(res, validation.message);
    try {
        const hours = await service.createWorkingHours(validation.data);
        res.status(201).json({ success: true, message: "Working hours created successfully.", data: { workingHours: hours && formatWorkingHours(hours) } });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create working hours.";
        res.status(message.includes("already exist") ? 409 : 500).json({ success: false, message });
    }
};
export const getAll = async (_req, res) => {
    try {
        const hours = await service.getWorkingHours();
        res.status(200).json({ success: true, message: "Working hours retrieved successfully.", data: { workingHours: hours.map(formatWorkingHours) } });
    }
    catch {
        res.status(500).json({ success: false, message: "Failed to retrieve working hours." });
    }
};
export const getById = async (req, res) => {
    const validation = validateWorkingHoursId(req.params.id);
    if (!validation.isValid)
        return sendBadRequest(res, validation.message);
    try {
        const hours = await service.getWorkingHoursById(validation.data);
        if (!hours) {
            res.status(404).json({ success: false, message: "Working hours not found." });
            return;
        }
        res.status(200).json({ success: true, message: "Working hours retrieved successfully.", data: { workingHours: formatWorkingHours(hours) } });
    }
    catch {
        res.status(500).json({ success: false, message: "Failed to retrieve working hours." });
    }
};
export const update = async (req, res) => {
    const id = validateWorkingHoursId(req.params.id);
    const body = validateWorkingHours(req.body ?? {});
    if (!id.isValid)
        return sendBadRequest(res, id.message);
    if (!body.isValid)
        return sendBadRequest(res, body.message);
    try {
        const hours = await service.updateWorkingHours(id.data, body.data);
        if (!hours) {
            res.status(404).json({ success: false, message: "Working hours not found." });
            return;
        }
        res.status(200).json({ success: true, message: "Working hours updated successfully.", data: { workingHours: formatWorkingHours(hours) } });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update working hours.";
        res.status(message.includes("already exist") ? 409 : 500).json({ success: false, message });
    }
};
export const updateStatus = async (req, res) => {
    const id = validateWorkingHoursId(req.params.id);
    const status = validateWorkingHoursStatus(req.body ?? {});
    if (!id.isValid)
        return sendBadRequest(res, id.message);
    if (!status.isValid)
        return sendBadRequest(res, status.message);
    try {
        const hours = await service.updateWorkingHoursStatus(id.data, status.data);
        if (!hours) {
            res.status(404).json({ success: false, message: "Working hours not found." });
            return;
        }
        res.status(200).json({ success: true, message: status.data ? "Business day closed successfully." : "Business day opened successfully.", data: { workingHours: formatWorkingHours(hours) } });
    }
    catch {
        res.status(500).json({ success: false, message: "Failed to update working-hours status." });
    }
};
//# sourceMappingURL=workingHoursController.js.map