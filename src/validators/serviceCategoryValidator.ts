import { getString, type ValidationResult } from "./validationUtils.js";

export const validateServiceCategoryId = (value: string | string[] | undefined): ValidationResult<number> => {
  if (Array.isArray(value)) return { isValid: false, message: "Invalid service category ID." };
  const id = Number(value);
  return Number.isInteger(id) && id > 0
    ? { isValid: true, data: id }
    : { isValid: false, message: "Invalid service category ID." };
};

export const validateServiceCategory = (body: Record<string, unknown>): ValidationResult<{ name: string; description: string; is_active: boolean }> => {
  const name = getString(body.name);
  const description = getString(body.description) ?? "";
  const isActive = body.isActive ?? body.is_active ?? true;

  if (!name)
    return {
      isValid: false,
      message: "Category name is required."
    };

  if (name.length > 100)
    return {
      isValid: false,
      message: "Category name cannot exceed 100 characters."
    };

  if (description.length > 500)
    return {
      isValid: false,
      message: "Description cannot exceed 500 characters."
    };
  if (typeof isActive !== "boolean")
    return {
      isValid: false,
      message: "Active status must be true or false."
    };
  return {
    isValid: true,
    data: {
      name,
      description,
      is_active: isActive
    }
  };
};
