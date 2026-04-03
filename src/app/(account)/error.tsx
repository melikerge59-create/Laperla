"use client";

import Link from "next/link";

export default function AccountSectionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="panel" style={{ padding: 32, textAlign: "center" }}>
      <h2 style={{ margin: 0, fontFamily: "var(--font-display), serif", fontWeight: 400, fontSize: 26 }}>Bir şeyler ters gitti</h2>
      <p className="m-desc" style={{ marginTop: 12 }}>
        Hesap alanı yüklenirken hata oluştu. Tekrar deneyin veya ana sayfaya dönün.
      </p>
      {process.env.NODE_ENV === "development" ? (
        <pre
          style={{
            marginTop: 16,
            textAlign: "left",
            fontSize: 11,
            padding: 12,
            borderRadius: 12,
            background: "rgba(245, 224, 224, 0.45)",
            overflow: "auto",
          }}
        >
          {error.message}
        </pre>
      ) : null}
      <div style={{ marginTop: 24, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <button type="button" className="btn primary" onClick={() => reset()}>
          Yeniden dene
        </button>
        <Link href="/hesabim" className="mini" style={{ display: "inline-flex", alignItems: "center" }}>
          Hesabıma dön
        </Link>
        <Link href="/" className="mini" style={{ display: "inline-flex", alignItems: "center" }}>
          Ana sayfa
        </Link>
      </div>
    </div>
  );
}
