export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            res.status(401).json({
                success: false,
                message: "User is not authenticated.",
            });
            return;
        }
        if (!allowedRoles.includes(user.role)) {
            res.status(403).json({
                success: false,
                message: "You do not have permission to access this resource.",
            });
            return;
        }
        next();
    };
};
//# sourceMappingURL=authorizeRolesMiddleware.js.map