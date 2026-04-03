export const LP_COOKIE_STORAGE_KEY = "lp_cookie_consent_v1";

export type LpCookieConsent = "all" | "essential";

export function readCookieConsentClient(): LpCookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(LP_COOKIE_STORAGE_KEY);
    if (v === "all" || v === "essential") return v;
    return null;
  } catch {
    return null;
  }
}

export function writeCookieConsentClient(choice: LpCookieConsent): void {
  try {
    localStorage.setItem(LP_COOKIE_STORAGE_KEY, choice);
  } catch {
    /* private mode vb. */
  }
  try {
    window.dispatchEvent(new CustomEvent<LpCookieConsent>("lp-cookie-consent", { detail: choice }));
  } catch {
    /* */
  }
}
