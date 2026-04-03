/** HS256 için ortak secret (middleware + API). */
export function jwtSecretBytes(): Uint8Array {
  const s = process.env.AUTH_SECRET?.trim();
  if (s && s.length >= 16) return new TextEncoder().encode(s);
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET ortam değişkeni üretimde zorunludur (en az 16 karakter).");
  }
  return new TextEncoder().encode("dev-only-laperla-auth!");
}
