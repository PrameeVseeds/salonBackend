import express from "express";
import apiRoutes from "./routes/appRoutes.js";
import path from "path";
import multer from "multer";
const app = express();
app.use(express.json({ limit: "10kb" }));
const healthCheckHandler = (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Salon API is running",
    });
};
app.get("/", healthCheckHandler);
app.use("/uploads", express.static(path.resolve("uploads")));
app.use("/api", apiRoutes);
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
    });
};
app.use(notFoundHandler);
const globalErrorHandler = (error, _req, res, _next) => {
    if (error instanceof multer.MulterError) {
        const isFileTooLarge = error.code === "LIMIT_FILE_SIZE";
        res.status(isFileTooLarge ? 413 : 400).json({
            success: false,
            message: isFileTooLarge
                ? "The uploaded file exceeds the allowed size limit."
                : error.message,
        });
        return;
    }
    if (error instanceof Error && error.message === "Unsupported media type.") {
        res.status(400).json({ success: false, message: error.message });
        return;
    }
    console.error("Unhandled application error:", error);
    res.status(500).json({
        success: false,
        message: "Internal server error",
    });
};
app.use(globalErrorHandler);
export default app;
//# sourceMappingURL=app.js.map