import * as repository from "../repositories/settingsRepository.js";
export const getSettings = () => repository.getSettings();
export const updateSettings = (input) => repository.updateSettings(input);
export const updateLogo = (url) => repository.updateLogo(url);
//# sourceMappingURL=settingsService.js.map