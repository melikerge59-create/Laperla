"use client";

import Link from "next/link";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="section white" style={{ paddingTop: 48, paddingBottom: 64, textAlign: "center" }}>
      <div className="lp-container">
        <h1 style={{ margin: 0, fontFamily: "var(--font-display), serif", fontWeight: 400, fontSize: 32 }}>
          Yönetim paneli — hata
        </h1>
        <p className="m-desc" style={{ marginTop: 16, maxWidth: 440, marginLeft: "auto", marginRight: "auto" }}>
          Panel bu istekte yüklenemedi. Tekrar deneyebilir veya ana sayfaya dönebilirsiniz.
        </p>
        {process.env.NODE_ENV === "development" ? (
          <pre
            style={{
              marginTop: 20,
              textAlign: "left",
              fontSize: 12,
              padding: 16,
              borderRadius: 12,
              background: "rgba(245, 224, 224, 0.45)",
              overflow: "auto",
              maxWidth: 560,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {error.message}
          </pre>
        ) : null}
        <div style={{ marginTop: 28, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button type="button" className="btn primary" onClick={() => reset()}>
            Yeniden dene
          </button>
          <Link href="/admin" className="btn ghost" style={{ textDecoration: "none", display: "inline-flex" }}>
            Panele dön
          </Link>
          <Link href="/" className="btn ghost" style={{ textDecoration: "none", display: "inline-flex" }}>
            Site
          </Link>
        </div>
      </div>
    </section>
  );
}
