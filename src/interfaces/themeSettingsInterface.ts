import type { HeroMediaType } from "../models/themeSettingsModel.js";

export interface ThemeSettingsInput {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  hero_media_type: HeroMediaType;
}
