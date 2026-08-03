import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../interfaces/authInterface.js';

export interface AuthenticationRequest extends Request {
    user?: JwtPayload;
}

export const authenticateUser = (req: AuthenticationRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({
            success: false,
            message: 'Authentication token is required.'
        });
        return;
    };

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        res.status(500).json({
            success: false,
            message: 'JWT secret is not configured.'
        });
        return;
    };

    try {
        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
        req.user = decoded;
        next();
    }
    catch {
        res.status(401).json({
            success: false,
            message: 'Invalid authentication token.'
        });
    }
};