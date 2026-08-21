import type { RowDataPacket } from "mysql2";

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

export interface UserPasswordResetTokenRow extends RowDataPacket {
    id: number;
    user_id: number;
    token_hash: string;
    expires_at: Date;
    used_at: Date | null;
}
