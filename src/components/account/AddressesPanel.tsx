"use client";

import { useCallback, useEffect, useState } from "react";

type AddressRow = {
  id: string;
  title: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  district: string;
  city: string;
  postalCode: string | null;
  isDefault: boolean;
};

const emptyForm = {
  title: "",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  district: "",
  city: "",
  postalCode: "",
  isDefault: false,
};

export function AddressesPanel() {
  const [list, setList] = useState<AddressRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    const r = await fetch("/api/account/addresses", { credentials: "include", cache: "no-store" });
    const j = (await r.json()) as { addresses?: AddressRow[]; error?: string };
    if (!r.ok) {
      setErr(j.error ?? "Adresler alınamadı");
      return;
    }
    setList(j.addresses ?? []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await load();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  function startEdit(a: AddressRow) {
    setEditingId(a.id);
    setForm({
      title: a.title,
      fullName: a.fullName,
      phone: a.phone,
      line1: a.line1,
      line2: a.line2 ?? "",
      district: a.district,
      city: a.city,
      postalCode: a.postalCode ?? "",
      isDefault: a.isDefault,
    });
  }

  async function submitAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      const r = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: form.title.trim(),
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          line1: form.line1.trim(),
          line2: form.line2.trim() || null,
          district: form.district.trim(),
          city: form.city.trim(),
          postalCode: form.postalCode.trim() || null,
          isDefault: form.isDefault,
        }),
      });
      const j = (await r.json()) as { error?: string };
      if (!r.ok) {
        setErr(j.error ?? "Kaydedilemedi");
        return;
      }
      setForm(emptyForm);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function submitEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    setErr(null);
    try {
      const r = await fetch(`/api/account/addresses/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: form.title.trim(),
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          line1: form.line1.trim(),
          line2: form.line2.trim() || null,
          district: form.district.trim(),
          city: form.city.trim(),
          postalCode: form.postalCode.trim() || null,
          isDefault: form.isDefault,
        }),
      });
      const j = (await r.json()) as { error?: string };
      if (!r.ok) {
        setErr(j.error ?? "Güncellenemedi");
        return;
      }
      setEditingId(null);
      setForm(emptyForm);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function setDefault(id: string) {
    setErr(null);
    const r = await fetch(`/api/account/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ isDefault: true }),
    });
    if (!r.ok) {
      const j = (await r.json()) as { error?: string };
      setErr(j.error ?? "İşlem başarısız");
      return;
    }
    await load();
  }

  async function remove(id: string) {
    if (!window.confirm("Bu adresi silmek istediğinize emin misiniz?")) return;
    setErr(null);
    const r = await fetch(`/api/account/addresses/${id}`, { method: "DELETE", credentials: "include" });
    if (!r.ok) {
      const j = (await r.json()) as { error?: string };
      setErr(j.error ?? "Silinemedi");
      return;
    }
    await load();
  }

  const inputStyle = {
    border: "1px solid rgba(196,124,124,.22)",
    background: "rgba(255,250,250,.9)",
    borderRadius: 14,
    padding: 12,
    outline: "none" as const,
    fontSize: 14,
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {loading ? <p className="m-desc">Yükleniyor…</p> : null}
      {err ? (
        <p className="m-desc" style={{ color: "#b44", margin: 0, fontSize: 13 }}>
          {err}
        </p>
      ) : null}

      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
        {list.map((a) => (
          <li key={a.id} className="panel" style={{ padding: 14, margin: 0 }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, lineHeight: 1.55 }}>
                <strong>{a.title}</strong>
                {a.isDefault ? <span style={{ marginLeft: 8, fontSize: 11, opacity: 0.85 }}>(varsayılan)</span> : null}
                <br />
                {a.fullName} · {a.phone}
                <br />
                {a.line1}
                {a.line2 ? `, ${a.line2}` : ""}
                <br />
                {a.district} / {a.city}
                {a.postalCode ? ` · ${a.postalCode}` : ""}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {!a.isDefault ? (
                  <button type="button" className="mini" onClick={() => void setDefault(a.id)}>
                    Varsayılan yap
                  </button>
                ) : null}
                <button type="button" className="mini" onClick={() => startEdit(a)}>
                  Düzenle
                </button>
                <button type="button" className="mini" onClick={() => void remove(a.id)}>
                  Sil
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="panel" style={{ padding: 16 }}>
        <h4 style={{ margin: "0 0 12px 0", fontSize: 16 }}>
          {editingId ? "Adresi güncelle" : "Yeni adres"}
        </h4>
        <form
          style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}
          onSubmit={(e) => void (editingId ? submitEdit(e) : submitAdd(e))}
        >
          <input style={inputStyle} placeholder="Başlık (örn. Ev)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input style={inputStyle} placeholder="Ad Soyad" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          <input style={inputStyle} placeholder="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          <input style={{ ...inputStyle, gridColumn: "1 / -1" }} placeholder="Adres satırı" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} required />
          <input style={{ ...inputStyle, gridColumn: "1 / -1" }} placeholder="Adres satırı 2 (isteğe bağlı)" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
          <input style={inputStyle} placeholder="İlçe" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} required />
          <input style={inputStyle} placeholder="İl" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
          <input style={inputStyle} placeholder="Posta kodu" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, gridColumn: "1 / -1" }}>
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
            Varsayılan adres olarak kaydet
          </label>
          <div style={{ display: "flex", gap: 10, gridColumn: "1 / -1" }}>
            <button type="submit" className="btn primary" disabled={saving} style={{ border: "none", cursor: "pointer" }}>
              {saving ? "Kaydediliyor…" : editingId ? "Güncelle" : "Adres ekle"}
            </button>
            {editingId ? (
              <button
                type="button"
                className="mini"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                İptal
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
