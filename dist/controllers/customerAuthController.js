import { unlink } from "node:fs/promises";
import path from "node:path";
import { sendCustomerPasswordResetEmail } from "../services/emailService.js";
import { formatCustomer } from "../utils/mappers/customerMapper.js";
import { sendBadRequest } from "../utils/responseHelper.js";
import { changeCustomerPassword, createCustomerPasswordResetToken, getCustomerProfileById, loginCustomer, registerCustomer, resetCustomerPassword, updateCustomerProfileById, updateCustomerProfileImageById, } from "../services/customerAuthService.js";
import { validateChangeCustomerPassword, validateCustomerLogin, validateForgotCustomerPassword, validateRegisterCustomer, validateResetCustomerPassword, validateUpdateCustomerProfile, } from "../validators/customerValidator.js";
const getAuthenticatedCustomerId = (req) => {
    return req.customer?.id ?? null;
};
const deleteUploadedFile = async (filePath) => {
    if (filePath) {
        await unlink(filePath).catch(() => undefined);
    }
};
// Deletes a customer's previous profile image from local storage.
const deleteCustomerImage = async (imagePath) => {
    if (!imagePath?.startsWith("/uploads/customers/")) {
        return;
    }
    const absolutePath = path.resolve("uploads", "customers", path.basename(imagePath));
    try {
        await unlink(absolutePath);
    }
    catch (error) {
        const errorCode = error instanceof Error && "code" in error ? error.code : undefined;
        if (errorCode !== "ENOENT") {
            throw error;
        }
    }
};
// Registers a new customer account.
export const register = async (req, res) => {
    try {
        const validation = validateRegisterCustomer(req.body);
        if (!validation.isValid) {
            sendBadRequest(res, validation.message);
            return;
        }
        const customer = await registerCustomer(validation.data);
        if (!customer) {
            res.status(500).json({
                success: false,
                message: "Failed to create customer account.",
            });
            return;
        }
        res.status(201).json({
            success: true,
            message: "Customer registered successfully.",
            data: {
                customer: formatCustomer(customer),
            },
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create customer account.";
        const statusCode = message.includes("already exists") ? 409 : 500;
        res.status(statusCode).json({
            success: false,
            message,
        });
    }
};
// Customer login.
export const login = async (req, res) => {
    try {
        const validation = validateCustomerLogin(req.body);
        if (!validation.isValid) {
            sendBadRequest(res, validation.message);
            return;
        }
        const result = await loginCustomer(validation.data);
        if (!result) {
            res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Customer login successful.",
            data: result,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Customer login failed.";
        const statusCode = message === "Customer account is inactive." ? 403 : 500;
        res.status(statusCode).json({
            success: false,
            message,
        });
    }
};
// View customer's profile.
export const getProfile = async (req, res) => {
    try {
        const customerId = getAuthenticatedCustomerId(req);
        if (!customerId) {
            res.status(401).json({
                success: false,
                message: "Customer is not authenticated.",
            });
            return;
        }
        const customer = await getCustomerProfileById(customerId);
        if (!customer) {
            res.status(404).json({
                success: false,
                message: "Customer account not found.",
            });
            return;
        }
        if (!customer.is_active) {
            res.status(403).json({
                success: false,
                message: "Customer account is inactive.",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Profile retrieved successfully.",
            data: {
                customer: formatCustomer(customer),
            },
        });
    }
    catch {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve profile.",
        });
    }
};
// Updates the customer's profile.
export const updateCustomerProfile = async (req, res) => {
    try {
        const customerId = getAuthenticatedCustomerId(req);
        const validation = validateUpdateCustomerProfile(req.body);
        if (!customerId) {
            res.status(401).json({
                success: false,
                message: "Customer is not authenticated.",
            });
            return;
        }
        if (!validation.isValid) {
            sendBadRequest(res, validation.message);
            return;
        }
        const updatedCustomer = await updateCustomerProfileById(customerId, validation.data);
        if (!updatedCustomer) {
            res.status(404).json({
                success: false,
                message: "Customer account not found.",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Customer profile updated successfully.",
            data: {
                customer: formatCustomer(updatedCustomer),
            },
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update customer profile.";
        const statusCode = message.includes("already exists") ? 409 : 500;
        res.status(statusCode).json({
            success: false,
            message,
        });
    }
};
// Changes the customer's password.
export const changePassword = async (req, res) => {
    try {
        const customerId = getAuthenticatedCustomerId(req);
        const validation = validateChangeCustomerPassword(req.body);
        if (!customerId) {
            res.status(401).json({
                success: false,
                message: "Customer is not authenticated.",
            });
            return;
        }
        if (!validation.isValid) {
            sendBadRequest(res, validation.message);
            return;
        }
        const passwordChanged = await changeCustomerPassword(customerId, validation.data.currentPassword, validation.data.newPassword);
        if (!passwordChanged) {
            res.status(404).json({
                success: false,
                message: "Customer account not found.",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Customer password changed successfully.",
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to change customer password.";
        const statusCode = message === "Current password is incorrect." || message.includes("different") ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            message,
        });
    }
};
// Updates the customer's profile image.
export const updateProfileImage = async (req, res) => {
    const uploadedFilePath = req.file ? path.resolve("uploads", "customers", req.file.filename) : null;
    try {
        const customerId = getAuthenticatedCustomerId(req);
        if (!customerId) {
            await deleteUploadedFile(uploadedFilePath);
            res.status(401).json({
                success: false,
                message: "Customer is not authenticated.",
            });
            return;
        }
        if (!req.file) {
            sendBadRequest(res, "Profile image is required.");
            return;
        }
        const existingCustomer = await getCustomerProfileById(customerId);
        if (!existingCustomer) {
            await deleteUploadedFile(uploadedFilePath);
            res.status(404).json({
                success: false,
                message: "Customer account not found.",
            });
            return;
        }
        const newProfileImage = `/uploads/customers/${req.file.filename}`;
        const updatedCustomer = await updateCustomerProfileImageById(customerId, newProfileImage);
        if (!updatedCustomer) {
            await deleteUploadedFile(uploadedFilePath);
            res.status(404).json({
                success: false,
                message: "Customer account not found.",
            });
            return;
        }
        await deleteCustomerImage(existingCustomer.profile_image);
        res.status(200).json({
            success: true,
            message: "Profile image updated successfully.",
            data: {
                profileImage: updatedCustomer.profile_image,
            },
        });
    }
    catch {
        await deleteUploadedFile(uploadedFilePath);
        res.status(500).json({
            success: false,
            message: "Failed to update profile image.",
        });
    }
};
// Customer forgot-password email flow.
export const forgotPassword = async (req, res) => {
    try {
        const validation = validateForgotCustomerPassword(req.body);
        if (!validation.isValid) {
            sendBadRequest(res, validation.message);
            return;
        }
        const resetResult = await createCustomerPasswordResetToken(validation.data);
        if (resetResult) {
            const frontendUrl = process.env.FRONTEND_URL;
            if (!frontendUrl) {
                throw new Error("FRONTEND_URL is not configured.");
            }
            const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(resetResult.resetToken)}`;
            await sendCustomerPasswordResetEmail({
                email: resetResult.customerEmail,
                firstName: resetResult.customerFirstName,
                resetUrl,
                expiresInMinutes: resetResult.expiresInMinutes,
            });
        }
        res.status(200).json({
            success: true,
            message: "If an account exists with this email, password reset instructions have been sent.",
        });
    }
    catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to process password reset request.",
        });
    }
};
// Customer password reset using a reset token.
export const resetPassword = async (req, res) => {
    try {
        const validation = validateResetCustomerPassword(req.body);
        if (!validation.isValid) {
            sendBadRequest(res, validation.message);
            return;
        }
        const passwordReset = await resetCustomerPassword(validation.data.token, validation.data.newPassword);
        if (!passwordReset) {
            res.status(400).json({
                success: false,
                message: "Reset token is invalid or expired.",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Password reset successfully.",
        });
    }
    catch {
        res.status(500).json({
            success: false,
            message: "Failed to reset password.",
        });
    }
};
//# sourceMappingURL=customerAuthController.js.map