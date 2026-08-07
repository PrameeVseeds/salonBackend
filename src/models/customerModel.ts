import type { RowDataPacket } from "mysql2";

export interface CustomerRow extends RowDataPacket {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    password_hash: string;
    profile_image: string | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface PasswordResetTokenRow extends RowDataPacket {
    id: number;
    customer_id: number;
    token_hash: string;
    expires_at: Date;
    used_at: Date | null;
}
