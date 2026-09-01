import * as serviceService from "../services/serviceService.js";
import { formatService } from "../utils/mappers/serviceMapper.js";
import { sendBadRequest } from "../utils/responseHelper.js";
import * as serviceValidator from "../validators/serviceValidator.js";
const parseSubService = (body) => {
    const name = String(body.name ?? "").trim();
    const duration = Number(body.durationMinutes ?? body.duration_minutes);
    const price = Number(body.price);
    const imageUrl = String(body.imageUrl ?? body.image_url ?? "").trim();
    if (!name || !Number.isInteger(duration) || duration <= 0 || !Number.isFinite(price) || price < 0 || !imageUrl)
        return null;
    return { name, duration_minutes: duration, price, image_url: imageUrl, is_active: body.isActive !== false && body.is_active !== false };
};
const formatSubService = (item) => ({
    id: item.id, serviceId: item.service_id, name: item.name,
    durationMinutes: Number(item.duration_minutes), price: Number(item.price),
    imageUrl: item.image_url, isActive: Boolean(item.is_active),
    createdAt: item.created_at, updatedAt: item.updated_at,
});
export const uploadImage = async (req, res) => {
    if (!req.file) {
        sendBadRequest(res, "Service image is required.");
        return;
    }
    res.status(201).json({
        success: true,
        message: "Service image uploaded successfully.",
        data: { imageUrl: `/uploads/services/${req.file.filename}` },
    });
};
export const createService = async (req, res) => {
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
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create service.";
        res.status(message.includes("already exists") ? 409 : message.includes("capacity") ? 400 : 500).json({ success: false, message });
    }
};
export const getAllServices = async (_req, res) => {
    try {
        const services = await serviceService.getAllServices();
        res.status(200).json({
            success: true,
            message: "Services retrieved successfully.",
            data: { services: services.map(formatService) },
        });
    }
    catch {
        res.status(500).json({ success: false, message: "Failed to retrieve services." });
    }
};
export const getServiceById = async (req, res) => {
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
    }
    catch {
        res.status(500).json({ success: false, message: "Failed to retrieve service." });
    }
};
export const updateService = async (req, res) => {
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
        const service = await serviceService.updateServiceById(idValidation.data, bodyValidation.data);
        if (!service) {
            res.status(404).json({ success: false, message: "Service not found." });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Service updated successfully.",
            data: { service: formatService(service) },
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update service.";
        res.status(message.includes("already exists") ? 409 : message.includes("capacity") ? 400 : 500).json({ success: false, message });
    }
};
export const updateServiceStatus = async (req, res) => {
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
        const service = await serviceService.updateServiceStatusById(idValidation.data, statusValidation.data);
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
    }
    catch {
        res.status(500).json({ success: false, message: "Failed to update service status." });
    }
};
export const deleteService = async (req, res) => {
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
    }
    catch {
        res.status(500).json({ success: false, message: "Failed to delete service." });
    }
};
export const createSubService = async (req, res) => {
    try {
        const serviceId = Number(req.params.id);
        const input = parseSubService(req.body);
        if (!Number.isInteger(serviceId) || serviceId <= 0 || !input)
            return sendBadRequest(res, "Name, duration, price and image are required.");
        const item = await serviceService.createSubService(serviceId, input);
        if (!item) {
            res.status(404).json({ success: false, message: "Service not found." });
            return;
        }
        res.status(201).json({ success: true, message: "Sub-service created successfully.", data: { subService: formatSubService(item) } });
    }
    catch (error) {
        const message = error instanceof Error && error.message.includes("Duplicate") ? "A sub-service with this name already exists." : "Failed to create sub-service.";
        res.status(message.includes("already") ? 409 : 500).json({ success: false, message });
    }
};
export const updateSubService = async (req, res) => {
    try {
        const serviceId = Number(req.params.id), id = Number(req.params.subServiceId);
        const input = parseSubService(req.body);
        if (![serviceId, id].every((value) => Number.isInteger(value) && value > 0) || !input)
            return sendBadRequest(res, "Name, duration, price and image are required.");
        const item = await serviceService.updateSubService(serviceId, id, input);
        if (!item) {
            res.status(404).json({ success: false, message: "Sub-service not found." });
            return;
        }
        res.status(200).json({ success: true, message: "Sub-service updated successfully.", data: { subService: formatSubService(item) } });
    }
    catch {
        res.status(500).json({ success: false, message: "Failed to update sub-service." });
    }
};
export const deleteSubService = async (req, res) => {
    try {
        const serviceId = Number(req.params.id), id = Number(req.params.subServiceId);
        if (![serviceId, id].every((value) => Number.isInteger(value) && value > 0))
            return sendBadRequest(res, "Invalid sub-service ID.");
        if (!(await serviceService.deleteSubService(serviceId, id))) {
            res.status(404).json({ success: false, message: "Sub-service not found." });
            return;
        }
        res.status(200).json({ success: true, message: "Sub-service deleted successfully." });
    }
    catch {
        res.status(500).json({ success: false, message: "Failed to delete sub-service." });
    }
};
//# sourceMappingURL=serviceController.js.map