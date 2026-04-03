"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatTryFromKurus } from "@/lib/money";
import { formatOrderAddressSnapshotLines } from "@/lib/order-address-snapshot";
import { orderStatusLabel } from "@/lib/order-status";
import type { OrderStatus } from "@/generated/prisma/client";

const STATUSES: OrderStatus[] = [
  "PENDING_PAYMENT",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

type OrderRow = {
  id: string;
  status: OrderStatus;
  totalCents: number;
  shippingCents: number;
  createdAt: string;
  trackingCode: string | null;
  addressSnapshot: unknown;
  user: { email: string; name: string | null };
  items: Array<{
    id: string;
    quantity: number;
    priceCents: number;
    variant: { name: string; product: { name: string; slug: string } };
  }>;
};

function orderMatchesQuery(o: OrderRow, raw: string): boolean {
  const q = raw.trim().toLowerCase();
  if (!q) return true;
  if (o.id.toLowerCase().includes(q)) return true;
  if (o.user.email.toLowerCase().includes(q)) return true;
  if ((o.user.name ?? "").toLowerCase().includes(q)) return true;
  if ((o.trackingCode ?? "").toLowerCase().includes(q)) return true;
  if (orderStatusLabel(o.status).toLowerCase().includes(q)) return true;
  for (const it of o.items) {
    if (it.variant.product.name.toLowerCase().includes(q)) return true;
    if (it.variant.product.slug.toLowerCase().includes(q)) return true;
    if (it.variant.name.toLowerCase().includes(q)) return true;
  }
  return false;
}

export function AdminOrdersClient() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    const r = await fetch("/api/admin/orders?take=80", { credentials: "include", cache: "no-store" });
    const j = (await r.json()) as { orders?: OrderRow[]; error?: string };
    if (!r.ok) {
      setErr(j.error ?? "Liste alınamadı");
      return;
    }
    setOrders(j.orders ?? []);
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

  async function saveOrder(id: string, status: OrderStatus, trackingCode: string) {
    setSavingId(id);
    setErr(null);
    try {
      const r = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status, trackingCode: trackingCode.trim() || null }),
      });
      const j = (await r.json()) as { error?: string };
      if (!r.ok) {
        setErr(j.error ?? "Kaydedilemedi");
        return;
      }
      await load();
    } finally {
      setSavingId(null);
    }
  }

  const filtered = useMemo(() => orders.filter((o) => orderMatchesQuery(o, query)), [orders, query]);

  if (loading) {
    return <p className="m-desc">Yükleniyor…</p>;
  }

  return (
    <div>
      {err ? (
        <p className="m-desc" style={{ color: "#b44", marginBottom: 12 }}>
          {err}
        </p>
      ) : null}
      <label style={{ display: "block", marginBottom: 14, fontSize: 13 }}>
        <span className="m-desc" style={{ display: "block", marginBottom: 6 }}>
          Ara (sipariş no, e-posta, müşteri, ürün, takip no, durum)
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="örn. cm…, @gmail, kargoda…"
          autoComplete="off"
          style={{
            width: "100%",
            maxWidth: 440,
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(196,124,124,.25)",
            fontSize: 14,
          }}
        />
      </label>
      {query.trim() && filtered.length === 0 ? (
        <p className="m-desc" style={{ marginBottom: 12 }}>
          Eşleşen sipariş yok.
        </p>
      ) : null}
      <div style={{ display: "grid", gap: 16 }}>
        {filtered.map((o) => (
          <OrderRowEditor
            key={`${o.id}-${o.status}-${o.trackingCode ?? ""}`}
            order={o}
            disabled={savingId === o.id}
            onSave={(st, tr) => void saveOrder(o.id, st, tr)}
          />
        ))}
      </div>
      {!query.trim() && orders.length === 0 ? <p className="m-desc">Henüz sipariş yok.</p> : null}
    </div>
  );
}

function OrderRowEditor({
  order,
  disabled,
  onSave,
}: {
  order: OrderRow;
  disabled: boolean;
  onSave: (status: OrderStatus, tracking: string) => void;
}) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [tracking, setTracking] = useState(order.trackingCode ?? "");

  const addrLines = formatOrderAddressSnapshotLines(order.addressSnapshot);

  return (
    <div className="panel" style={{ padding: 16, margin: 0 }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
        <strong style={{ fontSize: 14 }}>#{order.id.slice(0, 8).toUpperCase()}</strong>
        <span className="m-desc" style={{ fontSize: 12 }}>{new Date(order.createdAt).toLocaleString("tr-TR")}</span>
      </div>
      <p className="m-desc" style={{ margin: "6px 0 0 0", fontSize: 13 }}>
        {order.user.name ?? order.user.email} · {order.user.email}
      </p>
      <p style={{ margin: "6px 0 0 0", fontSize: 13 }}>
        <Link href={`/hesabim/siparisler/${order.id}`} style={{ color: "var(--gold)", fontWeight: 600, fontSize: 13 }}>
          Müşteri sipariş detayı →
        </Link>
      </p>
      <p style={{ margin: "6px 0 0 0", fontSize: 13 }}>
        {formatTryFromKurus(order.totalCents)}
        {order.shippingCents > 0 ? ` · kargo ${formatTryFromKurus(order.shippingCents)}` : ""}
      </p>
      <ul className="m-desc" style={{ margin: "8px 0 0 0", paddingLeft: 18, fontSize: 12 }}>
        {order.items.map((it) => (
          <li key={it.id}>
            {it.variant.product.name} — {it.variant.name} × {it.quantity} ({formatTryFromKurus(it.priceCents * it.quantity)})
          </li>
        ))}
      </ul>
      {addrLines.length ? (
        <details style={{ marginTop: 12, fontSize: 12 }}>
          <summary style={{ cursor: "pointer", fontWeight: 600, color: "rgba(122, 58, 58, 0.9)" }}>Teslimat adresi (sipariş anı)</summary>
          <p className="m-desc" style={{ margin: "10px 0 0 0", lineHeight: 1.65, whiteSpace: "pre-line", paddingLeft: 4 }}>
            {addrLines.join("\n")}
          </p>
        </details>
      ) : null}
      <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
          Durum
          <select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)} style={{ padding: 8, borderRadius: 10, border: "1px solid rgba(196,124,124,.25)" }}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {orderStatusLabel(s)}
              </option>
            ))}
          </select>
        </label>
        <input
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          placeholder="Kargo takip no"
          style={{ padding: 8, borderRadius: 10, border: "1px solid rgba(196,124,124,.25)", minWidth: 160 }}
        />
        <button type="button" className="btn primary" disabled={disabled} style={{ border: "none", cursor: disabled ? "wait" : "pointer" }} onClick={() => onSave(status, tracking)}>
          {disabled ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </div>
    </div>
  );
}
