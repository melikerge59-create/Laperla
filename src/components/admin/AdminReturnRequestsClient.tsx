"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { OrderStatus, ReturnRequestStatus } from "@/generated/prisma/client";
import { formatTryFromKurus } from "@/lib/money";
import { orderStatusLabel } from "@/lib/order-status";
import { returnRequestStatusLabel } from "@/lib/return-request-status";

const STATUSES: ReturnRequestStatus[] = ["PENDING", "REVIEWED", "REJECTED", "COMPLETED"];

type Row = {
  id: string;
  status: ReturnRequestStatus;
  reason: string;
  note: string | null;
  createdAt: string;
  user: { email: string; name: string | null };
  order: {
    id: string;
    status: OrderStatus;
    totalCents: number;
    createdAt: string;
  };
};

function rowMatchesQuery(row: Row, raw: string): boolean {
  const q = raw.trim().toLowerCase();
  if (!q) return true;
  if (row.id.toLowerCase().includes(q)) return true;
  if (row.user.email.toLowerCase().includes(q)) return true;
  if ((row.user.name ?? "").toLowerCase().includes(q)) return true;
  if (row.order.id.toLowerCase().includes(q)) return true;
  if (row.reason.toLowerCase().includes(q)) return true;
  if ((row.note ?? "").toLowerCase().includes(q)) return true;
  if (returnRequestStatusLabel(row.status).toLowerCase().includes(q)) return true;
  if (orderStatusLabel(row.order.status).toLowerCase().includes(q)) return true;
  return false;
}

export function AdminReturnRequestsClient() {
  const [rows, setRows] = useState<Row[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    const r = await fetch("/api/admin/return-requests?take=80", { credentials: "include", cache: "no-store" });
    const j = (await r.json()) as { requests?: Row[]; error?: string };
    if (!r.ok) {
      setErr(j.error ?? "Liste alınamadı");
      return;
    }
    setRows(j.requests ?? []);
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

  async function saveStatus(id: string, status: ReturnRequestStatus) {
    setSavingId(id);
    setErr(null);
    try {
      const r = await fetch(`/api/admin/return-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
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

  const filtered = useMemo(() => rows.filter((row) => rowMatchesQuery(row, query)), [rows, query]);

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
          Ara (talep no, sipariş no, müşteri, gerekçe, not, durum)
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="örn. @mail, inceleniyor, sipariş id…"
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
          Eşleşen talep yok.
        </p>
      ) : null}
      <div style={{ display: "grid", gap: 16 }}>
        {filtered.map((row) => (
          <ReturnRowEditor
            key={`${row.id}-${row.status}`}
            row={row}
            disabled={savingId === row.id}
            onSave={(st) => void saveStatus(row.id, st)}
          />
        ))}
      </div>
      {!query.trim() && rows.length === 0 ? <p className="m-desc">Henüz iade / değişim talebi yok.</p> : null}
    </div>
  );
}

function ReturnRowEditor({
  row,
  disabled,
  onSave,
}: {
  row: Row;
  disabled: boolean;
  onSave: (status: ReturnRequestStatus) => void;
}) {
  const [status, setStatus] = useState<ReturnRequestStatus>(row.status);

  return (
    <div className="panel" style={{ padding: 16, margin: 0 }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
        <strong style={{ fontSize: 14 }}>#{row.id.slice(0, 8).toUpperCase()}</strong>
        <span className="m-desc" style={{ fontSize: 12 }}>
          {new Date(row.createdAt).toLocaleString("tr-TR")}
        </span>
      </div>
      <p className="m-desc" style={{ margin: "6px 0 0 0", fontSize: 13 }}>
        {row.user.name ?? row.user.email} · {row.user.email}
      </p>
      <p style={{ margin: "8px 0 0 0", fontSize: 13 }}>
        <Link
          href={`/hesabim/siparisler/${row.order.id}`}
          style={{ color: "var(--gold)", fontWeight: 600, textDecoration: "none" }}
        >
          Sipariş #{row.order.id.slice(0, 8).toUpperCase()}
        </Link>
        {" · "}
        {orderStatusLabel(row.order.status)} · {formatTryFromKurus(row.order.totalCents)}
      </p>
      <p style={{ margin: "10px 0 0 0", fontSize: 13, lineHeight: 1.55 }}>{row.reason}</p>
      {row.note ? (
        <p className="m-desc" style={{ margin: "6px 0 0 0", fontSize: 12 }}>
          Müşteri notu: {row.note}
        </p>
      ) : null}
      <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
          Talep durumu
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ReturnRequestStatus)}
            style={{ padding: 8, borderRadius: 10, border: "1px solid rgba(196,124,124,.25)" }}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {returnRequestStatusLabel(s)}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="btn primary"
          disabled={disabled || status === row.status}
          style={{ border: "none", cursor: disabled ? "wait" : "pointer" }}
          onClick={() => onSave(status)}
        >
          {disabled ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </div>
    </div>
  );
}
