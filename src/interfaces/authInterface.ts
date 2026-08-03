import { RowDataPacket } from "mysql2";

export type UserRoles = "super_admin" | "admin";

export interface UserRow extends RowDataPacket {
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

export interface LoginRequest {
    email: string;
    password: string;
}

export interface JwtPayload {
    id: number;
    email: string;
    role: UserRoles;
}