const REDIRECT_KEY = "lp_post_login_redirect";

/** Giriş sonrası güvenli iç yol (örn. /hesabim/siparisler). */
export function setPostLoginRedirect(path: string) {
  if (typeof window === "undefined") return;
  if (!path.startsWith("/") || path.startsWith("//")) return;
  try {
    sessionStorage.setItem(REDIRECT_KEY, path);
  } catch {
    /* ignore */
  }
}

export function consumePostLoginRedirect(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const p = sessionStorage.getItem(REDIRECT_KEY);
    sessionStorage.removeItem(REDIRECT_KEY);
    if (p && p.startsWith("/") && !p.startsWith("//")) return p;
  } catch {
    /* ignore */
  }
  return null;
}

/** Önce `?next=` sorgu parametresi, yoksa sessionStorage yönlendirmesi. */
export function consumeAuthReturnPath(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("next");
    if (raw) {
      let path = raw;
      try {
        path = decodeURIComponent(raw);
      } catch {
        path = raw;
      }
      if (path.startsWith("/") && !path.startsWith("//")) {
        const url = new URL(window.location.href);
        url.searchParams.delete("next");
        const q = url.searchParams.toString();
        window.history.replaceState({}, "", url.pathname + (q ? `?${q}` : "") + url.hash);
        return path;
      }
    }
  } catch {
    /* ignore */
  }
  return consumePostLoginRedirect();
}
