"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { type LpCookieConsent, readCookieConsentClient, writeCookieConsentClient } from "@/lib/cookie-consent";

export function CookieConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setMounted(true);
      setOpen(readCookieConsentClient() === null);
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.paddingBottom;
    document.body.style.paddingBottom = "max(96px, 12vh)";
    return () => {
      document.body.style.paddingBottom = prev;
    };
  }, [open]);

  if (!mounted || !open) return null;

  function choose(choice: LpCookieConsent) {
    writeCookieConsentClient(choice);
    setOpen(false);
  }

  return (
    <div
      className="cookie-consent-bar"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
    >
      <div className="cookie-consent-inner">
        <div style={{ flex: "1 1 280px", minWidth: 0 }}>
          <p id="cookie-consent-title" style={{ margin: 0, fontWeight: 600, fontSize: 15, color: "rgba(122, 58, 58, 0.98)" }}>
            Çerez kullanımı
          </p>
          <p className="m-desc" style={{ margin: "8px 0 0 0", fontSize: 13, lineHeight: 1.55, color: "rgba(122, 58, 58, 0.88)" }}>
            Alışveriş sepeti, oturum ve site güvenliği için zorunlu çerezler kullanılır. İsterseniz analiz / pazarlama çerezlerini de kabul
            edebilirsiniz. Ayrıntılar için{" "}
            <Link href="/kvkk#cerezler" style={{ color: "var(--gold)", fontWeight: 600 }}>
              KVKK ve çerez bilgisi
            </Link>
            .
          </p>
        </div>
        <div
          style={{
            flex: "0 1 auto",
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
          }}
        >
          <button
            type="button"
            className="mini"
            style={{
              border: "1px solid rgba(196,124,124,.35)",
              background: "transparent",
              color: "rgba(122, 58, 58, 0.95)",
              padding: "10px 16px",
              borderRadius: 12,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
            onClick={() => choose("essential")}
          >
            Yalnızca zorunlu
          </button>
          <button
            type="button"
            className="btn primary"
            style={{ border: "none", cursor: "pointer", padding: "10px 18px", fontSize: 13 }}
            onClick={() => choose("all")}
          >
            Tümünü kabul et
          </button>
        </div>
      </div>
    </div>
  );
}
