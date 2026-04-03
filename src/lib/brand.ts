const waFromEnv =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_WHATSAPP_E164?.trim()
    ? process.env.NEXT_PUBLIC_WHATSAPP_E164.trim()
    : "90XXXXXXXXXX";

export const brand = {
  name: "La Perla",
  tagline: "Eşarp & Aksesuar",
  instagram: "https://www.instagram.com/laperla_esarp",
  /** `NEXT_PUBLIC_WHATSAPP_E164` (örn. 905551234567) — boşsa yer tutucu */
  whatsappE164: waFromEnv,
  address: {
    lines: [
      "Abdurrahman Gazi Mah.",
      "Sevenler Cad. No: 35",
      "Sancaktepe / İstanbul",
    ],
  },
} as const;

/** wa.me için yalnızca rakamlar */
export function brandWhatsAppDigits(): string {
  return brand.whatsappE164.replace(/\D/g, "");
}

/** Geçerli WhatsApp yönlendirmesi için yeterli rakam (örn. TR: 90 + 10 hane) */
export function isBrandWhatsAppConfigured(): boolean {
  return brandWhatsAppDigits().length >= 12;
}
