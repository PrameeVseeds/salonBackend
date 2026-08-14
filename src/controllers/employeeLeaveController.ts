import type { Request, Response } from "express";
import * as leaveService from "../services/employeeLeaveService.js";
import { formatEmployeeLeave } from "../utils/mappers/employeeLeaveMapper.js";
import { sendBadRequest } from "../utils/responseHelper.js";
import { validateEmployeeId } from "../validators/employeeValidator.js";
import { validateEmployeeLeave, validateEmployeeLeaveId, validateLeaveDate } from "../validators/employeeLeaveValidator.js";

export const createLeave = async (req: Request, res: Response): Promise<void> => {
    const validation = validateEmployeeLeave(req.body ?? {});
    if (!validation.isValid) return sendBadRequest(res, validation.message);
    try {
        const leave = await leaveService.createLeave(validation.data);
        res.status(201).json({ success: true, message: "Employee leave created successfully.", data: { leave: leave && formatEmployeeLeave(leave) } });
    } 
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create employee leave.";
        res.status(message === "Employee not found." ? 404 : 500).json({ success: false, message });
    }
};

export const getLeaves = async (_req: Request, res: Response): Promise<void> => {
    try {
        const leaves = await leaveService.getLeaves();
        res.status(200).json({ success: true, message: "Employee leaves retrieved successfully.", data: { leaves: leaves.map(formatEmployeeLeave) } });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to retrieve employee leaves.";
        res.status(500).json({ success: false, message });
    }
};

export const getLeave = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const validation = validateEmployeeLeaveId(req.params.id);
    if (!validation.isValid) return sendBadRequest(res, "Invalid employee leave ID.");
    try {
        const leave = await leaveService.getLeave(validation.data);
        if (!leave) { res.status(404).json({ success: false, message: "Employee leave not found." }); return; }
        res.status(200).json({ success: true, message: "Employee leave retrieved successfully.", data: { leave: formatEmployeeLeave(leave) } });
    } 
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to retrieve employee leave.";
        res.status(500).json({ success: false, message });
    }
};

export const updateLeave = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const id = validateEmployeeLeaveId(req.params.id);
    const body = validateEmployeeLeave(req.body ?? {});
    if (!id.isValid) return sendBadRequest(res, "Invalid employee leave ID.");
    if (!body.isValid) return sendBadRequest(res, body.message);
    try {
        const leave = await leaveService.updateLeave(id.data, body.data);
        if (!leave) { res.status(404).json({ success: false, message: "Employee leave not found." }); return; }
        res.status(200).json({ success: true, message: "Employee leave updated successfully.", data: { leave: formatEmployeeLeave(leave) } });
    } 
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update employee leave.";
        res.status(message === "Employee not found." ? 404 : 500).json({ success: false, message });
    }
};

export const deleteLeave = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const validation = validateEmployeeLeaveId(req.params.id);
    if (!validation.isValid) return sendBadRequest(res, "Invalid employee leave ID.");
    try {
        if (!(await leaveService.deleteLeave(validation.data))) { res.status(404).json({ success: false, message: "Employee leave not found." }); return; }
        res.status(200).json({ success: true, message: "Employee leave deleted successfully." });
    } 
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to delete employee leave.";
        res.status(500).json({ success: false, message });
    }
};

export const getEmployeeLeaves = async (req: Request<{ employeeId: string }>, res: Response): Promise<void> => {
    const employee = validateEmployeeId(req.params.employeeId);
    const date = validateLeaveDate(req.query.date);
    if (!employee.isValid) return sendBadRequest(res, employee.message);
    if (!date.isValid) return sendBadRequest(res, date.message);
    try {
        const leaves = await leaveService.getEmployeeLeaves(employee.data, date.data);
        if (leaves === null) { res.status(404).json({ success: false, message: "Employee not found." }); return; }
        res.status(200).json({ success: true, message: "Employee leaves retrieved successfully.", data: { leaves: leaves.map(formatEmployeeLeave) } });
    } 
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to retrieve employee leaves.";
        res.status(500).json({ success: false, message });
    }
};
