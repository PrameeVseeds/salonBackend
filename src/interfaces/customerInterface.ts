import { RowDataPacket } from "mysql2";

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

export interface RegisterCustomerInput {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    password: string;
}

export interface CustomerLoginInput {
    email: string;
    password: string;
}

export interface UpdateCustomerProfileInput {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
}

export interface PasswordResetTokenRow extends RowDataPacket {
    id: number;
    customer_id: number;
    token_hash: string;
    expires_at: Date;
    used_at: Date | null;
}

export interface CustomerJwtPayLoad {
    id: number;
    email: string;
    accountType: "customer";
}

export interface CustomerPasswordResetResult {
    resetToken: string;
    customerEmail: string;
    customerFirstName: string;
    expiresInMinutes: number;
}