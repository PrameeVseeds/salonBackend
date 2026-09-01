import { getString } from "./validationUtils.js";
const getPositiveNumber = (value) => {
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
        return null;
    }
    return value;
};
const validateServicePayload = (body) => {
    const name = getString(body.name);
    const categoryId = Number(body.category_id ?? body.categoryId);
    const description = getString(body.description);
    const durationMinutes = getPositiveNumber(body.duration_minutes ?? body.durationMinutes);
    const price = getPositiveNumber(body.price);
    const imageUrl = getString(body.image_url ?? body.imageUrl);
    const isActive = body.is_active ?? body.isActive;
    const capacityValue = body.max_concurrent_appointments ?? body.maxConcurrentAppointments;
    const maxConcurrentAppointments = capacityValue === null || capacityValue === undefined || capacityValue === ""
        ? null
        : Number(capacityValue);
    if (!name || !description || !imageUrl) {
        return {
            isValid: false,
            message: "Name, description and image URL are required.",
        };
    }
    if (!Number.isInteger(categoryId) || categoryId <= 0) {
        return {
            isValid: false,
            message: "A valid service category is required."
        };
    }
    if (durationMinutes === null || !Number.isInteger(durationMinutes)) {
        return {
            isValid: false,
            message: "Duration must be a positive whole number of minutes.",
        };
    }
    if (price === null) {
        return {
            isValid: false,
            message: "Price must be a positive number.",
        };
    }
    if (typeof isActive !== "boolean") {
        return {
            isValid: false,
            message: "Active status must be true or false.",
        };
    }
    if (maxConcurrentAppointments !== null && (!Number.isInteger(maxConcurrentAppointments) || maxConcurrentAppointments <= 0)) {
        return {
            isValid: false,
            message: "Appointment capacity must be a positive whole number or left automatic.",
        };
    }
    return {
        isValid: true,
        data: {
            category_id: categoryId,
            name,
            description,
            duration_minutes: durationMinutes,
            price,
            image_url: imageUrl,
            is_active: isActive,
            max_concurrent_appointments: maxConcurrentAppointments,
        },
    };
};
export const validateRegisterService = (body) => validateServicePayload(body);
export const validateUpdateService = (body) => validateServicePayload(body);
export const validateServiceId = (id) => {
    if (Array.isArray(id)) {
        return {
            isValid: false,
            message: "Invalid service ID.",
        };
    }
    const serviceId = Number(id);
    if (!Number.isInteger(serviceId) || serviceId <= 0) {
        return {
            isValid: false,
            message: "Invalid service ID.",
        };
    }
    return {
        isValid: true,
        data: serviceId,
    };
};
export const validateServiceStatus = (body) => {
    const isActive = body.is_active ?? body.isActive;
    if (typeof isActive !== "boolean") {
        return {
            isValid: false,
            message: "Active status must be true or false.",
        };
    }
    return {
        isValid: true,
        data: isActive,
    };
};
//# sourceMappingURL=serviceValidator.js.map