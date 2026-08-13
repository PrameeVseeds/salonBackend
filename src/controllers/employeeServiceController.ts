import type { Request, Response } from "express";
import * as assignmentService from "../services/employeeServiceAssignmentService.js";
import { formatService } from "../utils/mappers/serviceMapper.js";
import { sendBadRequest } from "../utils/responseHelper.js";
import { validateEmployeeId } from "../validators/employeeValidator.js";
import { validateEmployeeServiceIds } from "../validators/employeeServiceValidator.js";

type EmployeeServiceParams = { employeeId: string; serviceId: string };

export const assignService = async (req: Request<EmployeeServiceParams>,res: Response,): Promise<void> => {
    const validation = validateEmployeeServiceIds(req.params.employeeId, req.params.serviceId);
    if (!validation.isValid) {
        sendBadRequest(res, validation.message);
        return;
    }

    try {
        await assignmentService.assignServiceToEmployee(
            validation.data.employeeId,
            validation.data.serviceId,
        );
        res.status(201).json({
            success: true,
            message: "Service assigned to employee successfully.",
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to assign service.";
        const statusCode = message.includes("already assigned") ? 409
            : message.includes("not found") ? 404
            : 500;
        res.status(statusCode).json({ success: false, message });
    }
};

export const getEmployeeServices = async (req: Request<{ employeeId: string }>,res: Response): Promise<void> => {
    const validation = validateEmployeeId(req.params.employeeId);
    if (!validation.isValid) {
        sendBadRequest(res, validation.message);
        return;
    }

    try {
        const services = await assignmentService.getEmployeeServices(validation.data);
        if (services === null) {
            res.status(404).json({ success: false, message: "Employee not found." });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Employee services retrieved successfully.",
            data: { services: services.map(formatService) },
        });
    } catch {
        res.status(500).json({ success: false, message: "Failed to retrieve employee services." });
    }
};

export const removeService = async (req: Request<EmployeeServiceParams>,res: Response,): Promise<void> => {
    const validation = validateEmployeeServiceIds(req.params.employeeId, req.params.serviceId);
    if (!validation.isValid) {
        sendBadRequest(res, validation.message);
        return;
    }

    try {
        const removed = await assignmentService.removeServiceFromEmployee(
            validation.data.employeeId,
            validation.data.serviceId,
        );
        if (removed === null) {
            res.status(404).json({ success: false, message: "Employee not found." });
            return;
        }
        if (!removed) {
            res.status(404).json({
                success: false,
                message: "Service is not assigned to this employee.",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Service removed from employee successfully.",
        });
    } catch {
        res.status(500).json({ success: false, message: "Failed to remove employee service." });
    }
};
