"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Cat = { id: string; name: string; slug: string };

export function AdminCategoriesClient() {
  const [list, setList] = useState<Cat[]>([]);
  const [query, setQuery] = useState("");
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setErr(null);
    const r = await fetch("/api/admin/categories", { credentials: "include", cache: "no-store" });
    const j = (await r.json()) as { categories?: Cat[]; error?: string };
    if (!r.ok) {
      setErr(j.error ?? "Liste alınamadı");
      return;
    }
    setList(j.categories ?? []);
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

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      const s = slug.trim().toLowerCase().replace(/\s+/g, "-");
      const n = name.trim();
      const r = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ slug: s, name: n }),
      });
      const j = (await r.json()) as { error?: string };
      if (!r.ok) {
        setErr(j.error ?? "Eklenemedi");
        return;
      }
      setSlug("");
      setName("");
      await load();
    } finally {
      setSaving(false);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
  }, [list, query]);

  const inputStyle = {
    border: "1px solid rgba(196,124,124,.22)",
    background: "rgba(255,250,250,.9)",
    borderRadius: 12,
    padding: 12,
    outline: "none" as const,
    fontSize: 14,
  };

  if (loading) return <p className="m-desc">Yükleniyor…</p>;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {err ? <p className="m-desc" style={{ color: "#b44" }}>{err}</p> : null}
      <form className="panel" style={{ padding: 16, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end" }} onSubmit={(e) => void add(e)}>
        <input style={{ ...inputStyle, minWidth: 140 }} placeholder="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        <input style={{ ...inputStyle, minWidth: 180 }} placeholder="Ad" value={name} onChange={(e) => setName(e.target.value)} required />
        <button type="submit" className="btn primary" disabled={saving} style={{ border: "none", cursor: "pointer" }}>
          {saving ? "Ekleniyor…" : "Ekle"}
        </button>
      </form>
      <label style={{ display: "block", fontSize: 13 }}>
        <span className="m-desc" style={{ display: "block", marginBottom: 6 }}>Ara (ad veya slug)</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Kategori filtrele…"
          autoComplete="off"
          style={{ ...inputStyle, width: "100%", maxWidth: 360 }}
        />
      </label>
      {query.trim() && filtered.length === 0 ? <p className="m-desc">Eşleşen kategori yok.</p> : null}
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
        {filtered.map((c) => (
          <li key={c.id} className="panel" style={{ padding: 12, margin: 0, fontSize: 14 }}>
            <strong>{c.name}</strong>
            <span className="m-desc" style={{ marginLeft: 10, fontSize: 12 }}>
              /{c.slug}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
