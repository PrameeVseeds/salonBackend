import jwt from "jsonwebtoken";
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable is not defined");
}
const expiresIn = process.env.JWT_EXPIRES_IN || "1d";
// Creates a signed JWT.
export const generateCustomerToken = (payload) => {
    return jwt.sign(payload, jwtSecret, { expiresIn, });
};
//# sourceMappingURL=customerJwt.js.map