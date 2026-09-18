import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { generateAiConsultation } = vi.hoisted(() => ({ generateAiConsultation: vi.fn() }));
vi.mock("../services/geminiConsultationService.js", () => ({ generateAiConsultation }));
vi.mock("../middleware/customerAuthMiddleware.js", () => ({
  authenticateCustomer: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

import app from "../app.js";

const pngImage = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLZwgAAAABJRU5ErkJggg==",
  "base64",
);
const consultation = {
  consultationType: "haircut",
  haircutRecommendations: [{ 
    styleName: "Textured crop", 
    explanation: "A practical modern option.", 
    barberInstructions: "Use a low taper with textured top." 
  }],
  beardRecommendations: [],
  maintenanceTips: ["Use a light styling cream."],
  disclaimer: "This is an AI-generated suggestion only. Please confirm the final style with your barber, as results may vary.",
};

const validRequest = (requestType = "haircut") => request(app)
  .post("/api/ai-consultation")
  .field("requestType", requestType)
  .attach("image", pngImage, { 
    filename: "consultation.png", 
    contentType: "image/png" 
  });

describe("POST /api/ai-consultation", () => {
  beforeEach(() => {
    generateAiConsultation.mockReset();
    generateAiConsultation.mockResolvedValue(consultation);
  });

  it("rejects a missing image", async () => {
    const response = await request(app).post("/api/ai-consultation").field("requestType", "haircut");
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("A clear consultation image is required.");
  });

  it("rejects an invalid file type", async () => {
    const response = await request(app).post("/api/ai-consultation").field("requestType", "haircut")
      .attach("image", Buffer.from("not an image"), { filename: "photo.gif", contentType: "image/gif" });
    expect(response.status).toBe(400);
  });

  it("rejects a missing consultation type", async () => {
    const response = await request(app).post("/api/ai-consultation")
      .attach("image", pngImage, { filename: "consultation.png", contentType: "image/png" });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Consultation type is required.");
  });

  it("rejects an invalid consultation type", async () => {
    const response = await validRequest("colour");
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Consultation type must be haircut, beard, or both.");
  });

  it.each(["haircut", "beard", "both"])("accepts a valid %s request", async (requestType) => {
    const response = await validRequest(requestType);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(generateAiConsultation).toHaveBeenCalledWith(
      expect.objectContaining({ requestType }),
      expect.objectContaining({ mimetype: "image/png" }),
    );
  });

  it("returns a controlled response when Gemini fails", async () => {
    generateAiConsultation.mockRejectedValue(new Error("provider failed"));
    const response = await validRequest();
    expect(response.status).toBe(502);
    expect(response.body.message).toBe("Unable to generate an AI consultation at this time.");
  });
});
