import jwt, { type SignOptions } from "jsonwebtoken";
import { CustomerJwtPayLoad } from "../interfaces/customerInterface.js";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable is not defined");
}

const expiresIn = (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) || "1d";

// Creates a signed JWT.
export const generateCustomerToken = (payload: CustomerJwtPayLoad): string => {
    return jwt.sign(payload, jwtSecret, { expiresIn, });
};
