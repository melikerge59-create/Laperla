"use client";

import Link from "next/link";
import { useState } from "react";
import { formatClientApiError } from "@/lib/client-api-error";

export function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const r = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const j = (await r.json()) as { ok?: boolean; message?: string; error?: string; retryAfterSec?: number };
      if (!r.ok) {
        setErr(formatClientApiError(r.status, j, "İstek gönderilemedi"));
        return;
      }
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    border: "1px solid rgba(196,124,124,.22)",
    background: "rgba(255,250,250,.9)",
    borderRadius: 14,
    padding: 14,
    outline: "none" as const,
    width: "100%" as const,
    fontSize: 14,
  };

  return (
    <div className="panel" style={{ maxWidth: 520, margin: "0 auto" }}>
      <h3 style={{ margin: 0, fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 34 }}>Şifremi unuttum</h3>
      <p className="m-desc" style={{ margin: "12px 0 0 0", fontSize: 13, lineHeight: 1.65 }}>
        Kayıtlı e-posta adresinize tek kullanımlık sıfırlama bağlantısı gönderilir. Bağlantı 1 saat geçerlidir.
      </p>

      {done ? (
        <div
          style={{
            marginTop: 20,
            padding: 14,
            borderRadius: 14,
            background: "rgba(224, 242, 224, 0.45)",
            fontSize: 13,
            lineHeight: 1.65,
            color: "rgba(46, 100, 50, 0.95)",
          }}
        >
          Talebiniz alındı. Gelen kutunuzu (ve gerekiyorsa spam klasörünü) kontrol edin. Google ile kayıt olduysanız ve şifre belirlemediyseniz
          e-posta gelmeyebilir — o durumda giriş penceresinden Google ile devam edin veya hesabınızdan şifre tanımlayın.
        </div>
      ) : (
        <form style={{ marginTop: 20, display: "grid", gap: 12 }} onSubmit={(e) => void onSubmit(e)}>
          {err ? (
            <p className="m-desc" style={{ margin: 0, color: "#b44", fontSize: 13 }}>
              {err}
            </p>
          ) : null}
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="E-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          <button type="submit" className="btn primary" disabled={loading} style={{ border: "none", cursor: "pointer" }}>
            {loading ? "Gönderiliyor…" : "Bağlantı gönder"}
          </button>
        </form>
      )}

      <p style={{ marginTop: 24, fontSize: 13 }}>
        <Link href="/" style={{ color: "var(--gold)", fontWeight: 600 }}>
          Ana sayfa
        </Link>
        {" · "}
        <Link href="/kayit" style={{ color: "var(--gold)", fontWeight: 600 }}>
          Kayıt ol
        </Link>
      </p>
    </div>
  );
}
