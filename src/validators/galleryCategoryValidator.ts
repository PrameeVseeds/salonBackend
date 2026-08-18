import { getString, type ValidationResult } from "./validationUtils.js";

export const validateGalleryCategoryId = (value: string | string[] | undefined): ValidationResult<number> => {
  if (Array.isArray(value))
    return { isValid: false, message: "Invalid gallery category ID." };
  const id = Number(value);
  return Number.isInteger(id) && id > 0
    ? { isValid: true, data: id }
    : { isValid: false, message: "Invalid gallery category ID." };
};

export const validateGalleryCategory = (body: Record<string, unknown>): ValidationResult<{ name: string; is_active: boolean }> => {
  const name = getString(body.name);
  const raw = body.isActive ?? body.is_active ?? true;
  if (!name) return { isValid: false, message: "Category name is required." };
  if (name.length > 100)
    return {
      isValid: false,
      message: "Category name cannot exceed 100 characters.",
    };
  if (typeof raw !== "boolean")
    return { isValid: false, message: "Active status must be true or false." };
  return { isValid: true, data: { name, is_active: raw } };
};
