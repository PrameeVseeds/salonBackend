import { NextFunction, Response } from "express";
import type { UserRoles } from "../models/userModel.js";
import { AuthenticationRequest } from "./authMiddleware.js";

export const authorizeRoles = (...allowedRoles: UserRoles[]) => {
    return (req: AuthenticationRequest, res: Response, next: NextFunction): void => {
        const user = req.user;

        if(!user){
            res.status(401).json({
                success: false,
                message: "User is not authenticated.",
            });
            return;
        }

        if(!allowedRoles.includes(user.role)){
            res.status(403).json({
                success: false,
                message: "You do not have permission to access this resource.",
            });
            return;
        }

        next();
    };
};