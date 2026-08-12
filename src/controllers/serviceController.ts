import type { Request, Response } from "express";
import * as serviceService from "../services/serviceService.js";
import { formatService } from "../utils/mappers/serviceMapper.js";
import { sendBadRequest } from "../utils/responseHelper.js";
import * as serviceValidator from "../validators/serviceValidator.js";

export const createService = async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = serviceValidator.validateRegisterService(req.body);
        if (!validation.isValid) {
            sendBadRequest(res, validation.message);
            return;
        }

        const service = await serviceService.createService(validation.data);
        if (!service) {
            res.status(500).json({ success: false, message: "Failed to create service." });
            return;
        }

        res.status(201).json({
            success: true,
            message: "Service created successfully.",
            data: { service: formatService(service) },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create service.";
        res.status(message.includes("already exists") ? 409 : 500).json({ success: false, message });
    }
};

export const getAllServices = async (_req: Request, res: Response): Promise<void> => {
    try {
        const services = await serviceService.getAllServices();
        res.status(200).json({
            success: true,
            message: "Services retrieved successfully.",
            data: { services: services.map(formatService) },
        });
    } catch {
        res.status(500).json({ success: false, message: "Failed to retrieve services." });
    }
};

export const getServiceById = async (req: Request<{ id: string }>,res: Response,): Promise<void> => {
    try {
        const validation = serviceValidator.validateServiceId(req.params.id);
        if (!validation.isValid) {
            sendBadRequest(res, validation.message);
            return;
        }

        const service = await serviceService.getServiceById(validation.data);
        if (!service) {
            res.status(404).json({ success: false, message: "Service not found." });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Service retrieved successfully.",
            data: { service: formatService(service) },
        });
    } catch {
        res.status(500).json({ success: false, message: "Failed to retrieve service." });
    }
};

export const updateService = async (req: Request<{ id: string }>,res: Response,): Promise<void> => {
    try {
        const idValidation = serviceValidator.validateServiceId(req.params.id);
        const bodyValidation = serviceValidator.validateUpdateService(req.body);

        if (!idValidation.isValid) {
            sendBadRequest(res, idValidation.message);
            return;
        }
        if (!bodyValidation.isValid) {
            sendBadRequest(res, bodyValidation.message);
            return;
        }

        const service = await serviceService.updateServiceById(
            idValidation.data,
            bodyValidation.data,
        );
        if (!service) {
            res.status(404).json({ success: false, message: "Service not found." });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Service updated successfully.",
            data: { service: formatService(service) },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update service.";
        res.status(message.includes("already exists") ? 409 : 500).json({ success: false, message });
    }
};

export const updateServiceStatus = async (req: Request<{ id: string }>,res: Response,): Promise<void> => {
    try {
        const idValidation = serviceValidator.validateServiceId(req.params.id);
        const statusValidation = serviceValidator.validateServiceStatus(req.body);

        if (!idValidation.isValid) {
            sendBadRequest(res, idValidation.message);
            return;
        }
        if (!statusValidation.isValid) {
            sendBadRequest(res, statusValidation.message);
            return;
        }

        const service = await serviceService.updateServiceStatusById(
            idValidation.data,
            statusValidation.data,
        );
        if (!service) {
            res.status(404).json({ success: false, message: "Service not found." });
            return;
        }

        res.status(200).json({
            success: true,
            message: statusValidation.data
                ? "Service activated successfully."
                : "Service deactivated successfully.",
            data: { service: formatService(service) },
        });
    } catch {
        res.status(500).json({ success: false, message: "Failed to update service status." });
    }
};

export const deleteService = async (req: Request<{ id: string }>, res: Response,): Promise<void> => {
    try {
        const validation = serviceValidator.validateServiceId(req.params.id);
        if (!validation.isValid) {
            sendBadRequest(res, validation.message);
            return;
        }

        if (!(await serviceService.deleteServiceById(validation.data))) {
            res.status(404).json({ success: false, message: "Service not found." });
            return;
        }

        res.status(200).json({ success: true, message: "Service deleted successfully." });
    } catch {
        res.status(500).json({ success: false, message: "Failed to delete service." });
    }
};
