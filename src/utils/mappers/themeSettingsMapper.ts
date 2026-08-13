import type { ThemeSettingsRow } from "../../models/themeSettingsModel.js";

export const formatThemeSettings = (themeSettings: ThemeSettingsRow) => ({
  id: themeSettings.id,
  primaryColor: themeSettings.primary_color,
  secondaryColor: themeSettings.secondary_color,
  accentColor: themeSettings.accent_color,
  heroMediaType: themeSettings.hero_media_type,
  heroMediaUrl: themeSettings.hero_media_url,
  createdAt: themeSettings.created_at,
  updatedAt: themeSettings.updated_at,
});
