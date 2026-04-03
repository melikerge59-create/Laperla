import { brand } from "@/lib/brand";

/**
 * KVKK / mesafeli satış / footer metinleri için. Değerleri `.env` ile doldurun (bkz. `docs/ISLETME_KONTROL_LISTESI.md`).
 * Sunucu tarafında okunur; gizli bilgi değil, hukuk metninde yer alır.
 */
export type BusinessProfile = {
  tradeName: string;
  legalName: string;
  addressLines: string[];
  phone: string;
  email: string;
  mersisOrTax: string;
};

export function getBusinessProfile(): BusinessProfile {
  const rawAddr = process.env.SITE_ADDRESS?.trim();
  const addressLines = rawAddr
    ? rawAddr.split(/\n|\\n/).map((s) => s.trim()).filter(Boolean)
    : [...brand.address.lines];

  return {
    tradeName: process.env.SITE_TRADE_NAME?.trim() || brand.name,
    legalName:
      process.env.SITE_LEGAL_NAME?.trim() ||
      `${brand.name} — [SITE_LEGAL_NAME: tüzel ünvan / ticari unvan]`,
    addressLines,
    phone: process.env.SITE_PHONE?.trim() || "",
    email: process.env.SITE_CONTACT_EMAIL?.trim() || "",
    mersisOrTax:
      process.env.SITE_MERSIS?.trim() || "[SITE_MERSIS: MERSİS veya VKN — vergi dairesinden teyit]",
  };
}

export function businessContactBlock(bp: BusinessProfile): string {
  const lines = [
    bp.legalName,
    ...bp.addressLines.map((l) => l),
    bp.phone ? `Tel: ${bp.phone}` : "Tel: [SITE_PHONE]",
    bp.email ? `E-posta: ${bp.email}` : "E-posta: [SITE_CONTACT_EMAIL]",
    `MERSİS / VKN: ${bp.mersisOrTax}`,
  ];
  return lines.join("\n");
}
