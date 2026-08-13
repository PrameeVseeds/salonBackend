import { unlink } from "node:fs/promises";
import path from "node:path";
import type { Request, Response } from "express";
import * as settingsService from "../services/settingsService.js";
import { formatSettings } from "../utils/mappers/settingsMapper.js";
import { sendBadRequest } from "../utils/responseHelper.js";
import { validateSettings } from "../validators/settingsValidator.js";

const removeUploadedFile = async (filePath: string | null): Promise<void> => {
  if (filePath) await unlink(filePath).catch(() => undefined);
};

const removeManagedMedia = async (mediaUrl: string | null,folderName: string,): Promise<void> => {
  if (mediaUrl?.startsWith(`/uploads/${folderName}/`))
    await removeUploadedFile(
      path.resolve("uploads", folderName, path.basename(mediaUrl)),
    );
};

export const getSettings = async (_req: Request,res: Response,): Promise<void> => {
  try {
    const settings = await settingsService.getSettings();
    if (!settings) {
      res.status(404).json({
        success: false,
        message: "Settings have not been configured.",
      });
      return;
    }
    res.json({ success: true, data: { settings: formatSettings(settings) } });
  } catch {
    res
      .status(500)
      .json({ success: false, message: "Failed to retrieve settings." });
  }
};

export const putSettings = async (req: Request, res: Response) => {
  const validation = validateSettings(req.body ?? {});
  if (!validation.isValid) return sendBadRequest(res, validation.message);
  try {
    const updatedSettings = await settingsService.updateSettings(
      validation.data,
    );
    res.json({
      success: true,
      message: "Settings updated successfully.",
      data: { settings: updatedSettings && formatSettings(updatedSettings) },
    });
  } catch {
    res
      .status(500)
      .json({ success: false, message: "Failed to update settings." });
  }
};

export const patchLogo = async (req: Request, res: Response) => {
  const uploadedFilePath = req.file
    ? path.resolve("uploads/settings", req.file.filename)
    : null;
  if (!req.file) return sendBadRequest(res, "Logo file is required.");
  try {
    const existingSettings = await settingsService.getSettings();
    if (!existingSettings) {
      await removeUploadedFile(uploadedFilePath);
      res.status(404).json({
        success: false,
        message: "Configure settings before uploading a logo.",
      });
      return;
    }
    const updatedSettings = await settingsService.updateLogo(
      `/uploads/settings/${req.file.filename}`,
    );
    await removeManagedMedia(existingSettings.logo_url, "settings");
    res.json({
      success: true,
      message: "Logo updated successfully.",
      data: { settings: updatedSettings && formatSettings(updatedSettings) },
    });
  } catch {
    await removeUploadedFile(uploadedFilePath);
    res.status(500).json({ success: false, message: "Failed to update logo." });
  }
};
