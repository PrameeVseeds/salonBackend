import type { ThemeSettingsInput } from "../interfaces/themeSettingsInterface.js";
import type { HeroMediaType } from "../models/themeSettingsModel.js";
import * as themeSettingsRepository from "../repositories/themeSettingsRepository.js";

export const getThemeSettings = () => themeSettingsRepository.getThemeSettings();
export const updateThemeSettings = (input: ThemeSettingsInput) => themeSettingsRepository.updateThemeSettings(input);
export const updateHeroMedia = (heroMediaType: HeroMediaType, heroMediaUrl: string | null,) => 
  themeSettingsRepository.updateHeroMedia(heroMediaType, heroMediaUrl);
