import { ServiceRow } from "../../models/serviceModel.js";

export const formatService = (service: ServiceRow) => ({
    id: service.id,
    name: service.name,
    description: service.description,
    durationMinutes: service.duration_minutes,
    price: service.price,
    imageUrl: service.image_url,
    isActive: Boolean(service.is_active),
    createdAt: service.created_at,
    updatedAt: service.updated_at,
})