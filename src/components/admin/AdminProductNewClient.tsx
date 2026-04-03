"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { formatClientApiError } from "@/lib/client-api-error";

type Cat = { id: string; name: string; slug: string };

export function AdminProductNewClient() {
  const router = useRouter();
  const [categories, setCategories] = useState<Cat[]>([]);
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [priceTry, setPriceTry] = useState("0");
  const [stock, setStock] = useState("0");
  const [variantName, setVariantName] = useState("Standart");
  const [sku, setSku] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadCats = useCallback(async () => {
    const r = await fetch("/api/admin/categories", { credentials: "include", cache: "no-store" });
    const j = (await r.json()) as { categories?: Cat[] };
    setCategories(j.categories ?? []);
  }, []);

  useEffect(() => {
    void loadCats();
  }, [loadCats]);

  async function onPickImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setErr(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const up = await fetch("/api/admin/uploads/product-image", { method: "POST", body: fd, credentials: "include" });
      const uj = (await up.json()) as { url?: string; error?: string; retryAfterSec?: number };
      if (!up.ok) {
        setErr(formatClientApiError(up.status, uj, "Yükleme başarısız"));
        return;
      }
      if (uj.url) setImageUrl(uj.url);
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    try {
      const price = Math.max(0, Math.round(parseFloat(priceTry.replace(",", ".")) * 100) || 0);
      const st = Math.max(0, parseInt(stock, 10) || 0);
      const r = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
          name: name.trim(),
          description: description.trim() || name.trim(),
          categoryId: categoryId || null,
          active: true,
          variant: {
            name: variantName.trim() || "Standart",
            priceCents: price,
            stock: st,
            sku: sku.trim() || null,
          },
          imageUrl: imageUrl.trim() || undefined,
        }),
      });
      const j = (await r.json()) as { error?: string; product?: { id: string } };
      if (!r.ok) {
        setErr(j.error ?? "Oluşturulamadı");
        return;
      }
      if (j.product?.id) {
        router.push(`/admin/urunler/${j.product.id}`);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = {
    border: "1px solid rgba(196,124,124,.22)",
    background: "rgba(255,250,250,.9)",
    borderRadius: 12,
    padding: 12,
    outline: "none" as const,
    fontSize: 14,
    width: "100%" as const,
  };

  return (
    <form className="panel" style={{ padding: 20, display: "grid", gap: 12, maxWidth: 520 }} onSubmit={(e) => void submit(e)}>
      <h2 style={{ margin: 0, fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 26 }}>Yeni ürün</h2>
      {err ? <p className="m-desc" style={{ color: "#b44", margin: 0 }}>{err}</p> : null}
      <input style={inputStyle} placeholder="Slug (url)" value={slug} onChange={(e) => setSlug(e.target.value)} required />
      <input style={inputStyle} placeholder="Ürün adı" value={name} onChange={(e) => setName(e.target.value)} required />
      <textarea style={{ ...inputStyle, minHeight: 88 }} placeholder="Açıklama" value={description} onChange={(e) => setDescription(e.target.value)} />
      <label style={{ fontSize: 13 }}>
        Kategori
        <select style={{ ...inputStyle, marginTop: 6 }} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">—</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <input style={inputStyle} placeholder="Varyant adı (örn. Standart)" value={variantName} onChange={(e) => setVariantName(e.target.value)} />
      <input style={inputStyle} placeholder="SKU (isteğe bağlı)" value={sku} onChange={(e) => setSku(e.target.value)} />
      <input style={inputStyle} placeholder="Fiyat (TL)" value={priceTry} onChange={(e) => setPriceTry(e.target.value)} inputMode="decimal" />
      <input style={inputStyle} placeholder="Stok" value={stock} onChange={(e) => setStock(e.target.value)} inputMode="numeric" />
      <label style={{ fontSize: 13 }}>
        Görsel dosyası (JPEG / PNG / WebP / GIF, en fazla 5 MB)
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          disabled={uploading || saving}
          onChange={(e) => void onPickImageFile(e)}
          style={{ display: "block", marginTop: 6 }}
        />
      </label>
      <input
        style={inputStyle}
        placeholder="Görsel URL (yükleme sonrası dolar veya elle yapıştırın; boşsa placeholder)"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />
      <div style={{ display: "flex", gap: 10 }}>
        <button type="submit" className="btn primary" disabled={saving} style={{ border: "none", cursor: "pointer" }}>
          {saving ? "Kaydediliyor…" : "Oluştur"}
        </button>
        <Link href="/admin/urunler" className="mini">
          İptal
        </Link>
      </div>
    </form>
  );
}
