import { RowDataPacket } from "mysql2";
import { UserRoles } from "./authInterface.js";

export interface AdminRow extends RowDataPacket {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    password_hash: string;
    role: UserRoles;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

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