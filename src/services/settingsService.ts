import type { SettingsInput } from "../interfaces/settingsInterface.js";
import * as repository from "../repositories/settingsRepository.js";

export const getSettings = () => repository.getSettings();

export const updateSettings = (input: SettingsInput) =>
  repository.updateSettings(input);

export const updateLogo = (url: string) => repository.updateLogo(url);
