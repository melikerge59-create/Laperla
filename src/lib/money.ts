/** `priceCents` = TL'nin kuruşu (890 TL → 89000) */
export function formatTryFromKurus(kurus: number): string {
  const lira = kurus / 100;
  return `${lira.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} ₺`;
}
