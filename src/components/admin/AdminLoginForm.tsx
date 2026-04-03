"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm() {
  const searchParams = useSearchParams();
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      const email = String(fd.get("email") ?? "").trim();
      const password = String(fd.get("password") ?? "");
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const j = (await r.json().catch(() => ({}))) as {
        error?: string;
        user?: { role?: string };
      };
      if (!r.ok) {
        setErr(j.error ?? "Giriş başarısız");
        return;
      }
      if (j.user?.role !== "ADMIN") {
        await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        setErr("Bu hesap yönetici yetkisine sahip değil.");
        return;
      }
      const next = searchParams.get("next");
      const dest = next && next.startsWith("/") && !next.startsWith("//") ? next : "/admin";
      // Tam sayfa geçişi: Set-Cookie sonrası middleware oturumu kesin görür
      window.location.assign(dest);
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
  };

  return (
    <form className="panel" style={{ maxWidth: 440, margin: "0 auto", padding: 28, display: "grid", gap: 14 }} onSubmit={(e) => void onSubmit(e)}>
      <h1 style={{ margin: 0, fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 32 }}>Yönetici girişi</h1>
      <p className="m-desc" style={{ margin: 0, fontSize: 13, lineHeight: 1.65 }}>
        Yönetim paneline erişmek için yönetici e-posta ve şifrenizi girin.
      </p>
      <p className="m-desc" style={{ margin: 0, fontSize: 11, lineHeight: 1.5, opacity: 0.9 }}>
        .env içinde <code style={{ fontSize: 10 }}>ADMIN_SEED_PASSWORD</code> değiştirdiyseniz veritabanına yazmak için{" "}
        <code style={{ fontSize: 10 }}>npm run db:seed</code> çalıştırın.
      </p>
      {err ? (
        <p className="m-desc" style={{ margin: 0, color: "#b44", fontSize: 13 }}>
          {err}
        </p>
      ) : null}
      <input name="email" type="email" required autoComplete="username" placeholder="Yönetici e-posta" style={inputStyle} />
      <input name="password" type="password" required autoComplete="current-password" placeholder="Şifre" style={inputStyle} />
      <button type="submit" className="btn primary" disabled={loading} style={{ border: "none", cursor: "pointer" }}>
        {loading ? "Giriş yapılıyor…" : "Giriş yap"}
      </button>
      <p className="m-desc" style={{ margin: 0, fontSize: 12 }}>
        <Link href="/" style={{ color: "var(--gold)", fontWeight: 600 }}>
          Mağazaya dön
        </Link>
      </p>
    </form>
  );
}
