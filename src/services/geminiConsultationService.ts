import { GoogleGenAI } from "@google/genai";
import { fileTypeFromBuffer } from "file-type";
import {
  GeminiConsultationError,
  UnsuitableConsultationImageError,
  type AiConsultation,
  type AiConsultationInput,
  type StyleRecommendation,
} from "../types/aiConsultation.js";


const textModel = process.env.GEMINI_TEXT_MODEL ?? "gemini-3.1-flash-lite";
const pixazoTextToImageUrl = "https://gateway.pixazo.ai/nano-banana-2/v1/text-to-image";
const pixazoStatusBaseUrl = "https://gateway.pixazo.ai/v2/requests/status/";

const maxProviderAttempts = 2;
const maxPixazoPolls = 12;
const pixazoPollIntervalMs = 5_000;
const supportedMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;
const disclaimer =
  "This is an AI-generated suggestion only. Please confirm the final style with your barber, as results may vary.";

const consultationSchema = {
  type: "object",
  properties: {
    imageSuitable: { type: "boolean" },
    validationMessage: { type: "string" },
    consultationType: { type: "string", enum: ["haircut", "beard", "both"] },
    haircutRecommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          styleName: { type: "string" },
          explanation: { type: "string" },
          barberInstructions: { type: "string" },
        },
        required: ["styleName", "explanation", "barberInstructions"],
      },
    },
    beardRecommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          styleName: { type: "string" },
          explanation: { type: "string" },
          barberInstructions: { type: "string" },
        },
        required: ["styleName", "explanation", "barberInstructions"],
      },
    },
    maintenanceTips: { type: "array", items: { type: "string" } },
    disclaimer: { type: "string" },
  },
  required: [
    "imageSuitable",
    "validationMessage",
    "consultationType",
    "haircutRecommendations",
    "beardRecommendations",
    "maintenanceTips",
    "disclaimer",
  ],
} as const;

type ModelResponse = AiConsultation & {
  imageSuitable: boolean;
  validationMessage: string;
};

export type AiConsultationWithImages = AiConsultation & {
  haircutRecommendations: PreviewRecommendation[];
  beardRecommendations: PreviewRecommendation[];
};

export type PreviewRecommendation = StyleRecommendation & {
  previewImage?: string;
  previewStatus: "generated" | "unavailable";
};

const isRecommendation = (value: unknown): value is StyleRecommendation => {
  if (!value || typeof value !== "object") return false;
  const recommendation = value as Record<string, unknown>;
  return ["styleName", "explanation", "barberInstructions"].every(
    (key) => typeof recommendation[key] === "string" && recommendation[key].trim().length > 0
  );
};

const isModelResponse = (value: unknown): value is ModelResponse => {
  if (!value || typeof value !== "object") return false;
  const response = value as Record<string, unknown>;
  return (
    typeof response.imageSuitable === "boolean" &&
    typeof response.validationMessage === "string" &&
    ["haircut", "beard", "both"].includes(response.consultationType as string) &&
    Array.isArray(response.haircutRecommendations) &&
    response.haircutRecommendations.every(isRecommendation) &&
    Array.isArray(response.beardRecommendations) &&
    response.beardRecommendations.every(isRecommendation) &&
    Array.isArray(response.maintenanceTips) &&
    response.maintenanceTips.every((tip) => typeof tip === "string" && tip.trim().length > 0) &&
    typeof response.disclaimer === "string"
  );
};

const promptFor = ({ requestType, preference }: AiConsultationInput): string => `
You are an AI hairstyle consultant for a salon. Review the submitted photo only to determine whether the hair and/or beard are clearly visible enough for a style consultation.

Requested consultation: ${requestType}.
Customer preferences: ${preference ?? "No additional preferences provided."}

Do not identify the person or infer their identity, age, ethnicity, nationality, religion, gender identity, health, medical conditions, psychological traits, or any other sensitive attribute. Do not give medical advice.

If the image is blurry, badly lit, obstructed, not a person, or does not clearly show the requested hair/beard area, set imageSuitable to false, give a short helpful validationMessage asking for a clear, well-lit front/side photo, and return empty recommendation/tip arrays.

If suitable, set imageSuitable to true and validationMessage to an empty string. Return 2 or 3 practical recommendations for the requested area only. Each recommendation must contain a styleName, a concise explanation, and specific barberInstructions. Include practical maintenanceTips. Use the supplied disclaimer verbatim: ${disclaimer}
Return JSON only, matching the provided schema.`;

const verifyImage = async (file: Express.Multer.File): Promise<string> => {
  const detected = await fileTypeFromBuffer(file.buffer);
  if (!detected || !supportedMimeTypes.includes(detected.mime as (typeof supportedMimeTypes)[number]))
    throw new UnsuitableConsultationImageError("Please upload a valid JPEG, PNG, or WEBP image.");

  if (detected.mime !== file.mimetype)
    throw new UnsuitableConsultationImageError("The uploaded image type does not match its file content.");

  return detected.mime;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const previewPromptFor = (
  recommendation: StyleRecommendation,
  input: AiConsultationInput,
): string => `
Create one photorealistic, vertical barbershop studio portrait demonstrating this style:
${recommendation.styleName}.

Requested area: ${input.requestType}.
Style description: ${recommendation.explanation}
Barber details: ${recommendation.barberInstructions}
Preferences: ${input.preference ?? "Modern, professional and low maintenance."}

Show one adult model with the requested finished hairstyle and/or beard clearly visible. Natural lighting, realistic hair texture, high-quality salon photography. Do not add text, watermarks, logos, collage panels, or extra people.`;

type PixazoResponse = {
  request_id?: string;
  polling_url?: string;
  status?: string;
  error?: string | null;
  output?: { media_url?: string[] };
};

const parsePixazoResponse = async (response: Response): Promise<PixazoResponse> => {
  const payload: unknown = await response.json().catch(() => ({}));
  if (!payload || typeof payload !== "object") throw new Error("Pixazo returned an invalid response.");
  const result = payload as PixazoResponse;
  if (!response.ok) throw new Error(result.error || `Pixazo request failed with HTTP ${response.status}.`);
  return result;
};

const pixazoStatusUrlFor = (result: PixazoResponse): string => {
  if (result.polling_url?.startsWith(pixazoStatusBaseUrl)) return result.polling_url;
  if (!result.request_id) throw new Error("Pixazo did not return a request ID.");
  return `${pixazoStatusBaseUrl}${encodeURIComponent(result.request_id)}`;
};

/** Submits and polls Pixazo's asynchronous text-to-image API for one preview. */
const generateStylePreviewImage = async (
  input: AiConsultationInput,
  recommendation: StyleRecommendation,
): Promise<string | undefined> => {
  const apiKey = process.env.PIXAZO_API_KEY;
  if (!apiKey) {
    console.warn("Pixazo image generation is disabled because PIXAZO_API_KEY is not configured.");
    return undefined;
  }

  for (let attempt = 1; attempt <= maxProviderAttempts; attempt += 1) {
    try {
      const submitted = await parsePixazoResponse(await fetch(pixazoTextToImageUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          "Ocp-Apim-Subscription-Key": apiKey,
        },
        body: JSON.stringify({
          prompt: previewPromptFor(recommendation, input),
          num_images: 1,
          aspect_ratio: "3:4",
          resolution: "1K",
          output_format: "jpeg",
          enable_web_search: false,
        }),
      }));
      const statusUrl = pixazoStatusUrlFor(submitted);

      for (let poll = 0; poll < maxPixazoPolls; poll += 1) {
        if (poll > 0) await delay(pixazoPollIntervalMs);
        const status = await parsePixazoResponse(await fetch(statusUrl, {
          headers: { "Ocp-Apim-Subscription-Key": apiKey },
        }));
        if (status.status === "COMPLETED") {
          const mediaUrl = status.output?.media_url?.[0];
          if (mediaUrl?.startsWith("https://")) return mediaUrl;
          throw new Error("Pixazo completed the request without an image URL.");
        }
        if (status.status === "FAILED" || status.status === "ERROR")
          throw new Error(status.error || `Pixazo image request ${status.status.toLowerCase()}.`);
      }

      throw new Error("Pixazo image generation timed out.");
    } catch (error: unknown) {
      if (attempt === maxProviderAttempts) {
        console.warn(
          `Failed to generate preview image for style "${recommendation.styleName}":`,
          error instanceof Error ? error.message : "Unknown provider error."
        );
        return undefined;
      }
      await delay(1000 * attempt);
    }
  }
};

export const generateAiConsultation = async (
  input: AiConsultationInput,
  file: Express.Multer.File
): Promise<AiConsultationWithImages> => {
  const mimeType = await verifyImage(file);
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey)
    throw new GeminiConsultationError("AI consultation is not configured. Please contact the salon.");

  const client = new GoogleGenAI({ apiKey });

  for (let attempt = 1; attempt <= maxProviderAttempts; attempt += 1) {
    try {
      const response = await client.models.generateContent({
        model: textModel,
        contents: [
          { text: promptFor(input) },
          { inlineData: { mimeType, data: file.buffer.toString("base64") } },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: consultationSchema,
        },
      });

      if (!response.text) throw new Error("Gemini returned an empty response.");

      const parsed: unknown = JSON.parse(response.text);
      if (!isModelResponse(parsed)) throw new Error("Gemini returned an invalid consultation response.");

      if (!parsed.imageSuitable)
        throw new UnsuitableConsultationImageError(
          parsed.validationMessage ||
            "Please upload a clear, well-lit photo showing the requested hair or beard area."
        );

      const addPreview = async (recommendation: StyleRecommendation): Promise<PreviewRecommendation> => {
        const previewImage = await generateStylePreviewImage(input, recommendation);
        return {
          ...recommendation,
          ...(previewImage ? { previewImage } : {}),
          previewStatus: previewImage ? "generated" : "unavailable",
        };
      };
      const haircutRecommendations = [] as AiConsultationWithImages["haircutRecommendations"];
      for (const recommendation of parsed.haircutRecommendations)
        haircutRecommendations.push(await addPreview(recommendation));

      const beardRecommendations = [] as AiConsultationWithImages["beardRecommendations"];
      for (const recommendation of parsed.beardRecommendations)
        beardRecommendations.push(await addPreview(recommendation));

      return {
        consultationType: input.requestType,
        haircutRecommendations,
        beardRecommendations,
        maintenanceTips: parsed.maintenanceTips,
        disclaimer,
      };
    } catch (error: unknown) {
      if (error instanceof UnsuitableConsultationImageError) throw error;

      if (attempt < maxProviderAttempts) {
        await delay(3000);
      } else {
        console.error(
          "Gemini AI consultation request failed:",
          error instanceof Error ? error.message : "Unknown provider error."
        );
      }
    }
  }

  throw new GeminiConsultationError(
    "AI consultation is temporarily unavailable. Please try again shortly."
  );
};
