"use client";

import Link from "next/link";
import { useState } from "react";
import { addToCart } from "@/lib/client-cart";
import { useOptionalProductGallery } from "@/components/site/product-gallery-context";
import { formatTryFromKurus } from "@/lib/money";

export type PurchaseVariant = { id: string; name: string; priceCents: number; sku: string | null; stock: number };

export function ProductPurchasePanel({
  slug,
  name,
  imageUrl,
  variants,
}: {
  slug: string;
  name: string;
  imageUrl: string;
  variants: PurchaseVariant[];
}) {
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [flash, setFlash] = useState<string | null>(null);
  const gallery = useOptionalProductGallery();
  const cartImageUrl = gallery?.activeUrl ?? imageUrl;

  const v = variants.find((x) => x.id === variantId) ?? variants[0];
  if (!v) return null;
  const inStock = v.stock > 0;

  return (
    <div style={{ marginTop: 20 }}>
      {variants.length > 1 ? (
        <label style={{ display: "grid", gap: 8 }}>
          <span className="brandline">Varyant seçin</span>
          <select
            value={variantId}
            onChange={(e) => setVariantId(e.target.value)}
            style={{
              border: "1px solid rgba(196,124,124,.22)",
              background: "rgba(255,250,250,.95)",
              borderRadius: 14,
              padding: "12px 14px",
              fontSize: 14,
              color: "rgba(122, 58, 58, 0.95)",
            }}
          >
            {variants.map((vr) => (
              <option key={vr.id} value={vr.id}>
                {vr.name} — {formatTryFromKurus(vr.priceCents)}
                {vr.stock <= 0 ? " (Tükendi)" : ` (${vr.stock} ad.)`}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <p className="m-desc" style={{ marginTop: 12, fontSize: 13 }}>
        {inStock ? <>Stok: <strong>{v.stock}</strong> adet</> : <span style={{ color: "rgba(196, 124, 124, 0.95)" }}>Bu seçenek şu an stokta yok.</span>}
      </p>

      <button
        type="button"
        className="m-add"
        disabled={!inStock}
        style={{
          marginTop: 12,
          width: "100%",
          border: "none",
          cursor: inStock ? "pointer" : "not-allowed",
          opacity: inStock ? 1 : 0.65,
        }}
        onClick={() => {
          if (!inStock) return;
          addToCart({
            variantId: v.id,
            productSlug: slug,
            productName: name,
            variantName: v.name,
            priceCents: v.priceCents,
            imageUrl: cartImageUrl,
            maxStock: v.stock,
          });
          setFlash("Sepete eklendi");
          window.setTimeout(() => setFlash(null), 2000);
        }}
      >
        {inStock ? `Sepete ekle — ${formatTryFromKurus(v.priceCents)}` : "Stokta yok"}
      </button>
      {flash ? (
        <p className="m-desc" style={{ marginTop: 10, color: "var(--gold)", fontWeight: 600 }}>
          {flash} ·{" "}
          <Link href="/sepet" style={{ color: "var(--brown)" }}>
            Sepete git
          </Link>
        </p>
      ) : null}
    </div>
  );
}
