import type { Response } from "express";

export const sendBadRequest = (res: Response, message: string): void => {
    res.status(400).json({
        success: false,
        message,
    });
};
