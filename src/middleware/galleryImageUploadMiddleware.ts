import crypto from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import type { Request } from "express";
import multer from "multer";

const uploadDirectory = path.resolve("uploads/gallery");
mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadDirectory),
    filename: (_req, file, callback) => 
        callback(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
});

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

const fileFilter: multer.Options["fileFilter"] = (_req: Request, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) 
        return callback(new Error("Only JPG, PNG and WEBP images are allowed."));
    callback(null, true);
};

export const uploadGalleryImage = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024, files: 1 } });
