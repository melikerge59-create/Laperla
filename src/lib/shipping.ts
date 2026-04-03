/** Sabit kargo ücreti (kuruş). Boş veya geçersizse 0. Ücretsiz kargo eşiği için `computeShippingCents`. */
export function getShippingCents(): number {
  const v = process.env.SHIPPING_CENTS?.trim();
  if (!v) return 0;
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/**
 * Ara toplam (kuruş) bu değere eşit veya üzerindeyse kargo ücreti uygulanmaz.
 * `FREE_SHIPPING_SUBTOTAL_CENTS` tanımlı değilse veya geçersizse `null` (eşik kapalı).
 */
export function getFreeShippingSubtotalThresholdCents(): number | null {
  const v = process.env.FREE_SHIPPING_SUBTOTAL_CENTS?.trim();
  if (!v) return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Sepet ara toplamına göre uygulanacak kargo (kuruş). */
export function computeShippingCents(subtotalCents: number): number {
  const threshold = getFreeShippingSubtotalThresholdCents();
  if (threshold != null && subtotalCents >= threshold) return 0;
  return getShippingCents();
}
