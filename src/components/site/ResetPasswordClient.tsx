"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { formatClientApiError } from "@/lib/client-api-error";

export function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token")?.trim() ?? "", [searchParams]);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const inputStyle = {
    border: "1px solid rgba(196,124,124,.22)",
    background: "rgba(255,250,250,.9)",
    borderRadius: 14,
    padding: 14,
    outline: "none" as const,
    width: "100%" as const,
    fontSize: 14,
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (password.length < 6) {
      setErr("Şifre en az 6 karakter olmalı.");
      return;
    }
    if (password !== password2) {
      setErr("Şifreler eşleşmiyor.");
      return;
    }
    if (!token) {
      setErr("Geçersiz bağlantı. E-postadaki linki kullanın veya yeni talep oluşturun.");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const j = (await r.json()) as { ok?: boolean; error?: string; retryAfterSec?: number };
      if (!r.ok) {
        setErr(formatClientApiError(r.status, j, "Şifre güncellenemedi"));
        return;
      }
      router.push("/giris?sifre=1");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel" style={{ maxWidth: 520, margin: "0 auto" }}>
      <h3 style={{ margin: 0, fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 34 }}>Yeni şifre</h3>
      <p className="m-desc" style={{ margin: "12px 0 0 0", fontSize: 13, lineHeight: 1.65 }}>
        E-postadaki bağlantıdan geldiyseniz yeni şifrenizi belirleyin.
      </p>

      {!token ? (
        <p className="m-desc" style={{ marginTop: 16, color: "#b44", fontSize: 13 }}>
          Bağlantıda <code>token</code> yok.{" "}
          <Link href="/sifremi-unuttum" style={{ color: "var(--gold)", fontWeight: 600 }}>
            Yeni sıfırlama talebi
          </Link>
        </p>
      ) : (
        <form style={{ marginTop: 20, display: "grid", gap: 12 }} onSubmit={(e) => void onSubmit(e)}>
          {err ? (
            <p className="m-desc" style={{ margin: 0, color: "#b44", fontSize: 13 }}>
              {err}
            </p>
          ) : null}
          <input
            type="password"
            required
            autoComplete="new-password"
            placeholder="Yeni şifre (en az 6 karakter)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password"
            required
            autoComplete="new-password"
            placeholder="Yeni şifre (tekrar)"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            style={inputStyle}
          />
          <button type="submit" className="btn primary" disabled={loading} style={{ border: "none", cursor: "pointer" }}>
            {loading ? "Kaydediliyor…" : "Şifreyi kaydet"}
          </button>
        </form>
      )}

      <p style={{ marginTop: 24, fontSize: 13 }}>
        <Link href="/" style={{ color: "var(--gold)", fontWeight: 600 }}>
          Ana sayfa
        </Link>
      </p>
    </div>
  );
}
