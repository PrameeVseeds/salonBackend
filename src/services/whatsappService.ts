import { normalizeWhatsAppPhone } from "../utils/phoneUtils.js";

export interface WhatsAppSendResult {
  success: boolean;
  providerMessageId?: string;
  message?: string;
}

const DEFAULT_URL = "https://wa-api.hostgrap.com/api/send-message.php";
const REQUEST_TIMEOUT_MS = 15_000;

const providerIndicatesFailure = (payload: unknown): boolean => {
  if (!payload || typeof payload !== "object") return false;
  const value = payload as Record<string, unknown>;
  return value.success === false || value.status === false ||
    (typeof value.status === "string" && /fail|error/i.test(value.status));
};

const providerMessage = (payload: unknown, fallback: string): string => {
  if (!payload || typeof payload !== "object") return fallback;
  const value = payload as Record<string, unknown>;
  return typeof value.message === "string" ? value.message : fallback;
};

export const sendWhatsAppMessage = async (phone: string, message: string): Promise<WhatsAppSendResult> => {
  if (process.env.WHATSAPP_ENABLED?.toLowerCase() !== "true")
    return { success: false, message: "WhatsApp reminders are disabled." };

  const email = process.env.WA_API_EMAIL;
  const apiKey = process.env.WA_API_KEY;
  if (!email || !apiKey) {
    console.error("WhatsApp reminder configuration is incomplete.");
    return { success: false, message: "WhatsApp provider is not configured." };
  }

  const normalizedPhone = normalizeWhatsAppPhone(phone);
  if (!normalizedPhone)
    return { success: false, message: "Customer phone number is not a valid Sri Lankan mobile number." };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(process.env.WA_API_URL || DEFAULT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ email, api_key: apiKey, phone: normalizedPhone, message }).toString(),
      signal: controller.signal,
    });
    const responseText = await response.text();
    let payload: unknown = responseText;
    try { payload = JSON.parse(responseText) as unknown; } catch { /* Provider may return plain text. */ }

    if (!response.ok)
      return { success: false, message: `WhatsApp provider returned HTTP ${response.status}.` };
    if (providerIndicatesFailure(payload))
      return { success: false, message: providerMessage(payload, "WhatsApp provider rejected the message.") };

    const objectPayload = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
    const providerMessageId = [objectPayload.message_id, objectPayload.messageId, objectPayload.id]
      .find((value): value is string => typeof value === "string");
    return { success: true, providerMessageId, message: providerMessage(payload, "WhatsApp message accepted.") };
  } catch (error) {
    const messageText = error instanceof Error && error.name === "AbortError"
      ? "WhatsApp provider request timed out."
      : "WhatsApp provider request failed.";
    console.error(messageText, error instanceof Error ? error.message : error);
    return { success: false, message: messageText };
  } finally {
    clearTimeout(timeout);
  }
};
