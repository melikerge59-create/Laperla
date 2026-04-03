"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  cartLineItemCount,
  cartSummaryPlainText,
  cartTotalCents,
  clearCart,
  getCart,
  reconcileCartStocksFromServer,
  removeLine,
  setLineQty,
  type CartLine,
} from "@/lib/client-cart";
import { formatTryFromKurus } from "@/lib/money";
import { brand, brandWhatsAppDigits, isBrandWhatsAppConfigured } from "@/lib/brand";
import { isProductPlaceholderImageUrl } from "@/lib/product-image-url";

export function SepetClient() {
  const [lines, setLines] = useState<CartLine[]>(() => getCart());
  const [copied, setCopied] = useState(false);

  const refresh = useCallback(() => setLines(getCart()), []);

  useEffect(() => {
    window.addEventListener("lp-cart-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("lp-cart-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  useEffect(() => {
    void reconcileCartStocksFromServer();
  }, []);

  const total = cartTotalCents(lines);
  const count = cartLineItemCount(lines);
  const waConfigured = isBrandWhatsAppConfigured();
  const orderText = cartSummaryPlainText(lines, brand.name);
  const waOrderHref = waConfigured
    ? `https://wa.me/${brandWhatsAppDigits()}?text=${encodeURIComponent(orderText)}`
    : null;

  const copyOrderText = useCallback(() => {
    void navigator.clipboard.writeText(orderText).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    });
  }, [orderText]);

  if (lines.length === 0) {
    return (
      <div className="panel" style={{ textAlign: "center", padding: "40px 24px" }}>
        <div style={{ fontSize: 46 }}>🛍️</div>
        <p className="m-desc" style={{ marginTop: 12 }}>
          Sepetiniz boş.{" "}
          <Link href="/urunler" style={{ color: "var(--gold)", fontWeight: 600 }}>
            Ürünlere göz atın
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12 }}>
        <h3 style={{ margin: 0, fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 34 }}>Sepetim</h3>
        <span className="m-desc" style={{ margin: 0 }}>
          {count} ürün
        </span>
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: "20px 0 0 0" }}>
        {lines.map((line) => {
          const max = line.maxStock;
          const hasCap = typeof max === "number" && max > 0;
          const atMax = hasCap && line.qty >= max;
          const lineImg = line.imageUrl ?? "/logo.png";
          return (
          <li
            key={line.variantId}
            style={{
              display: "grid",
              gridTemplateColumns: "72px 1fr auto",
              gap: 14,
              alignItems: "center",
              padding: "14px 0",
              borderBottom: "1px solid rgba(245, 224, 224, 0.95)",
            }}
          >
            <div style={{ position: "relative", width: 72, height: 72, borderRadius: 14, overflow: "hidden", background: "rgba(245,224,224,0.5)" }}>
              <Image
                src={lineImg}
                alt={`${line.productName} görseli`}
                fill
                className="object-cover"
                sizes="72px"
                unoptimized={isProductPlaceholderImageUrl(lineImg)}
              />
            </div>
            <div style={{ minWidth: 0 }}>
              <Link href={`/urunler/${line.productSlug}`} style={{ fontWeight: 600, color: "rgba(122, 58, 58, 0.95)", textDecoration: "none" }}>
                {line.productName}
              </Link>
              <p className="m-desc" style={{ margin: "4px 0 0 0", fontSize: 12 }}>
                {line.variantName}
                {hasCap ? (
                  <span style={{ display: "block", marginTop: 2, opacity: 0.9 }}>
                    Stok üst sınırı: {max} ad.
                  </span>
                ) : null}
              </p>
              <p style={{ margin: "6px 0 0 0", fontFamily: "var(--font-display),serif", fontSize: 18, color: "var(--gold)" }}>
                {line.qty > 1 ? (
                  <>
                    {formatTryFromKurus(line.priceCents)} × {line.qty} = {formatTryFromKurus(line.priceCents * line.qty)}
                  </>
                ) : (
                  formatTryFromKurus(line.priceCents)
                )}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  type="button"
                  className="mini"
                  style={{ padding: "8px 12px", minWidth: 36 }}
                  onClick={() => setLineQty(line.variantId, line.qty - 1)}
                  aria-label="Azalt"
                >
                  −
                </button>
                <span style={{ minWidth: 28, textAlign: "center", fontSize: 14 }}>{line.qty}</span>
                <button
                  type="button"
                  className="mini"
                  style={{ padding: "8px 12px", minWidth: 36, opacity: atMax ? 0.45 : 1 }}
                  disabled={atMax}
                  title={atMax ? "Stok miktarını aşamazsınız" : undefined}
                  onClick={() => setLineQty(line.variantId, line.qty + 1)}
                  aria-label="Arttır"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                className="mini"
                style={{ border: "none", background: "transparent", color: "rgba(196, 124, 124, 0.95)", fontSize: 12 }}
                onClick={() => removeLine(line.variantId)}
              >
                Kaldır
              </button>
            </div>
          </li>
          );
        })}
      </ul>

      <div
        style={{
          marginTop: 20,
          paddingTop: 16,
          borderTop: "1px solid rgba(245, 224, 224, 0.95)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <span style={{ fontFamily: "var(--font-display),serif", fontSize: 22 }}>Toplam</span>
        <span style={{ fontFamily: "var(--font-display),serif", fontSize: 26, fontWeight: 600 }}>{formatTryFromKurus(total)}</span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16, alignItems: "center" }}>
        <Link href="/odeme" className="btn primary" style={{ display: "inline-flex", textDecoration: "none" }}>
          Ödemeye geç
        </Link>
        {waOrderHref ? (
          <a href={waOrderHref} target="_blank" rel="noreferrer" className="mini" style={{ display: "inline-flex", textDecoration: "none" }}>
            WhatsApp ile gönder
          </a>
        ) : (
          <button type="button" className="mini" onClick={() => copyOrderText()}>
            {copied ? "Metin kopyalandı" : "Metni kopyala"}
          </button>
        )}
        <Link href="/urunler" className="mini">
          Alışverişe devam
        </Link>
        <button type="button" className="mini" onClick={() => clearCart()}>
          Sepeti boşalt
        </button>
      </div>

      <p className="m-desc" style={{ marginTop: 16, fontSize: 12 }}>
        <strong>Ödemeye geç</strong> ile sipariş oluşturabilirsiniz (giriş ve teslimat adresi gerekir). Ayrıca özeti kopyalayabilir
        {waConfigured ? " veya WhatsApp ile gönderebilirsiniz." : "."}
      </p>
    </div>
  );
}
