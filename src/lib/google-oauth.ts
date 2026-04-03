/**
 * Google Identity Services (Web) için yapılandırılmış Client ID’ler.
 * Sıra: GOOGLE_CLIENT_ID → NEXT_PUBLIC_GOOGLE_CLIENT_ID (ikisi de dolu ama farklıysa
 * tarayıcı birinciyi kullanır; sunucu doğrulaması hepsini audience olarak kabul eder).
 */
export function getGoogleWebClientIds(): string[] {
  const a = process.env.GOOGLE_CLIENT_ID?.trim();
  const b = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  return [...new Set([a, b].filter(Boolean) as string[])];
}

export function primaryGoogleWebClientId(): string {
  return getGoogleWebClientIds()[0] ?? "";
}
