import { unlink } from "node:fs/promises";
import path from "node:path";
import type { Request, Response } from "express";
import * as service from "../services/galleryService.js";
import { formatGalleryImage } from "../utils/mappers/galleryMapper.js";
import { sendBadRequest } from "../utils/responseHelper.js";
import { validateGalleryId, validateGalleryMetadata, validateGalleryStatus } from "../validators/galleryValidator.js";

const uploadedPath = (req: Request): string | null => req.file ? path.resolve("uploads", "gallery", req.file.filename) : null;
const removeFile = async (filePath: string | null): Promise<void> => { if (filePath) await unlink(filePath).catch(() => undefined); };
const removeManagedImage = async (imageUrl: string): Promise<void> => {
    if (imageUrl.startsWith("/uploads/gallery/"))
        await removeFile(path.resolve("uploads", "gallery", path.basename(imageUrl)));
};

export const create = async (req: Request, res: Response): Promise<void> => {
    const filePath = uploadedPath(req);
    const validation = validateGalleryMetadata(req.body ?? {});
    if (!validation.isValid) {
        await removeFile(filePath);
        return sendBadRequest(res, validation.message);
    }

    if (!req.file)
        return sendBadRequest(res, "Gallery image is required.");

    try {
        const image = await service.createGalleryImage(
            { ...validation.data, image_url: `/uploads/gallery/${req.file.filename}` }
        );
        res.status(201).json(
            {
                success: true, message: "Gallery image created successfully.",
                data: { galleryImage: image && formatGalleryImage(image) }
            }
        );
    }
    catch {
        await removeFile(filePath);
        res.status(500).json(
            { success: false, message: "Failed to create gallery image." }
        );
    }
};

export const getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
        const images = await service.getGalleryImages();
        res.status(200).json({
            success: true, message: "Gallery retrieved successfully.",
            data: { galleryImages: images.map(formatGalleryImage) }
        });
    }
    catch {
        res.status(500).json(
            { success: false, message: "Failed to retrieve gallery." }
        );
    }
};

export const getById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const validation = validateGalleryId(req.params.id);
    if (!validation.isValid)
        return sendBadRequest(res, validation.message);

    try {
        const image = await service.getGalleryImage(validation.data);
        if (!image) {
            res.status(404).json({ success: false, message: "Gallery image not found." });
            return;
        }
        res.status(200).json(
            {
                success: true, message: "Gallery image retrieved successfully.",
                data: { galleryImage: formatGalleryImage(image) }
            }
        );
    }
    catch {
        res.status(500).json(
            { success: false, message: "Failed to retrieve gallery image." }
        );
    }
};

export const update = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const id = validateGalleryId(req.params.id);
    const body = validateGalleryMetadata(req.body ?? {});

    if (!id.isValid)
        return sendBadRequest(res, id.message);

    if (!body.isValid)
        return sendBadRequest(res, body.message);

    try {
        const image = await service.updateGalleryImage(id.data, body.data);
        if (!image) {
            res.status(404).json({ success: false, message: "Gallery image not found." });
            return;
        }
        res.status(200).json(
            {
                success: true, message: "Gallery image updated successfully.",
                data: { galleryImage: formatGalleryImage(image) }
            });
    }
    catch {
        res.status(500).json(
            { success: false, message: "Failed to update gallery image." }
        );
    }
};

export const updateStatus = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const id = validateGalleryId(req.params.id);
    const status = validateGalleryStatus(req.body ?? {});

    if (!id.isValid)
        return sendBadRequest(res, id.message);

    if (!status.isValid)
        return sendBadRequest(res, status.message);

    try {
        const image = await service.updateGalleryStatus(id.data, status.data);

        if (!image) {
            res.status(404).json({ success: false, message: "Gallery image not found." });
            return;
        }

        res.status(200).json({
            success: true,
            message: status.data ? "Gallery image activated successfully." : "Gallery image deactivated successfully.",
            data: { galleryImage: formatGalleryImage(image) }
        });
    }

    catch {
        res.status(500).json(
            { success: false, message: "Failed to update gallery status." }
        );
    }
};

export const updateImage = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const filePath = uploadedPath(req);
    const id = validateGalleryId(req.params.id);

    if (!id.isValid) {
        await removeFile(filePath);
        return sendBadRequest(res, id.message);
    }

    if (!req.file)
        return sendBadRequest(res, "Gallery image is required.");

    try {
        const existing = await service.getGalleryImage(id.data);

        if (!existing) {
            await removeFile(filePath);
            res.status(404).json(
                { success: false, message: "Gallery image not found." }
            );
            return;
        }
        const image = await service.updateGalleryImageFile(id.data, `/uploads/gallery/${req.file.filename}`);
        if (!image)
            throw new Error();

        await removeManagedImage(existing.image_url);

        res.status(200).json(
            {
                success: true, message: "Gallery image file updated successfully.",
                data: { galleryImage: formatGalleryImage(image) }
            });
    }
    catch {
        await removeFile(filePath);
        res.status(500).json(
            { success: false, message: "Failed to update gallery image file." }
        );
    }
};

export const remove = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const id = validateGalleryId(req.params.id);
    if (!id.isValid)
        return sendBadRequest(res, id.message);

    try {
        const existing = await service.getGalleryImage(id.data);
        if (!existing || !(await service.deleteGalleryImage(id.data))) {
            res.status(404).json({ success: false, message: "Gallery image not found." });
            return;
        }
        await removeManagedImage(existing.image_url);
        res.status(200).json({ success: true, message: "Gallery image deleted successfully." });
    }

    catch {
        res.status(500).json(
            { success: false, message: "Failed to delete gallery image." }
        );
    }
};
