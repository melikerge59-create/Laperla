"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReturnRequestForm({
  orderId,
  canRequest,
  blockedReason,
}: {
  orderId: string;
  canRequest: boolean;
  blockedReason: string | null;
}) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const inputStyle = {
    border: "1px solid rgba(196,124,124,.22)",
    background: "rgba(255,250,250,.9)",
    borderRadius: 12,
    padding: 12,
    outline: "none" as const,
    width: "100%" as const,
    fontSize: 13,
  };

  if (!canRequest) {
    return blockedReason ? (
      <p className="m-desc" style={{ margin: 0, fontSize: 12, lineHeight: 1.55 }}>
        {blockedReason}
      </p>
    ) : null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setSending(true);
    try {
      const r = await fetch("/api/account/return-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderId, reason: reason.trim(), note: note.trim() || undefined }),
      });
      const j = (await r.json()) as { error?: string };
      if (!r.ok) {
        setErr(j.error ?? "Gönderilemedi");
        return;
      }
      setMsg("Talebiniz alındı. İnceleme sonucu size iletişim bilgilerinizden dönüş yapılacaktır.");
      setReason("");
      setNote("");
      router.refresh();
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={(e) => void submit(e)} style={{ display: "grid", gap: 10 }}>
      <label style={{ fontSize: 13 }}>
        İade / değişim gerekçesi (en az 8 karakter)
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          minLength={8}
          rows={4}
          placeholder="Örn. Beden değişimi, ürün hatası…"
          style={{ ...inputStyle, marginTop: 6, minHeight: 88, resize: "vertical" as const }}
        />
      </label>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Ek not (isteğe bağlı)"
        style={inputStyle}
      />
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
      <button type="submit" className="btn primary" disabled={sending} style={{ border: "none", cursor: "pointer", maxWidth: 220 }}>
        {sending ? "Gönderiliyor…" : "Talebi gönder"}
      </button>
    </form>
  );
}
