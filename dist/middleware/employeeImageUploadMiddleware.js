import crypto from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import multer from "multer";
const uploadDirectory = path.resolve("uploads", "employees");
mkdirSync(uploadDirectory, { recursive: true });
export const uploadEmployeeImage = multer({
    storage: multer.diskStorage({
        destination: (_request, _file, callback) => callback(null, uploadDirectory),
        filename: (_request, file, callback) => callback(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
    }),
    fileFilter: (_request, file, callback) => {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
            callback(new Error("Unsupported media type."));
            return;
        }
        callback(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});
//# sourceMappingURL=employeeImageUploadMiddleware.js.map