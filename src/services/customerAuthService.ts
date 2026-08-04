import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import type { CustomerLoginInput, CustomerPasswordResetResult, CustomerRow, RegisterCustomerInput, UpdateCustomerProfileInput } from "../interfaces/customerInterface.js";
import * as customerRepository from "../repositories/customerRepository.js";
import { generateCustomerToken } from "../utils/customerJwt.js";

const DEFAULT_PASSWORD_RESET_MINUTES = 15;

const normalizeEmail = (email: string): string => email.trim().toLowerCase();
const normalizePhone = (phone: string): string => phone.trim();

// Finds a customer by email after normalizing the email value.
export const findCustomerByEmail = async (email: string): Promise<CustomerRow | null> => {
    return customerRepository.findCustomerByEmail(normalizeEmail(email));
};

// Finds a customer by phone after trimming the phone value.
export const findCustomerByPhone = async (phone: string): Promise<CustomerRow | null> => {
    return customerRepository.findCustomerByPhone(normalizePhone(phone));
};

// Registers a customer after enforcing unique email and phone rules.
export const registerCustomer = async (input: RegisterCustomerInput): Promise<CustomerRow | null> => {
    const normalizedEmail = normalizeEmail(input.email);
    const normalizedPhone = normalizePhone(input.phone);

    if (await customerRepository.findCustomerByEmail(normalizedEmail)) {
        throw new Error("A customer with this email already exists.");
    }

    if (await customerRepository.findCustomerByPhone(normalizedPhone)) {
        throw new Error("A customer with this phone number already exists.");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    return customerRepository.createCustomer(
        {
            ...input,
            email: normalizedEmail,
            phone: normalizedPhone,
        },
        passwordHash,
    );
};

// Logs in an active customer and returns a JWT with public account details.
export const loginCustomer = async (input: CustomerLoginInput) => {
    const customer = await customerRepository.findCustomerByEmail(normalizeEmail(input.email));

    if (!customer) {
        return null;
    }

    if (!customer.is_active) {
        throw new Error("Customer account is inactive.");
    }

    const passwordMatches = await bcrypt.compare(input.password, customer.password_hash);

    if (!passwordMatches) {
        return null;
    }

    const token = generateCustomerToken({
        id: customer.id,
        email: customer.email,
        accountType: "customer",
    });

    return {
        token,
        user: {
            id: customer.id,
            name: `${customer.first_name} ${customer.last_name}`,
            email: customer.email,
            phone: customer.phone,
            profileImage: customer.profile_image,
            isActive: Boolean(customer.is_active),
        },
    };
};

// Returns the current customer's profile data.
export const getCustomerProfileById = async (customerId: number): Promise<CustomerRow | null> => {
    return customerRepository.findCustomerProfileById(customerId);
};

// Updates a customer's own profile after enforcing unique email and phone rules.
export const updateCustomerProfileById = async (customerId: number,input: UpdateCustomerProfileInput,): Promise<CustomerRow | null> => {
    const normalizedEmail = normalizeEmail(input.email);
    const normalizedPhone = normalizePhone(input.phone);

    if (await customerRepository.customerEmailExistsForAnotherCustomer(normalizedEmail, customerId)) {
        throw new Error("A customer with this email already exists.");
    }

    if (await customerRepository.customerPhoneExistsForAnotherCustomer(normalizedPhone, customerId)) {
        throw new Error("A customer with this phone number already exists.");
    }

    const updated = await customerRepository.updateCustomerProfile(customerId, {
        ...input,
        email: normalizedEmail,
        phone: normalizedPhone,
    });

    return updated ? customerRepository.findCustomerProfileById(customerId) : null;
};

// Changes a customer password after checking the current password.
export const changeCustomerPassword = async (customerId: number,currentPassword: string,newPassword: string,): Promise<boolean> => {
    const customer = await customerRepository.findCustomerById(customerId);

    if (!customer) {
        return false;
    }

    const passwordMatches = await bcrypt.compare(currentPassword, customer.password_hash);

    if (!passwordMatches) {
        throw new Error("Current password is incorrect.");
    }

    const isSamePassword = await bcrypt.compare(newPassword, customer.password_hash);

    if (isSamePassword) {
        throw new Error("New password must be different from the current password.");
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    return customerRepository.updateCustomerPasswordHash(customerId, newPasswordHash);
};

// Lists all customers for admin/customer-management views.
export const getAllCustomers = async (): Promise<CustomerRow[]> => {
    return customerRepository.findAllCustomers();
};

// Returns one customer by id for admin/customer-management views.
export const getCustomerById = async (customerId: number): Promise<CustomerRow | null> => {
    return customerRepository.findCustomerById(customerId);
};

// Activates or deactivates a customer account.
export const updateCustomerStatusById = async (customerId: number,isActive: boolean,): Promise<CustomerRow | null> => {
    const updated = await customerRepository.updateCustomerStatus(customerId, isActive);

    return updated ? customerRepository.findCustomerById(customerId) : null;
};

export const updateCustomerProfileImageById = async (customerId: number,profileImage: string,): Promise<CustomerRow | null> => {
    const updated = await customerRepository.updateCustomerProfileImage(customerId, profileImage);

    return updated ? customerRepository.findCustomerProfileById(customerId) : null;
};

export const createCustomerPasswordResetToken = async (email: string): Promise<CustomerPasswordResetResult | null> => {
    const customer = await customerRepository.findCustomerByEmail(normalizeEmail(email));

    if (!customer) {
        return null;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    const configuredExpiry = Number(process.env.PASSWORD_RESET_EXPIRES_MINUTES ?? DEFAULT_PASSWORD_RESET_MINUTES);
    const expiresInMinutes = Number.isInteger(configuredExpiry) && configuredExpiry > 0
        ? configuredExpiry
        : DEFAULT_PASSWORD_RESET_MINUTES;
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    await customerRepository.deleteCustomerPasswordResetTokens(customer.id);
    await customerRepository.createCustomerPasswordResetToken(customer.id, tokenHash, expiresAt);

    return {
        resetToken,
        customerEmail: customer.email,
        customerFirstName: customer.first_name,
        expiresInMinutes,
    };
};

export const resetCustomerPassword = async (resetToken: string, newPassword: string): Promise<boolean> => {
    const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    const tokenRecord = await customerRepository.findValidCustomerPasswordResetToken(tokenHash);

    if (!tokenRecord) {
        return false;
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await customerRepository.resetCustomerPasswordWithToken(tokenRecord, passwordHash);

    return true;
};
