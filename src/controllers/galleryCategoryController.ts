import type { Request, Response } from "express";
import * as repository from "../repositories/galleryCategoryRepository.js";
import { sendBadRequest } from "../utils/responseHelper.js";
import {validateGalleryCategory, validateGalleryCategoryId,} from "../validators/galleryCategoryValidator.js";

const format = (row: Awaited<ReturnType<typeof repository.findById>>) =>
  row && {
    id: row.id,
    name: row.name,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

export const getAll = async (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        categories: (await repository.findAll()).map((row) => format(row)),
      },
    });
  }
  catch {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to retrieve gallery categories.",
      });
  }
};

export const create = async (req: Request, res: Response) => {
  const validation = validateGalleryCategory(req.body ?? {});
  if (!validation.isValid) 
    return sendBadRequest(res, validation.message);

  try {
    res
      .status(201)
      .json({
        success: true,
        message: "Gallery category created successfully.",
        data: { category: format(await repository.create(validation.data)) },
      });
  } 
  catch (error) {
    const duplicate =
      error instanceof Error &&
      "code" in error &&
      error.code === "ER_DUP_ENTRY";
    res
      .status(duplicate ? 409 : 500).json({
        success: false,
        message: duplicate
          ? "Gallery category already exists."
          : "Failed to create gallery category.",
      });
  }
};

export const update = async (req: Request<{ id: string }>, res: Response) => {
  const id = validateGalleryCategoryId(req.params.id);
  const body = validateGalleryCategory(req.body ?? {});

  if (!id.isValid) 
    return sendBadRequest(res, id.message);

  if (!body.isValid) 
    return sendBadRequest(res, body.message);

  try {
    const category = await repository.update(id.data, body.data);
    if (!category) {
      res
        .status(404)
        .json({ success: false, message: "Gallery category not found." });
      return;
    }
    res.json({
      success: true,
      message: "Gallery category updated successfully.",
      data: { category: format(category) },
    });
  } catch {
    res
      .status(500)
      .json({ success: false, message: "Failed to update gallery category." });
  }
};

export const remove = async (req: Request<{ id: string }>, res: Response) => {
  const id = validateGalleryCategoryId(req.params.id);
  if (!id.isValid) 
    return sendBadRequest(res, id.message);

  try {
    if (!(await repository.remove(id.data))) {
      res
        .status(404)
        .json({ success: false, message: "Gallery category not found." });
      return;
    }
    res.json({
      success: true,
      message: "Gallery category deleted successfully.",
    });
  } catch {
    res
      .status(500)
      .json({ success: false, message: "Failed to delete gallery category." });
  }
};
