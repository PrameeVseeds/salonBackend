import type { Request } from "express";
import multer from "multer";

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

const fileFilter: multer.Options["fileFilter"] = (_req: Request, file, callback) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    callback(new Error("Unsupported media type."));
    return;
  }

  callback(null, true);
};

export const uploadConsultationImage = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});
