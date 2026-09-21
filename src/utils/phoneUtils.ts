/** Converts common Sri Lankan mobile formats to the HostGrap-required digits-only form. */
export const normalizeWhatsAppPhone = (value: string): string | null => {
  const digits = value.trim().replace(/[^\d+]/g, "").replace(/^\+/, "");
  const normalized = digits.startsWith("0")
    ? `94${digits.slice(1)}`
    : digits;

  return /^947\d{8}$/.test(normalized) ? normalized : null;
};
