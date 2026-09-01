import crypto from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import multer from "multer";
const uploadDirectory = path.resolve("uploads/customers");
mkdirSync(uploadDirectory, { recursive: true });
const storage = multer.diskStorage({ destination: (_req, _file, callback) => {
        callback(null, uploadDirectory);
    },
    filename: (_req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const fileName = `${crypto.randomUUID()}${extension}`;
        callback(null, fileName);
    },
});
const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
];
const fileFilter = (_req, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
        callback(new Error("Unsupported media type."));
        return;
    }
    callback(null, true);
};
// Handles customer profile image uploads with type and size limits.
export const uploadCustomerImage = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024,
        files: 1,
    },
});
//# sourceMappingURL=customerImageUploadMiddleware.js.map