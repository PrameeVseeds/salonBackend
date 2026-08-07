import type { UserRow } from "../models/userModel.js";

// Converts database user rows into API-safe profile response objects.
export const formatUserProfile = (user: UserRow) => ({
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    role: user.role,
    isActive: Boolean(user.is_active),
    createdAt: user.created_at,
    updatedAt: user.updated_at,
});
