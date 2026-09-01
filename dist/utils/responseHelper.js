export const sendBadRequest = (res, message) => {
    res.status(400).json({
        success: false,
        message,
    });
};
//# sourceMappingURL=responseHelper.js.map