"use client";

import Link from "next/link";

/**
 * Kök layout hatalarında kullanılır; kendi <html>/<body> kabuğu gerekir.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          fontFamily: "system-ui, sans-serif",
          background: "#fff8f6",
          color: "#5c2a2a",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600 }}>La Perla</h1>
        <p style={{ marginTop: 16, textAlign: "center", maxWidth: 400, lineHeight: 1.55 }}>
          Beklenmeyen bir sorun oluştu. Sayfayı yeniden yüklemeyi deneyebilirsiniz.
        </p>
        {process.env.NODE_ENV === "development" ? (
          <pre
            style={{
              marginTop: 20,
              fontSize: 12,
              padding: 14,
              borderRadius: 12,
              background: "rgba(245, 224, 224, 0.6)",
              overflow: "auto",
              maxWidth: 520,
              width: "100%",
            }}
          >
            {error.message}
          </pre>
        ) : null}
        <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "12px 20px",
              borderRadius: 12,
              border: "none",
              background: "#b78e4b",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Yeniden dene
          </button>
          <Link
            href="/"
            style={{
              padding: "12px 20px",
              borderRadius: 12,
              border: "1px solid rgba(196,124,124,.35)",
              color: "#7a3a3a",
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Ana sayfa
          </Link>
        </div>
      </body>
    </html>
  );
}
