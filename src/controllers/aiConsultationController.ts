import type { Request, Response } from "express";
import { GeminiConsultationError, UnsuitableConsultationImageError } from "../types/aiConsultation.js";
import { generateAiConsultation } from "../services/geminiConsultationService.js";
import { validateAiConsultationInput } from "../validators/aiConsultationValidator.js";
import { sendBadRequest } from "../utils/responseHelper.js";

export const create = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    sendBadRequest(res, "A clear consultation image is required.");
    return;
  }

  const validation = validateAiConsultationInput(req.body ?? {});
  if (!validation.isValid) {
    sendBadRequest(res, validation.message);
    return;
  }

  try {
    const consultation = await generateAiConsultation(validation.data, req.file);
    res.status(200).json({
      success: true,
      message: "AI consultation generated successfully.",
      data: { consultation },
    });
  } catch (error: unknown) {
    if (error instanceof UnsuitableConsultationImageError) {
      res.status(422).json({ success: false, message: error.message });
      return;
    }

    if (error instanceof GeminiConsultationError) {
      res.status(502).json({ success: false, message: error.message });
      return;
    }

    res.status(502).json({
      success: false,
      message: "Unable to generate an AI consultation at this time.",
    });
  }
};
