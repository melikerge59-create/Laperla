"use client";

import Link from "next/link";
import { useState } from "react";
import { formatClientApiError } from "@/lib/client-api-error";
import { consumeAuthReturnPath } from "@/lib/client-session";

export function RegisterForm() {
  const [err, setErr] = useState<string | null>(null);

  return (
    <form
      style={{ display: "grid", gap: 12, marginTop: 16 }}
      onSubmit={async (e) => {
        e.preventDefault();
        setErr(null);
        const fd = new FormData(e.currentTarget);
        const name = String(fd.get("name") ?? "").trim();
        const email = String(fd.get("email") ?? "").trim();
        const password = String(fd.get("password") ?? "");
        if (!email || password.length < 6) {
          setErr("E-posta ve en az 6 karakter şifre gerekli.");
          return;
        }
        const r = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password, name: name || undefined }),
        });
        const j = (await r.json().catch(() => ({}))) as { error?: string; retryAfterSec?: number };
        if (!r.ok) {
          setErr(formatClientApiError(r.status, j, "Kayıt başarısız"));
          return;
        }
        const nextAfterReg = consumeAuthReturnPath();
        window.location.assign(
          nextAfterReg && nextAfterReg.startsWith("/") && !nextAfterReg.startsWith("//") ? nextAfterReg : "/hesabim",
        );
      }}
    >
      <input
        name="name"
        type="text"
        placeholder="Ad Soyad (isteğe bağlı)"
        autoComplete="name"
        style={{
          border: "1px solid rgba(196,124,124,.22)",
          background: "rgba(255,250,250,.9)",
          borderRadius: 14,
          padding: 14,
          outline: "none",
        }}
      />
      <input
        name="email"
        type="email"
        required
        placeholder="E-posta"
        autoComplete="email"
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
        minLength={6}
        placeholder="Şifre (en az 6 karakter — demo)"
        autoComplete="new-password"
        style={{
          border: "1px solid rgba(196,124,124,.22)",
          background: "rgba(255,250,250,.9)",
          borderRadius: 14,
          padding: 14,
          outline: "none",
        }}
      />
      {err ? (
        <p className="m-desc" style={{ margin: 0, color: "#b44", fontSize: 13 }}>
          {err}
        </p>
      ) : null}
      <button className="m-add" type="submit" style={{ border: "none", cursor: "pointer" }}>
        Kayıt Ol
      </button>
      <p className="m-desc" style={{ margin: 0, textAlign: "center" }}>
        Zaten hesabınız var mı?{" "}
        <Link href="/giris" style={{ color: "var(--gold)", fontWeight: 600 }}>
          Giriş yap
        </Link>
        {" · "}
        <Link href="/sifremi-unuttum" style={{ color: "var(--gold)", fontWeight: 600 }}>
          Şifremi unuttum
        </Link>
      </p>
    </form>
  );
}
