export type { CustomerRow, PasswordResetTokenRow } from "../models/customerModel.js";

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