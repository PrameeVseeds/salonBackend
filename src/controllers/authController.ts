import type { Request, Response } from "express";
import { loginUser } from "../services/authService.js";
import { AuthenticationRequest } from "../middleware/authMiddleware.js";

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
            return;
        }

        const result = await loginUser({ email, password });

        if (!result) {
            res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Login successful.",
            data: result,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Login failed.";

        res.status(500).json({
            success: false,
            message,
        });
    }
};

export const getProfile = (req: AuthenticationRequest, res: Response): void => {
    res.status(200).json({
        success: true,
        message: "User profile retrieved successfully.",
        data: {
            user: req.user,
        },
    });
};