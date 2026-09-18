import {
  consultationRequestTypes,
  type AiConsultationInput,
  type ConsultationRequestType,
} from "../types/aiConsultation.js";
import { type ValidationResult } from "./validationUtils.js";

const maxPreferenceLength = 500;

export const validateAiConsultationInput = (body: Record<string, unknown>,): ValidationResult<AiConsultationInput> => {
  const requestType = body.requestType;

  if (typeof requestType !== "string" || requestType.trim().length === 0)
    return {
      isValid: false,
      message: "Consultation type is required."
    };

  if (!consultationRequestTypes.includes(requestType as ConsultationRequestType))
    return {
      isValid: false,
      message: "Consultation type must be haircut, beard, or both.",
    };

  const rawPreference = body.preference;
  if (rawPreference !== undefined && typeof rawPreference !== "string")
    return { isValid: false, message: "Preference must be text." };

  const preference = rawPreference?.trim() || null;
  if (preference && preference.length > maxPreferenceLength)
    return {
      isValid: false,
      message: `Preference cannot exceed ${maxPreferenceLength} characters.`,
    };

  return {
    isValid: true,
    data: {
      requestType: requestType as ConsultationRequestType, preference
    }
  };
};
