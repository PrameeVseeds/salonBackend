import { JwtPayload } from "../interfaces/authInterface.js";
import jwt, { type SignOptions } from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable is not defined");
}

const expiresIn = (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) || "1d";

export const generateToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, jwtSecret, { expiresIn, });
};