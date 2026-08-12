import type { Request, Response } from "express";
import {findCustomerByEmail,getAllCustomers,getCustomerById,updateCustomerStatusById,} from "../services/customerAuthService.js";
import { formatCustomer } from "../utils/mappers/customerMapper.js";
import { sendBadRequest } from "../utils/responseHelper.js";
import {validateCustomerEmail,validateCustomerId,validateCustomerStatus,} from "../validators/customerValidator.js";

// Get customers.
export const getCustomers = async (_req: Request, res: Response): Promise<void> => {
    try {
        const customers = await getAllCustomers();

        res.status(200).json({
            success: true,
            message: "Customers retrieved successfully.",
            data: {
                customers: customers.map(formatCustomer),
            },
        });
    }
    catch {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve customers.",
        });
    }
};

// Get by id.
export const getCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = validateCustomerId(req.params.id);

        if (!validation.isValid) {
            sendBadRequest(res, validation.message);
            return;
        }

        const customer = await getCustomerById(validation.data);

        if (!customer) {
            res.status(404).json({
                success: false,
                message: "Customer not found.",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Customer retrieved successfully.",
            data: {
                customer: formatCustomer(customer),
            },
        });
    }
    catch {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve customer.",
        });
    }
};

// Get by email.
export const getCustomerUsingEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = validateCustomerEmail(req.query.email);

        if (!validation.isValid) {
            sendBadRequest(res, validation.message);
            return;
        }

        const customer = await findCustomerByEmail(validation.data);

        if (!customer) {
            res.status(404).json({
                success: false,
                message: "Customer not found.",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Customer retrieved successfully.",
            data: {
                customer: formatCustomer(customer),
            },
        });
    }
    catch {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve customer.",
        });
    }
};

// Activates or deactivates a customer account.
export const updateCustomerStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const idValidation = validateCustomerId(req.params.id);
        const statusValidation = validateCustomerStatus(req.body);

        if (!idValidation.isValid) {
            sendBadRequest(res, idValidation.message);
            return;
        }

        if (!statusValidation.isValid) {
            sendBadRequest(res, statusValidation.message);
            return;
        }

        const updatedCustomer = await updateCustomerStatusById(idValidation.data, statusValidation.data);

        if (!updatedCustomer) {
            res.status(404).json({
                success: false,
                message: "Customer not found.",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: statusValidation.data ? "Customer activated successfully." : "Customer deactivated successfully.",
            data: {
                customer: formatCustomer(updatedCustomer),
            },
        });
    }
    catch {
        res.status(500).json({
            success: false,
            message: "Failed to update customer status.",
        });
    }
};
