import { ServiceRow } from "../../models/serviceModel.js";

export const formatService = (service: ServiceRow) => ({
    id: service.id,
    name: service.name,
    description: service.description ?? "",
    durationMinutes: service.duration_minutes,
    price: service.price,
    imageUrl: service.image_url ?? "",
    isActive: Boolean(service.is_active),
    maxConcurrentAppointments: service.max_concurrent_appointments,
    assignedEmployeeCount: Number(service.assigned_employee_count ?? 0),
    createdAt: service.created_at,
    updatedAt: service.updated_at,
    subServices: (service.sub_services ?? []).map((item) => ({
        id: item.id,
        serviceId: item.service_id,
        name: item.name,
        durationMinutes: Number(item.duration_minutes),
        price: Number(item.price),
        imageUrl: item.image_url,
        isActive: Boolean(item.is_active),
        createdAt: item.created_at,
        updatedAt: item.updated_at,
    })),
})
