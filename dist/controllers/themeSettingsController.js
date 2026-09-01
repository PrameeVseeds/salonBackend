import { unlink } from "node:fs/promises";
import path from "node:path";
import * as themeSettingsService from "../services/themeSettingsService.js";
import { formatThemeSettings } from "../utils/mappers/themeSettingsMapper.js";
import { sendBadRequest } from "../utils/responseHelper.js";
import { validateThemeSettings } from "../validators/themeSettingsValidator.js";
const removeUploadedFile = async (filePath) => {
    if (filePath)
        await unlink(filePath).catch(() => undefined);
};
const removeManagedHeroMedia = async (mediaUrl) => {
    if (mediaUrl?.startsWith("/uploads/theme/")) {
        await removeUploadedFile(path.resolve("uploads", "theme", path.basename(mediaUrl)));
    }
};
export const getThemeSettings = async (_req, res) => {
    try {
        const themeSettings = await themeSettingsService.getThemeSettings();
        if (!themeSettings) {
            res.status(404).json({
                success: false,
                message: "Theme settings have not been configured.",
            });
            return;
        }
        res.json({
            success: true,
            data: { themeSettings: formatThemeSettings(themeSettings) },
        });
    }
    catch {
        res
            .status(500)
            .json({ success: false, message: "Failed to retrieve theme settings." });
    }
};
export const updateThemeSettings = async (req, res) => {
    const validation = validateThemeSettings(req.body ?? {});
    if (!validation.isValid)
        return sendBadRequest(res, validation.message);
    try {
        const updatedThemeSettings = await themeSettingsService.updateThemeSettings(validation.data);
        res.json({
            success: true,
            message: "Theme settings updated successfully.",
            data: {
                themeSettings: updatedThemeSettings && formatThemeSettings(updatedThemeSettings),
            },
        });
    }
    catch {
        res
            .status(500)
            .json({ success: false, message: "Failed to update theme settings." });
    }
};
export const updateHeroMedia = async (req, res) => {
    const uploadedFilePath = req.file
        ? path.resolve("uploads/theme", req.file.filename)
        : null;
    const heroMediaType = req.body?.heroMediaType ?? req.body?.hero_media_type;
    if (heroMediaType !== "Image" && heroMediaType !== "Video") {
        await removeUploadedFile(uploadedFilePath);
        return sendBadRequest(res, "Hero media type must be Image or Video.");
    }
    if (!req.file)
        return sendBadRequest(res, "Hero media file is required.");
    const mediaTypeMatchesFile = heroMediaType === "Image"
        ? req.file.mimetype.startsWith("image/")
        : req.file.mimetype.startsWith("video/");
    if (!mediaTypeMatchesFile) {
        await removeUploadedFile(uploadedFilePath);
        return sendBadRequest(res, `Uploaded file must match ${heroMediaType} media type.`);
    }
    try {
        const existingThemeSettings = await themeSettingsService.getThemeSettings();
        if (!existingThemeSettings) {
            await removeUploadedFile(uploadedFilePath);
            res.status(404).json({
                success: false,
                message: "Configure theme settings before uploading hero media.",
            });
            return;
        }
        const updatedThemeSettings = await themeSettingsService.updateHeroMedia(heroMediaType, `/uploads/theme/${req.file.filename}`);
        await removeManagedHeroMedia(existingThemeSettings.hero_media_url);
        res.json({
            success: true,
            message: "Hero media updated successfully.",
            data: {
                themeSettings: updatedThemeSettings && formatThemeSettings(updatedThemeSettings),
            },
        });
    }
    catch {
        await removeUploadedFile(uploadedFilePath);
        res
            .status(500).json({ success: false, message: "Failed to update hero media." });
    }
};
export const deleteHeroMedia = async (_req, res) => {
    try {
        const existingThemeSettings = await themeSettingsService.getThemeSettings();
        if (!existingThemeSettings) {
            res.status(404).json({ success: false,
                message: "Theme settings have not been configured." });
            return;
        }
        const updatedThemeSettings = await themeSettingsService.updateHeroMedia(existingThemeSettings.hero_media_type, null);
        await removeManagedHeroMedia(existingThemeSettings.hero_media_url);
        res.json({
            success: true,
            message: "Hero media removed successfully.",
            data: {
                themeSettings: updatedThemeSettings && formatThemeSettings(updatedThemeSettings),
            },
        });
    }
    catch {
        res.status(500).json({ success: false,
            message: "Failed to remove hero media."
        });
    }
};
//# sourceMappingURL=themeSettingsController.js.map