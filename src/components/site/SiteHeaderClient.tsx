"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useCallback, useEffect, useMemo, useState } from "react";
import { brand, brandWhatsAppDigits, isBrandWhatsAppConfigured } from "@/lib/brand";
import { cartLineItemCount, getCart } from "@/lib/client-cart";
import { formatClientApiError } from "@/lib/client-api-error";
import { consumeAuthReturnPath } from "@/lib/client-session";

type GoogleCredentialResponse = { credential?: string };

export type HeaderUser = {
  email: string;
  name: string | null;
  role: "CUSTOMER" | "ADMIN";
};

export function SiteHeaderClient({
  googleClientId,
  user,
  freeShippingPromo,
}: {
  googleClientId: string;
  user: HeaderUser | null;
  /** `FREE_SHIPPING_SUBTOTAL_CENTS` tanımlıysa ödeme sayfası ile aynı metin. */
  freeShippingPromo: string | null;
}) {
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [fetchedClientId, setFetchedClientId] = useState("");
  const [googleConfigFetched, setGoogleConfigFetched] = useState(false);
  const [pageOrigin, setPageOrigin] = useState("");
  const waBase = useMemo(
    () => (isBrandWhatsAppConfigured() ? `https://wa.me/${brandWhatsAppDigits()}` : ""),
    [],
  );
  const effectiveGoogleClientId = (googleClientId || fetchedClientId).trim();

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "lp_cart" || e.key === null) setCartCount(cartLineItemCount(getCart()));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const syncCart = useCallback(() => setCartCount(cartLineItemCount(getCart())), []);

  useEffect(() => {
    syncCart();
    window.addEventListener("lp-cart-changed", syncCart);
    return () => window.removeEventListener("lp-cart-changed", syncCart);
  }, [syncCart]);

  useEffect(() => {
    if (!loginOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLoginOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [loginOpen]);

  useEffect(() => {
    document.body.style.overflow = loginOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [loginOpen]);

  useEffect(() => {
    if (loginOpen) setPageOrigin(typeof window !== "undefined" ? window.location.origin : "");
  }, [loginOpen]);

  useEffect(() => {
    if (!loginOpen) return;
    setLoginError(null);
    setGoogleConfigFetched(false);
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/config/google-client-id", { cache: "no-store" });
        const j = (await r.json()) as { clientId?: string };
        if (!cancelled && j.clientId) setFetchedClientId(j.clientId.trim());
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setGoogleConfigFetched(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loginOpen]);

  useEffect(() => {
    if (!loginOpen) return;
    const w = window as unknown as {
      google?: {
        accounts?: {
          id?: {
            initialize?: (args: Record<string, unknown>) => void;
            renderButton?: (el: HTMLElement, opts: Record<string, unknown>) => void;
          };
        };
      };
    };

    const mount = document.getElementById("googleBtnMount");
    if (!mount) return;
    mount.innerHTML = "";

    if (!googleClientId.trim() && !googleConfigFetched) {
      mount.textContent = "Google ayarları yükleniyor…";
      return;
    }

    if (!effectiveGoogleClientId) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn-google-fallback";
      btn.textContent = "Google ile giriş (Client ID gerekli)";
      btn.onclick = () =>
        window.alert(
          "Google Client ID bulunamadı. .env içinde GOOGLE_CLIENT_ID tanımlayın.",
        );
      mount.appendChild(btn);
      return;
    }

    const idApi = w.google?.accounts?.id;
    if (!idApi?.initialize || !idApi?.renderButton) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn-google-fallback";
      btn.textContent = "Google ile giriş";
      btn.onclick = () => window.alert("Google bileşeni yükleniyor. Birkaç saniye sonra tekrar deneyin.");
      mount.appendChild(btn);
      return;
    }

    idApi.initialize({
      client_id: effectiveGoogleClientId,
      callback: async (resp: GoogleCredentialResponse) => {
        const cred = resp?.credential;
        if (!cred) return;
        const r = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ credential: cred }),
        });
        if (!r.ok) {
          const j = (await r.json().catch(() => ({}))) as {
            error?: string;
            hint?: string;
            detail?: string;
            retryAfterSec?: number;
          };
          setLoginError(formatClientApiError(r.status, j, "Google girişi başarısız"));
          return;
        }
        setLoginOpen(false);
        const nextAfterGoogle = consumeAuthReturnPath();
        if (nextAfterGoogle && nextAfterGoogle.startsWith("/") && !nextAfterGoogle.startsWith("//")) {
          window.location.assign(nextAfterGoogle);
        } else {
          window.location.reload();
        }
      },
      use_fedcm_for_prompt: false,
    } as Parameters<NonNullable<typeof idApi.initialize>>[0]);
    idApi.renderButton(mount, { theme: "outline", size: "large", width: 360, text: "signin_with" });
  }, [effectiveGoogleClientId, googleClientId, googleConfigFetched, loginOpen]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    window.location.assign("/");
  }

  const displayName = user?.name?.trim() || user?.email || "";

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" async defer />
      <div className="topbar">
        <div className="lp-container">
          <div className="row">
            <span>{freeShippingPromo ?? "Türkiye geneli hızlı teslimat"}</span>
            <span>WhatsApp sipariş</span>
            <span>@laperla_esarp</span>
          </div>
        </div>
      </div>

      <header>
        <div className="lp-container">
          <div className="nav">
            <Link className="brand" href="/">
              <Image className="brand-logo" src="/logo.png" alt="La Perla" width={42} height={42} />
              <div className="brand-text">
                <strong>LA PERLA</strong>
                <span>{brand.tagline}</span>
              </div>
            </Link>

            <ul className="nav-links">
              <li>
                <Link href="/#urunler">Ürünler</Link>
              </li>
              <li>
                <Link href="/#instagram">Instagram</Link>
              </li>
              <li>
                <Link href="/#magaza">Mağaza</Link>
              </li>
              <li>
                <Link href="/#iletisim">İletişim</Link>
              </li>
            </ul>

            <div className="nav-actions">
              <a className="pill" href={brand.instagram} target="_blank" rel="noreferrer">
                Instagram
              </a>
              {waBase ? (
                <a className="pill wa" href={waBase} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
              ) : null}
              {user ? (
                <>
                  <span className="pill" style={{ cursor: "default", opacity: 0.92, maxWidth: 200 }} title={user.email}>
                    ✓ {displayName.length > 24 ? `${displayName.slice(0, 22)}…` : displayName}
                  </span>
                  <Link className="pill pill-keep" href="/hesabim">
                    Hesabım
                  </Link>
                  {user.role === "ADMIN" ? (
                    <Link className="pill pill-keep" href="/admin">
                      Yönetim
                    </Link>
                  ) : null}
                  <button className="pill" type="button" onClick={() => void logout()}>
                    Çıkış
                  </button>
                </>
              ) : (
                <>
                  <Link className="pill pill-keep" href="/admin/giris" style={{ textDecoration: "none" }}>
                    Yönetim girişi
                  </Link>
                  <button className="pill pill-keep" id="loginBtn" type="button" onClick={() => setLoginOpen(true)}>
                    Giriş Yap
                  </button>
                </>
              )}
              <Link className="icon-btn" href="/sepet" aria-label="Sepeti aç">
                <span aria-hidden="true">🛍️</span>
                <span className="badge" style={{ display: cartCount > 0 ? "flex" : "none" }}>
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div
        className={`overlay${loginOpen ? " open" : ""}`}
        id="loginOverlay"
        role="dialog"
        aria-modal="true"
        aria-label="Giriş yap"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) setLoginOpen(false);
        }}
      >
        <div className="modal-wrap">
          <button className="modal-close" type="button" onClick={() => setLoginOpen(false)}>
            ✕
          </button>
          <div className="modal">
            <div className="modal-left login-left" aria-hidden="true">
              <Image src="/logo.png" width={260} height={260} alt="La Perla — Eşarp & Aksesuar" />
              <span className="login-tagline">{brand.tagline}</span>
            </div>
            <div className="modal-right">
              <div className="m-brand">LA PERLA</div>
              <h3 className="m-name" style={{ marginBottom: 2 }}>
                Giriş Yap
              </h3>
              <p className="m-desc">E-posta ve şifre veya Google ile giriş yapın.</p>

              <p className="m-desc" style={{ margin: "0 0 8px 0", fontSize: 12 }}>
                Mağaza müşterisi değil, <strong>yönetici</strong> misiniz?{" "}
                <Link href="/admin/giris" style={{ color: "var(--gold)", fontWeight: 600 }} onClick={() => setLoginOpen(false)}>
                  Yönetim paneli girişi →
                </Link>
              </p>

              {loginError ? (
                <p className="m-desc" style={{ color: "#b44", margin: "0 0 10px 0", fontSize: 12, whiteSpace: "pre-line" }}>
                  {loginError}
                </p>
              ) : null}

              {process.env.NODE_ENV === "development" && effectiveGoogleClientId && pageOrigin ? (
                <div
                  className="m-desc"
                  style={{
                    margin: "0 0 10px 0",
                    padding: 10,
                    fontSize: 11,
                    lineHeight: 1.55,
                    borderRadius: 10,
                    background: "rgba(245, 224, 224, 0.35)",
                    border: "1px solid rgba(196,124,124,.22)",
                    color: "rgba(90, 48, 48, 0.95)",
                  }}
                >
                  <strong>Hata 400: origin_mismatch</strong> alıyorsanız Google Cloud Console → OAuth Web client →{" "}
                  <em>Authorized JavaScript origins</em> listesine <strong>aynen</strong> (sonda / olmadan) şunu ekleyin:
                  <code style={{ display: "block", marginTop: 8, wordBreak: "break-all", fontSize: 11 }}>{pageOrigin}</code>
                  <span style={{ display: "block", marginTop: 8, opacity: 0.92 }}>
                    Aynı siteyi bazen <code style={{ fontSize: 10 }}>127.0.0.1</code> ile açıyorsanız o kökeni de ayrı satır olarak
                    ekleyin; Safari adres çubuğunda port görünmese bile genelde <code style={{ fontSize: 10 }}>:3000</code> kullanılır.
                  </span>
                </div>
              ) : null}

              <div id="googleBtnMount" />
              <div className="auth-or">veya</div>

              <form
                style={{ display: "grid", gap: 10, marginTop: 0 }}
                onSubmit={async (e) => {
                  e.preventDefault();
                  setLoginError(null);
                  const fd = new FormData(e.currentTarget);
                  const email = String(fd.get("email") ?? "").trim();
                  const password = String(fd.get("password") ?? "");
                  const r = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ email, password }),
                  });
                  const j = (await r.json().catch(() => ({}))) as { error?: string; retryAfterSec?: number };
                  if (!r.ok) {
                    setLoginError(formatClientApiError(r.status, j, "Giriş başarısız"));
                    return;
                  }
                  setLoginOpen(false);
                  const nextAfterLogin = consumeAuthReturnPath();
                  if (nextAfterLogin && nextAfterLogin.startsWith("/") && !nextAfterLogin.startsWith("//")) {
                    window.location.assign(nextAfterLogin);
                  } else {
                    window.location.reload();
                  }
                }}
              >
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="E-posta"
                  style={{
                    border: "1px solid rgba(196,124,124,.22)",
                    background: "rgba(255,250,250,.9)",
                    borderRadius: 14,
                    padding: 14,
                    outline: "none",
                  }}
                />
                <input
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="Şifre"
                  style={{
                    border: "1px solid rgba(196,124,124,.22)",
                    background: "rgba(255,250,250,.9)",
                    borderRadius: 14,
                    padding: 14,
                    outline: "none",
                  }}
                />
                <p className="m-desc" style={{ margin: 0, textAlign: "right", fontSize: 12 }}>
                  <Link href="/sifremi-unuttum" style={{ color: "var(--gold)", fontWeight: 600 }} onClick={() => setLoginOpen(false)}>
                    Şifremi unuttum
                  </Link>
                </p>
                <button className="m-add" type="submit">
                  Giriş Yap
                </button>
              </form>

              <p className="m-desc" style={{ marginTop: 8, marginBottom: 0 }}>
                Hesabınız yok mu?{" "}
                <Link href="/kayit" style={{ color: "var(--gold)", fontWeight: 600 }} onClick={() => setLoginOpen(false)}>
                  Kayıt ol
                </Link>
              </p>

              <div style={{ marginTop: "auto", display: "flex", gap: 10, flexWrap: "wrap" }}>
                {waBase ? (
                  <a className="mini" href={waBase} target="_blank" rel="noreferrer">
                    WhatsApp
                  </a>
                ) : null}
                <a className="mini" href={brand.instagram} target="_blank" rel="noreferrer">
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
