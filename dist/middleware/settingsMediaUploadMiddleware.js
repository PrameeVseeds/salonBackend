import crypto from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import multer from "multer";
const createMediaUploader = (folderName, allowedMimeTypes, maximumFileSize) => {
    const uploadDirectory = path.resolve("uploads", folderName);
    mkdirSync(uploadDirectory, { recursive: true });
    return multer({
        storage: multer.diskStorage({
            destination: (_request, _file, callback) => callback(null, uploadDirectory),
            filename: (_request, file, callback) => callback(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
        }),
        fileFilter: (_request, file, callback) => allowedMimeTypes.includes(file.mimetype)
            ? callback(null, true)
            : callback(new Error("Unsupported media type.")),
        limits: { fileSize: maximumFileSize, files: 1 },
    });
};
export const uploadLogo = createMediaUploader("settings", ["image/jpeg", "image/png", "image/webp", "image/svg+xml"], 5 * 1024 * 1024);
export const uploadHeroMedia = createMediaUploader("theme", ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"], 25 * 1024 * 1024);
//# sourceMappingURL=settingsMediaUploadMiddleware.js.map