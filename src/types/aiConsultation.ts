export const consultationRequestTypes = ["haircut", "beard", "both"] as const;

export type ConsultationRequestType = (typeof consultationRequestTypes)[number];

export interface AiConsultationInput {
  requestType: ConsultationRequestType;
  preference: string | null;
}

export interface StyleRecommendation {
  styleName: string;
  explanation: string;
  barberInstructions: string;
}

export interface AiConsultation {
  consultationType: ConsultationRequestType;
  haircutRecommendations: StyleRecommendation[];
  beardRecommendations: StyleRecommendation[];
  maintenanceTips: string[];
  disclaimer: string;
}

export class UnsuitableConsultationImageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsuitableConsultationImageError";
  }
}

export class GeminiConsultationError extends Error {
  constructor(message = "Unable to generate an AI consultation at this time.") {
    super(message);
    this.name = "GeminiConsultationError";
  }
}
