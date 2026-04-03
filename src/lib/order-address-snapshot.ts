/** Checkout anında `Order.addressSnapshot` JSON alanını okunur satırlara çevirir. */
export function formatOrderAddressSnapshotLines(snapshot: unknown): string[] {
  if (!snapshot || typeof snapshot !== "object") return [];
  const o = snapshot as Record<string, unknown>;
  const line2 = o.line2 ? String(o.line2) : "";
  const pc = o.postalCode ? String(o.postalCode) : "";
  return [
    [o.title, o.fullName].filter(Boolean).map(String).join(" · "),
    o.phone ? String(o.phone) : "",
    o.line1 ? String(o.line1) : "",
    line2,
    [o.district, o.city].filter(Boolean).map(String).join(" / "),
    pc,
  ].filter(Boolean);
}
