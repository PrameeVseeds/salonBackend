import * as themeSettingsRepository from "../repositories/themeSettingsRepository.js";
export const getThemeSettings = () => themeSettingsRepository.getThemeSettings();
export const updateThemeSettings = (input) => themeSettingsRepository.updateThemeSettings(input);
export const updateHeroMedia = (heroMediaType, heroMediaUrl) => themeSettingsRepository.updateHeroMedia(heroMediaType, heroMediaUrl);
//# sourceMappingURL=themeSettingsService.js.map