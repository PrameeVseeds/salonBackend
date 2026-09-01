import jwt from 'jsonwebtoken';
// Authenticates customer JWTs.
export const authenticateCustomer = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({
            success: false,
            message: 'Customer authentication token is required.'
        });
        return;
    }
    ;
    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        res.status(500).json({
            success: false,
            message: 'JWT secret is not configured.'
        });
        return;
    }
    ;
    try {
        const decoded = jwt.verify(token, jwtSecret);
        if (decoded.accountType !== "customer") {
            res.status(403).json({
                success: false,
                message: "This token does not belong to a customer.",
            });
            return;
        }
        req.customer = decoded;
        next();
    }
    catch {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired customer token.'
        });
    }
};
export const authenticateCustoner = authenticateCustomer;
//# sourceMappingURL=customerAuthMiddleware.js.map