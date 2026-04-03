"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatClientApiError } from "@/lib/client-api-error";
import { useState } from "react";
import { formatTryFromKurus } from "@/lib/money";
import { isProductPlaceholderImageUrl } from "@/lib/product-image-url";

type Variant = { id: string; name: string; sku: string | null; priceCents: number; stock: number };
type ProductImageRow = { id: string; url: string; sortOrder: number; variantId: string | null };
type ProductEdit = {
  id: string;
  slug: string;
  name: string;
  description: string;
  active: boolean;
  categoryId: string | null;
  variants: Variant[];
  images: ProductImageRow[];
};
type Cat = { id: string; name: string };

export function AdminProductEditClient({
  product: initial,
  categories,
}: {
  product: ProductEdit;
  categories: Cat[];
}) {
  const router = useRouter();
  const [slug, setSlug] = useState(initial.slug);
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [active, setActive] = useState(initial.active);
  const [categoryId, setCategoryId] = useState(initial.categoryId ?? "");
  const [variants, setVariants] = useState<Variant[]>(initial.variants);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [savingVariantId, setSavingVariantId] = useState<string | null>(null);
  const [imageBusy, setImageBusy] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [imageVariantId, setImageVariantId] = useState<string>("");

  const inputStyle = {
    border: "1px solid rgba(196,124,124,.22)",
    background: "rgba(255,250,250,.9)",
    borderRadius: 12,
    padding: 10,
    outline: "none" as const,
    fontSize: 13,
  };

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setSavingProduct(true);
    try {
      const r = await fetch(`/api/admin/products/${initial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
          name: name.trim(),
          description: description.trim(),
          active,
          categoryId: categoryId || null,
        }),
      });
      const j = (await r.json()) as { error?: string };
      if (!r.ok) {
        setErr(j.error ?? "Kaydedilemedi");
        return;
      }
      setMsg("Ürün bilgileri güncellendi.");
      router.refresh();
    } finally {
      setSavingProduct(false);
    }
  }

  async function saveVariant(v: Variant) {
    setErr(null);
    setSavingVariantId(v.id);
    try {
      const vname =
        document.querySelector<HTMLInputElement>(`input[data-vname="${v.id}"]`)?.value?.trim() ?? v.name;
      const vsku =
        document.querySelector<HTMLInputElement>(`input[data-vsku="${v.id}"]`)?.value?.trim() ?? "";
      const priceRaw = document.querySelector<HTMLInputElement>(`input[data-vprice="${v.id}"]`)?.value ?? "0";
      const stockRaw = document.querySelector<HTMLInputElement>(`input[data-vstock="${v.id}"]`)?.value ?? "0";
      const priceTry = parseFloat(priceRaw.replace(",", "."));
      const priceCents = Math.max(0, Math.round((Number.isFinite(priceTry) ? priceTry : 0) * 100));
      const stock = Math.max(0, parseInt(stockRaw, 10) || 0);

      const r = await fetch(`/api/admin/variants/${v.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: vname || v.name,
          sku: vsku || null,
          priceCents,
          stock,
        }),
      });
      const j = (await r.json()) as { error?: string; variant?: Variant };
      if (!r.ok) {
        setErr(j.error ?? "Varyant güncellenemedi");
        return;
      }
      if (j.variant) {
        setVariants((prev) => prev.map((x) => (x.id === v.id ? { ...x, ...j.variant } : x)));
      }
      setMsg("Varyant güncellendi.");
      router.refresh();
    } finally {
      setSavingVariantId(null);
    }
  }

  async function addImageRecord(url: string) {
    const trimmed = url.trim();
    if (!trimmed) return false;
    setErr(null);
    const r = await fetch(`/api/admin/products/${initial.id}/images`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        url: trimmed,
        variantId: imageVariantId || null,
      }),
    });
    const j = (await r.json()) as { error?: string };
    if (!r.ok) {
      setErr(j.error ?? "Görsel eklenemedi");
      return false;
    }
    setNewImageUrl("");
    setMsg("Görsel eklendi.");
    router.refresh();
    return true;
  }

  async function registerImageUrl(url: string) {
    setImageBusy(true);
    try {
      await addImageRecord(url);
    } finally {
      setImageBusy(false);
    }
  }

  async function onPickImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setErr(null);
    setImageBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const up = await fetch("/api/admin/uploads/product-image", { method: "POST", body: fd, credentials: "include" });
      const uj = (await up.json()) as { url?: string; error?: string; retryAfterSec?: number };
      if (!up.ok) {
        setErr(formatClientApiError(up.status, uj, "Yükleme başarısız"));
        return;
      }
      if (uj.url) await addImageRecord(uj.url);
    } finally {
      setImageBusy(false);
    }
  }

  async function removeImage(imageId: string) {
    setErr(null);
    setImageBusy(true);
    try {
      const r = await fetch(`/api/admin/product-images/${imageId}`, { method: "DELETE", credentials: "include" });
      const j = (await r.json()) as { error?: string };
      if (!r.ok) {
        setErr(j.error ?? "Silinemedi");
        return;
      }
      setMsg("Görsel kaldırıldı.");
      router.refresh();
    } finally {
      setImageBusy(false);
    }
  }

  const images = initial.images ?? [];

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <p style={{ margin: 0 }}>
        <Link href="/admin/urunler" className="m-desc" style={{ color: "var(--gold)", fontWeight: 600 }}>
          ← Ürün listesi
        </Link>
      </p>
      <form className="panel" style={{ padding: 20, display: "grid", gap: 12 }} onSubmit={(e) => void saveProduct(e)}>
        <h2 style={{ margin: 0, fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 26 }}>Ürün düzenle</h2>
        {err ? <p className="m-desc" style={{ color: "#b44", margin: 0 }}>{err}</p> : null}
        {msg ? <p className="m-desc" style={{ margin: 0, color: "rgba(46,125,50,0.95)" }}>{msg}</p> : null}
        <input style={{ ...inputStyle, width: "100%" }} value={slug} onChange={(e) => setSlug(e.target.value)} />
        <input style={{ ...inputStyle, width: "100%" }} value={name} onChange={(e) => setName(e.target.value)} />
        <textarea style={{ ...inputStyle, width: "100%", minHeight: 100 }} value={description} onChange={(e) => setDescription(e.target.value)} />
        <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Aktif (vitrinde)
        </label>
        <label style={{ fontSize: 13 }}>
          Kategori
          <select style={{ ...inputStyle, width: "100%", marginTop: 6 }} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn primary" disabled={savingProduct} style={{ border: "none", cursor: "pointer", maxWidth: 200 }}>
          {savingProduct ? "Kaydediliyor…" : "Ürünü kaydet"}
        </button>
      </form>

      <div className="panel" style={{ padding: 20 }}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: 18 }}>Görseller</h3>
        <p className="m-desc" style={{ margin: "0 0 12px 0", fontSize: 12 }}>
          JPEG, PNG, WebP veya GIF; en fazla 5 MB. Yerel dosya yükleyebilir veya doğrudan URL ekleyebilirsiniz.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          {images.map((im) => (
            <div
              key={im.id}
              style={{
                position: "relative",
                width: 96,
                height: 120,
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid rgba(196,124,124,.22)",
                background: "rgba(245,224,224,0.35)",
              }}
            >
              <Image src={im.url} alt="" fill className="object-cover" sizes="96px" unoptimized={isProductPlaceholderImageUrl(im.url)} />
              <button
                type="button"
                className="mini"
                disabled={imageBusy}
                onClick={() => void removeImage(im.id)}
                style={{
                  position: "absolute",
                  bottom: 4,
                  right: 4,
                  background: "rgba(122,58,58,0.92)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "4px 8px",
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                Sil
              </button>
            </div>
          ))}
        </div>
        <label style={{ fontSize: 13, display: "block", marginBottom: 10 }}>
          Dosya yükle
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={imageBusy} onChange={(e) => void onPickImageFile(e)} style={{ display: "block", marginTop: 6 }} />
        </label>
        <label style={{ fontSize: 13 }}>
          Varyanta bağla (isteğe bağlı)
          <select
            style={{ ...inputStyle, width: "100%", marginTop: 6 }}
            value={imageVariantId}
            onChange={(e) => setImageVariantId(e.target.value)}
          >
            <option value="">Tüm ürün (galeri)</option>
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </label>
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input
            style={{ ...inputStyle, flex: "1 1 220px" }}
            placeholder="Görsel URL"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            disabled={imageBusy}
          />
          <button
            type="button"
            className="btn primary"
            disabled={imageBusy || !newImageUrl.trim()}
            style={{ border: "none", cursor: "pointer" }}
            onClick={() => void registerImageUrl(newImageUrl)}
          >
            URL ekle
          </button>
        </div>
      </div>

      <div className="panel" style={{ padding: 20 }}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: 18 }}>Varyantlar</h3>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 14 }}>
          {variants.map((v, idx) => (
            <li key={v.id} style={{ borderTop: idx ? "1px solid rgba(245,224,224,0.9)" : undefined, paddingTop: idx ? 14 : 0 }}>
              <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))" }}>
                <input data-vname={v.id} style={inputStyle} defaultValue={v.name} placeholder="Ad" />
                <input data-vsku={v.id} style={inputStyle} defaultValue={v.sku ?? ""} placeholder="SKU" />
                <input data-vprice={v.id} style={inputStyle} defaultValue={(v.priceCents / 100).toFixed(2)} placeholder="TL" inputMode="decimal" />
                <input data-vstock={v.id} style={inputStyle} defaultValue={v.stock} placeholder="Stok" inputMode="numeric" />
              </div>
              <p className="m-desc" style={{ margin: "6px 0 0 0", fontSize: 12 }}>
                Mevcut: {formatTryFromKurus(v.priceCents)} · stok {v.stock}
              </p>
              <button
                type="button"
                className="mini"
                style={{ marginTop: 8 }}
                disabled={savingVariantId === v.id}
                onClick={() => void saveVariant(v)}
              >
                {savingVariantId === v.id ? "Kaydediliyor…" : "Varyantı kaydet"}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
