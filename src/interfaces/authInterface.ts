export type { UserRoles, UserRow } from "../models/userModel.js";
import type { UserRoles } from "../models/userModel.js";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface UpdateProfileInput {
    firstName: string;
    lastName: string;
    email: string;
}

export interface JwtPayload {
    id: number;
    first_name: string;
    last_name: string
    email: string;
    role: UserRoles;
}