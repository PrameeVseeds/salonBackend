export type { AdminRow } from "../models/adminModel.js";

export interface CreateAdminRequest {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}

export interface UpdateAdminRequest {
    first_name: string;
    last_name: string;
    email: string;
    password?: string;
    is_active: boolean;
}