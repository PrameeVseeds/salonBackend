import type { GalleryMetadataInput } from "../interfaces/galleryInterface.js";
import { getString, type ValidationResult } from "./validationUtils.js";

const parseBoolean = (value: unknown): boolean | null => {
    if (typeof value === "boolean") return value;
    if (value === "true") return true;
    if (value === "false") return false;
    return null;
};

const parseOrder = (value: unknown): number | null => {
    if (value === undefined || value === "") return 0;
    const order = Number(value);
    return Number.isInteger(order) && order >= 0 ? order : null;
};

export const validateGalleryId = (value: string | string[] | undefined): ValidationResult<number> => {
    if (Array.isArray(value)) 
        return { isValid: false, message: "Invalid gallery image ID." };
    
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) 
        return { isValid: false, message: "Invalid gallery image ID." };

    return { isValid: true, data: id };
};

export const validateGalleryMetadata = (body: Record<string, unknown>): ValidationResult<GalleryMetadataInput> => {
    const title = getString(body.title);
    const rawCategoryId = body.category_id ?? body.categoryId;
    const categoryId = rawCategoryId === undefined || rawCategoryId === "" || rawCategoryId === null
        ? null : Number(rawCategoryId);
    const displayOrder = parseOrder(body.display_order ?? body.displayOrder);
    const rawActive = body.is_active ?? body.isActive;
    const isActive = rawActive === undefined ? true : parseBoolean(rawActive);

    if (!title) 
        return { isValid: false, message: "Title is required." };

    if (title.length > 150) 
        return { isValid: false, message: "Title cannot exceed 150 characters." };

    if (categoryId !== null && (!Number.isInteger(categoryId) || categoryId <= 0))
        return { isValid: false, message: "Category must be a valid gallery category." };

    if (displayOrder === null) 
        return { isValid: false, message: "Display order must be a non-negative whole number." };
    if (isActive === null) 
        return { isValid: false, message: "Active status must be true or false." };

    return { isValid: true, data: { title, category_id: categoryId, display_order: displayOrder, is_active: isActive } };
};

export const validateGalleryStatus = (body: Record<string, unknown>): ValidationResult<boolean> => {
    const status = parseBoolean(body.is_active ?? body.isActive);

    if (status === null) 
        return { isValid: false, message: "Active status must be true or false." };

    return { isValid: true, data: status };
};
