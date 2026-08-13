import type { ThemeSettingsInput } from "../interfaces/themeSettingsInterface.js";
import type { HeroMediaType } from "../models/themeSettingsModel.js";
import { getString, type ValidationResult } from "./validationUtils.js";

const hexColorPattern = /^#[0-9A-Fa-f]{6}$/;

export const validateThemeSettings = (body: Record<string, unknown>,): ValidationResult<ThemeSettingsInput> => {
  const primaryColor = getString(body.primaryColor ?? body.primary_color);
  const secondaryColor = getString(body.secondaryColor ?? body.secondary_color);
  const accentColor = getString(body.accentColor ?? body.accent_color);
  
  const heroMediaType = getString(
    body.heroMediaType ?? body.hero_media_type,
  ) as HeroMediaType | null;

  if (
    !primaryColor ||
    !secondaryColor ||
    !accentColor ||
    !hexColorPattern.test(primaryColor) ||
    !hexColorPattern.test(secondaryColor) ||
    !hexColorPattern.test(accentColor)
  ) {
    return {
      isValid: false,
      message: "Colors must use six-digit hex format, for example #D4AF37.",
    };
  }
  if (heroMediaType !== "Image" && heroMediaType !== "Video") {
    return {
      isValid: false,
      message: "Hero media type must be Image or Video.",
    };
  }
  return {
    isValid: true,
    data: {
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      accent_color: accentColor,
      hero_media_type: heroMediaType,
    },
  };
};
