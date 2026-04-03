"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatTryFromKurus } from "@/lib/money";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  active: boolean;
  category: { name: string } | null;
  variants: Array<{ priceCents: number; stock: number }>;
  images: Array<{ url: string }>;
};

function normalizeSearch(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function AdminProductsClient() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    const r = await fetch("/api/admin/products", { credentials: "include", cache: "no-store" });
    const j = (await r.json()) as { products?: ProductRow[]; error?: string };
    if (!r.ok) {
      setErr(j.error ?? "Liste alınamadı");
      return;
    }
    setProducts(j.products ?? []);
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

  async function remove(id: string, name: string) {
    if (!window.confirm(`“${name}” silinsin mi?`)) return;
    setErr(null);
    const r = await fetch(`/api/admin/products/${id}`, { method: "DELETE", credentials: "include" });
    if (!r.ok) {
      const j = (await r.json()) as { error?: string };
      setErr(j.error ?? "Silinemedi");
      return;
    }
    await load();
  }

  const filtered = useMemo(() => {
    const q = normalizeSearch(query);
    if (!q) return products;
    return products.filter((p) => {
      const hay = `${p.name} ${p.slug} ${p.category?.name ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [products, query]);

  if (loading) return <p className="m-desc">Yükleniyor…</p>;

  return (
    <div>
      {err ? (
        <p className="m-desc" style={{ color: "#b44", marginBottom: 12 }}>
          {err}
        </p>
      ) : null}
      <label style={{ display: "block", marginBottom: 14, fontSize: 13 }}>
        <span className="m-desc" style={{ display: "block", marginBottom: 6 }}>
          Ara (ad, slug, kategori)
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="örn. ipek, çanta…"
          autoComplete="off"
          style={{
            width: "100%",
            maxWidth: 400,
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(196,124,124,.25)",
            fontSize: 14,
          }}
        />
      </label>
      {query.trim() && filtered.length === 0 ? (
        <p className="m-desc" style={{ marginBottom: 12 }}>
          Eşleşen ürün yok.
        </p>
      ) : null}
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
        {filtered.map((p) => {
          const minPrice = Math.min(...p.variants.map((v) => v.priceCents));
          const stock = p.variants.reduce((a, v) => a + v.stock, 0);
          return (
            <li key={p.id} className="panel" style={{ padding: 14, margin: 0, display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <div>
                <Link href={`/admin/urunler/${p.id}`} style={{ fontWeight: 600, color: "rgba(122, 58, 58, 0.95)", textDecoration: "none" }}>
                  {p.name}
                </Link>
                <div className="m-desc" style={{ fontSize: 12, marginTop: 4 }}>
                  /{p.slug} · {p.category?.name ?? "Kategori yok"} · {p.active ? "Aktif" : "Pasif"} · {formatTryFromKurus(minPrice)} · stok {stock}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Link href={`/urunler/${p.slug}`} className="mini" target="_blank" rel="noreferrer">
                  Vitrin
                </Link>
                <button type="button" className="mini" onClick={() => void remove(p.id, p.name)}>
                  Sil
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {!query.trim() && products.length === 0 ? <p className="m-desc">Ürün yok.</p> : null}
    </div>
  );
}
