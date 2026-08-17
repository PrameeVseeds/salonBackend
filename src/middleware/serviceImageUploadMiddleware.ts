import crypto from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import multer from "multer";

const uploadDirectory = path.resolve("uploads", "services");
mkdirSync(uploadDirectory, { recursive: true });

export const uploadServiceImage = multer({
    storage: multer.diskStorage({
        destination: (_request, _file, callback) => callback(null, uploadDirectory),
        filename: (_request, file, callback) => callback(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
    }),
    fileFilter: (_request, file, callback) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.mimetype)) {
            callback(new Error("Only JPG, PNG and WEBP images are allowed."));
            return;
        }
        callback(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});
