"use client";

import { useState } from "react";

export function ProfileForm({
  initial,
  hasPassword,
  emailVerified,
}: {
  initial: { email: string; name: string; phone: string };
  hasPassword: boolean;
  emailVerified: boolean;
}) {
  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState<string | null>(null);
  const [verifyErr, setVerifyErr] = useState<string | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setSaving(true);
    try {
      const body: Record<string, string> = {
        name: name.trim(),
        phone: phone.trim(),
      };
      if (newPassword) {
        body.newPassword = newPassword;
        if (hasPassword) body.currentPassword = currentPassword;
      }
      const r = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const j = (await r.json().catch(() => ({}))) as { error?: string };
      if (!r.ok) {
        setErr(j.error ?? "Kaydedilemedi");
        return;
      }
      setMsg("Profil güncellendi.");
      setNewPassword("");
      setCurrentPassword("");
    } finally {
      setSaving(false);
    }
  }

  async function sendVerification() {
    setVerifyErr(null);
    setVerifyMsg(null);
    setVerifyLoading(true);
    try {
      const r = await fetch("/api/account/send-verification-email", { method: "POST", credentials: "include" });
      const j = (await r.json()) as { error?: string; message?: string };
      if (!r.ok) {
        setVerifyErr(j.error ?? "Gönderilemedi");
        return;
      }
      setVerifyMsg(j.message ?? "Gönderildi.");
    } finally {
      setVerifyLoading(false);
    }
  }

  return (
    <form onSubmit={(e) => void save(e)} style={{ display: "grid", gap: 14, maxWidth: 420 }}>
      <p className="m-desc" style={{ margin: 0, fontSize: 13 }}>
        E-posta: <strong>{initial.email}</strong> (değiştirilemez)
      </p>
      {emailVerified ? (
        <p style={{ margin: 0, fontSize: 13, color: "rgba(46, 100, 50, 0.92)" }}>✓ E-posta doğrulandı.</p>
      ) : (
        <div
          style={{
            padding: 12,
            borderRadius: 14,
            background: "rgba(255, 248, 230, 0.65)",
            border: "1px solid rgba(183, 142, 75, 0.35)",
          }}
        >
          <p className="m-desc" style={{ margin: 0, fontSize: 12, lineHeight: 1.55 }}>
            E-postanız henüz doğrulanmadı. Gelen kutunuzdaki bağlantıya tıklayın veya yeni doğrulama e-postası isteyin.
          </p>
          {verifyErr ? (
            <p className="m-desc" style={{ margin: "8px 0 0 0", color: "#b44", fontSize: 12 }}>
              {verifyErr}
            </p>
          ) : null}
          {verifyMsg ? (
            <p className="m-desc" style={{ margin: "8px 0 0 0", color: "rgba(46,125,50,0.95)", fontSize: 12 }}>
              {verifyMsg}
            </p>
          ) : null}
          <button
            type="button"
            className="mini"
            disabled={verifyLoading}
            style={{ marginTop: 10, border: "none", cursor: "pointer", fontWeight: 600 }}
            onClick={() => void sendVerification()}
          >
            {verifyLoading ? "Gönderiliyor…" : "Doğrulama e-postası gönder"}
          </button>
        </div>
      )}
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ad Soyad"
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
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Telefon"
        autoComplete="tel"
        style={{
          border: "1px solid rgba(196,124,124,.22)",
          background: "rgba(255,250,250,.9)",
          borderRadius: 14,
          padding: 14,
          outline: "none",
        }}
      />
      <div style={{ borderTop: "1px solid rgba(245,224,224,0.9)", paddingTop: 14 }}>
        <p className="m-desc" style={{ margin: "0 0 10px 0", fontSize: 13 }}>
          {hasPassword ? "Şifrenizi değiştirmek için doldurun." : "İlk şifrenizi belirleyin (Google ile kayıtlıysanız)."}
        </p>
        {hasPassword ? (
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Mevcut şifre"
            autoComplete="current-password"
            style={{
              border: "1px solid rgba(196,124,124,.22)",
              background: "rgba(255,250,250,.9)",
              borderRadius: 14,
              padding: 14,
              outline: "none",
              marginBottom: 10,
            }}
          />
        ) : null}
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Yeni şifre (en az 6 karakter)"
          autoComplete="new-password"
          style={{
            border: "1px solid rgba(196,124,124,.22)",
            background: "rgba(255,250,250,.9)",
            borderRadius: 14,
            padding: 14,
            outline: "none",
          }}
        />
      </div>
      {err ? (
        <p className="m-desc" style={{ margin: 0, color: "#b44", fontSize: 13 }}>
          {err}
        </p>
      ) : null}
      {msg ? (
        <p className="m-desc" style={{ margin: 0, color: "rgba(46,125,50,0.95)", fontSize: 13 }}>
          {msg}
        </p>
      ) : null}
      <button type="submit" className="m-add" disabled={saving} style={{ border: "none", cursor: "pointer", maxWidth: 200 }}>
        {saving ? "Kaydediliyor…" : "Kaydet"}
      </button>
    </form>
  );
}
