/** API JSON yanıtlarında 429 + retryAfterSec ve ek alanlar için kullanıcı mesajı (istemci). */
export function formatClientApiError(
  status: number,
  j: { error?: string; retryAfterSec?: number; hint?: string; detail?: string },
  fallback: string,
): string {
  const base = j.error ?? fallback;
  if (status === 429 && typeof j.retryAfterSec === "number") {
    return `${base}\n\nYaklaşık ${j.retryAfterSec} sn sonra tekrar deneyin.`;
  }
  const parts = [base, j.hint, j.detail].filter(Boolean);
  return parts.join("\n\n");
}
