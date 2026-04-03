import { brandWhatsAppDigits, isBrandWhatsAppConfigured } from "@/lib/brand";

export function FloatWhatsApp() {
  if (!isBrandWhatsAppConfigured()) return null;
  const href = `https://wa.me/${brandWhatsAppDigits()}`;
  return (
    <a className="float-wa" href={href} target="_blank" rel="noreferrer" aria-label="WhatsApp ile yaz">
      💬
    </a>
  );
}
