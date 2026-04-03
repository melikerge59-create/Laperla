"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  cartTotalCents,
  clearCart,
  getCart,
  reconcileCartStocksFromServer,
  type CartLine,
} from "@/lib/client-cart";
import { formatClientApiError } from "@/lib/client-api-error";
import { formatTryFromKurus } from "@/lib/money";

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

export function OdemeClient({
  flatShippingCents,
  freeShippingThresholdCents,
}: {
  flatShippingCents: number;
  freeShippingThresholdCents: number | null;
}) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [addresses, setAddresses] = useState<AddressRow[]>([]);
  const [addressId, setAddressId] = useState("");
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const refreshLines = useCallback(() => setLines(getCart()), []);

  useEffect(() => {
    refreshLines();
    window.addEventListener("lp-cart-changed", refreshLines);
    return () => window.removeEventListener("lp-cart-changed", refreshLines);
  }, [refreshLines]);

  useEffect(() => {
    void reconcileCartStocksFromServer().then(() => refreshLines());
  }, [refreshLines]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const r = await fetch("/api/account/addresses", { credentials: "include", cache: "no-store" });
        const j = (await r.json()) as { addresses?: AddressRow[] };
        if (!r.ok) throw new Error("Adresler yüklenemedi");
        const list = j.addresses ?? [];
        if (!cancelled) {
          setAddresses(list);
          const def = list.find((a) => a.isDefault);
          setAddressId(def?.id ?? list[0]?.id ?? "");
        }
      } catch {
        if (!cancelled) setErr("Adresler yüklenemedi. Oturumunuzu kontrol edin.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const subtotal = cartTotalCents(lines);
  const shippingCents = useMemo(() => {
    if (freeShippingThresholdCents != null && subtotal >= freeShippingThresholdCents) return 0;
    return flatShippingCents;
  }, [subtotal, flatShippingCents, freeShippingThresholdCents]);
  const total = subtotal + shippingCents;

  const canSubmit = useMemo(
    () =>
      lines.length > 0 &&
      !!addressId &&
      terms &&
      !submitting &&
      !loading,
    [lines.length, addressId, terms, submitting, loading],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          addressId,
          lines: lines.map((l) => ({ variantId: l.variantId, quantity: l.qty })),
        }),
      });
      const j = (await r.json().catch(() => ({}))) as { error?: string; orderId?: string; retryAfterSec?: number };
      if (!r.ok) {
        setErr(formatClientApiError(r.status, j, "Sipariş oluşturulamadı"));
        return;
      }
      clearCart();
      if (j.orderId) {
        window.location.assign(`/hesabim/siparisler/${j.orderId}?tesekkur=1`);
      } else {
        window.location.assign("/hesabim/siparisler");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="panel" style={{ textAlign: "center", padding: "40px 24px" }}>
        <p className="m-desc" style={{ margin: 0 }}>
          Sepetiniz boş.{" "}
          <Link href="/urunler" style={{ color: "var(--gold)", fontWeight: 600 }}>
            Ürünlere göz atın
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form className="panel" onSubmit={(e) => void onSubmit(e)}>
      <h3 style={{ margin: 0, fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 34 }}>Ödeme</h3>
      <p className="m-desc" style={{ margin: "10px 0 0 0" }}>
        Siparişiniz oluşturulur; ödeme şu an <strong>manuel / havale</strong> akışındadır. Onay sonrası sipariş detayınızda durumu
        görebilirsiniz.
      </p>

      {err ? (
        <p className="m-desc" style={{ margin: "14px 0 0 0", color: "#b44", fontSize: 13 }}>
          {err}
        </p>
      ) : null}

      <div style={{ marginTop: 24 }}>
        <h4 style={{ margin: "0 0 12px 0", fontSize: 16, fontWeight: 600 }}>Teslimat adresi</h4>
        {loading ? (
          <p className="m-desc" style={{ margin: 0 }}>Adresler yükleniyor…</p>
        ) : addresses.length === 0 ? (
          <p className="m-desc" style={{ margin: 0 }}>
            Kayıtlı adres yok.{" "}
            <Link href="/hesabim/adresler" style={{ color: "var(--gold)", fontWeight: 600 }}>
              Adres ekleyin
            </Link>
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
            {addresses.map((a) => (
              <li key={a.id}>
                <label
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    padding: 12,
                    borderRadius: 14,
                    border: addressId === a.id ? "2px solid rgba(196, 124, 124, 0.55)" : "1px solid rgba(245, 224, 224, 0.95)",
                    cursor: "pointer",
                  }}
                >
                  <input type="radio" name="addr" checked={addressId === a.id} onChange={() => setAddressId(a.id)} />
                  <span style={{ fontSize: 13, lineHeight: 1.55 }}>
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
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        <h4 style={{ margin: "0 0 12px 0", fontSize: 16, fontWeight: 600 }}>Sepet özeti</h4>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 13 }}>
          {lines.map((l) => (
            <li key={l.variantId} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", borderBottom: "1px solid rgba(245,224,224,0.8)" }}>
              <span>
                {l.productName} — {l.variantName} × {l.qty}
              </span>
              <span>{formatTryFromKurus(l.priceCents * l.qty)}</span>
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", fontSize: 14 }}>
          <span>Ara toplam</span>
          <span>{formatTryFromKurus(subtotal)}</span>
        </div>
        <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", fontSize: 14 }}>
          <span>Kargo</span>
          <span>{shippingCents === 0 ? "Ücretsiz" : formatTryFromKurus(shippingCents)}</span>
        </div>
        {freeShippingThresholdCents != null && subtotal < freeShippingThresholdCents && flatShippingCents > 0 ? (
          <p className="m-desc" style={{ margin: "10px 0 0 0", fontSize: 12, lineHeight: 1.5 }}>
            {formatTryFromKurus(freeShippingThresholdCents)} ve üzeri siparişlerde kargo ücretsiz.
          </p>
        ) : null}
        {freeShippingThresholdCents != null && subtotal >= freeShippingThresholdCents ? (
          <p className="m-desc" style={{ margin: "10px 0 0 0", fontSize: 12, color: "rgba(46, 100, 50, 0.9)" }}>
            Ücretsiz kargo eşiğini aştınız.
          </p>
        ) : null}
        <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", fontFamily: "var(--font-display),serif", fontSize: 22 }}>
          <span>Genel toplam</span>
          <span>{formatTryFromKurus(total)}</span>
        </div>
      </div>

      <label style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 24, fontSize: 13, lineHeight: 1.55, cursor: "pointer" }}>
        <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} style={{ marginTop: 3 }} />
        <span>
          <Link href="/mesafeli-satis" target="_blank" style={{ color: "var(--gold)", fontWeight: 600 }}>
            Mesafeli satış sözleşmesi
          </Link>
          ’ni okudum ve kabul ediyorum.{" "}
          <Link href="/iade-ve-degisim" target="_blank" className="m-desc" style={{ color: "var(--gold)", fontWeight: 500 }}>
            İade bilgisi
          </Link>
        </span>
      </label>

      <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 10 }}>
        <button type="submit" className="btn primary" disabled={!canSubmit} style={{ border: "none", cursor: canSubmit ? "pointer" : "not-allowed", opacity: canSubmit ? 1 : 0.55 }}>
          {submitting ? "İşleniyor…" : "Siparişi oluştur"}
        </button>
        <Link href="/sepet" className="mini">
          Sepete dön
        </Link>
      </div>
    </form>
  );
}
