import type { Request, Response } from "express";
import * as service from "../services/closedDateService.js";
import { formatClosedDate } from "../utils/mappers/closedDateMapper.js";
import { sendBadRequest } from "../utils/responseHelper.js";
import { validateClosedDate, validateClosedDateId, validateClosedDateQuery } from "../validators/closedDateValidator.js";

export const create = async (req: Request, res: Response): Promise<void> => {
    const validation = validateClosedDate(req.body ?? {});
    if (!validation.isValid) return sendBadRequest(res, validation.message);
    try {
        const closedDate = await service.createClosedDate(validation.data);
        res.status(201).json(
            {
                success: true, message: "Closed date created successfully.",
                data: { closedDate: closedDate && formatClosedDate(closedDate) }
            });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create closed date.";
        res.status(message.includes("already closed") ? 409 : 500).json({ success: false, message });
    }
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
    const date = validateClosedDateQuery(req.query.date);
    if (!date.isValid) return sendBadRequest(res, date.message);
    try {
        const dates = await service.getClosedDates(date.data);
        res.status(200).json(
            {
                success: true, message: "Closed dates retrieved successfully.",
                data: { closedDates: dates.map(formatClosedDate) }
            });
    } catch {
        res.status(500).json(
            { success: false, message: "Failed to retrieve closed dates." }
        );
    }
};

export const getById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const validation = validateClosedDateId(req.params.id);
    if (!validation.isValid) return sendBadRequest(res, validation.message);
    try {
        const closedDate = await service.getClosedDateById(validation.data);
        if (!closedDate) { res.status(404).json({ success: false, message: "Closed date not found." }); return; }
        res.status(200).json(
            {
                success: true, message: "Closed date retrieved successfully.",
                data: { closedDate: formatClosedDate(closedDate) }
            }
        );
    }
    catch {
        res.status(500).json(
            { success: false, message: "Failed to retrieve closed date." }
        );
    }
};

export const update = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const id = validateClosedDateId(req.params.id);
    const body = validateClosedDate(req.body ?? {});
    if (!id.isValid) return sendBadRequest(res, id.message);
    if (!body.isValid) return sendBadRequest(res, body.message);
    try {
        const closedDate = await service.updateClosedDate(id.data, body.data);
        if (!closedDate) { res.status(404).json({ success: false, message: "Closed date not found." }); return; }
        res.status(200).json(
            {
                success: true, message: "Closed date updated successfully.",
                data: { closedDate: formatClosedDate(closedDate) }
            });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update closed date.";
        res.status(message.includes("already closed") ? 409 : 500).json({ success: false, message });
    }
};

export const remove = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const validation = validateClosedDateId(req.params.id);
    if (!validation.isValid) return sendBadRequest(res, validation.message);
    try {
        if (!(await service.deleteClosedDate(validation.data))) { res.status(404).json({ success: false, message: "Closed date not found." }); return; }
        res.status(200).json({ success: true, message: "Closed date deleted successfully." });
    }
    catch {
        res.status(500).json(
            { success: false, message: "Failed to delete closed date." }
        );
    }
};
