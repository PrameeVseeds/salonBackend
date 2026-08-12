import type { AdminRow } from "../../models/adminModel.js";

// Converts database admin rows into API-safe response objects.
export const formatAdmin = (admin: AdminRow) => ({
    id: admin.id,
    firstName: admin.first_name,
    lastName: admin.last_name,
    email: admin.email,
    role: admin.role,
    isActive: Boolean(admin.is_active),
    createdAt: admin.created_at,
    updatedAt: admin.updated_at,
});
