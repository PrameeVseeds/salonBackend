import type { Request, Response } from "express";
import * as service from "../services/businessBreakService.js";
import { formatBusinessBreak } from "../utils/mappers/businessBreakMapper.js";
import { sendBadRequest } from "../utils/responseHelper.js";
import { validateBusinessBreak, validateBusinessBreakDate, validateBusinessBreakId } from "../validators/businessBreakValidator.js";

export const create = async (req: Request, res: Response): Promise<void> => {
    const validation = validateBusinessBreak(req.body ?? {});
    if (!validation.isValid) return sendBadRequest(res, validation.message);
    try {
        const businessBreak = await service.createBusinessBreak(validation.data);
        res.status(201).json(
            {
                success: true, message: "Business break created successfully.",
                data: { businessBreak: businessBreak && formatBusinessBreak(businessBreak) }
            });
    }
    catch {
        res.status(500).json(
            { success: false, message: "Failed to create business break." }
        );
    }
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
    const date = validateBusinessBreakDate(req.query.date);
    if (!date.isValid) return sendBadRequest(res, date.message);
    try {
        const breaks = await service.getBusinessBreaks(date.data);
        res.status(200).json(
            {
                success: true, message: "Business breaks retrieved successfully.",
                data: { businessBreaks: breaks.map(formatBusinessBreak) }
            });
    }
    catch {
        res.status(500).json(
            { success: false, message: "Failed to retrieve business breaks." }
        );
    }
};

export const getById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const validation = validateBusinessBreakId(req.params.id);
    if (!validation.isValid) return sendBadRequest(res, validation.message);
    try {
        const businessBreak = await service.getBusinessBreakById(validation.data);
        if (!businessBreak) { res.status(404).json({ success: false, message: "Business break not found." }); return; }
        res.status(200).json(
            {
                success: true, message: "Business break retrieved successfully.",
                data: { businessBreak: formatBusinessBreak(businessBreak) }
            });
    }
    catch {
        res.status(500).json(
            { success: false, message: "Failed to retrieve business break." }
        );
    }
};

export const update = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const id = validateBusinessBreakId(req.params.id);
    const body = validateBusinessBreak(req.body ?? {});
    if (!id.isValid) return sendBadRequest(res, id.message);
    if (!body.isValid) return sendBadRequest(res, body.message);
    try {
        const businessBreak = await service.updateBusinessBreak(id.data, body.data);
        if (!businessBreak) { res.status(404).json({ success: false, message: "Business break not found." }); return; }
        res.status(200).json(
            {
                success: true, message: "Business break updated successfully.",
                data: { businessBreak: formatBusinessBreak(businessBreak) }
            });
    }
    catch {
        res.status(500).json(
            { success: false, message: "Failed to update business break." }
        );
    }
};

export const remove = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const validation = validateBusinessBreakId(req.params.id);
    if (!validation.isValid) return sendBadRequest(res, validation.message);
    try {
        if (!(await service.deleteBusinessBreak(validation.data))) { res.status(404).json({ success: false, message: "Business break not found." }); return; }
        res.status(200).json(
            { success: true, message: "Business break deleted successfully." }
        );
    }
    catch {
        res.status(500).json(
            { success: false, message: "Failed to delete business break." }
        );
    }
};
