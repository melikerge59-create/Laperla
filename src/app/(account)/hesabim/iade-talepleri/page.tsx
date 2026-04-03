import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getOptionalUser } from "@/lib/auth-user";
import { prisma } from "@/lib/db";
import { formatTryFromKurus } from "@/lib/money";
import { returnRequestStatusLabel } from "@/lib/return-request-status";

export const metadata: Metadata = {
  title: "İade talepleri",
  description: "İade ve değişim taleplerinizin durumu.",
};

export default async function ReturnRequestsPage() {
  const user = await getOptionalUser();
  if (!user || (user.role !== "CUSTOMER" && user.role !== "ADMIN")) {
    redirect("/giris?next=/hesabim/iade-talepleri");
  }

  const requests = await prisma.returnRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { order: { select: { id: true, createdAt: true, totalCents: true } } },
  });

  return (
    <div>
      <h3 style={{ margin: 0, fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 28 }}>İade / değişim talepleri</h3>
      <p style={{ margin: "10px 0 0 0", fontSize: 13, lineHeight: 1.65, color: "rgba(168, 90, 90, 0.85)" }}>
        Taleplerinizi sipariş sayfasından da oluşturabilirsiniz. Güncel durum aşağıdadır.
      </p>

      {requests.length === 0 ? (
        <p className="m-desc" style={{ marginTop: 24 }}>
          Henüz talep yok.{" "}
          <Link href="/hesabim/siparisler" style={{ color: "var(--gold)", fontWeight: 600 }}>
            Siparişlerim
          </Link>
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: "20px 0 0 0", display: "grid", gap: 12 }}>
          {requests.map((r) => (
            <li key={r.id} className="panel" style={{ padding: 16, margin: 0 }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
                <Link
                  href={`/hesabim/siparisler/${r.orderId}`}
                  style={{ fontWeight: 600, color: "rgba(122, 58, 58, 0.95)", textDecoration: "none" }}
                >
                  Sipariş #{r.order.id.slice(0, 8).toUpperCase()}
                </Link>
                <span className="m-desc" style={{ fontSize: 12 }}>{returnRequestStatusLabel(r.status)}</span>
              </div>
              <p className="m-desc" style={{ margin: "8px 0 0 0", fontSize: 12 }}>
                {new Date(r.createdAt).toLocaleString("tr-TR")} · Sipariş tutarı {formatTryFromKurus(r.order.totalCents)}
              </p>
              <p style={{ margin: "8px 0 0 0", fontSize: 13, lineHeight: 1.55 }}>{r.reason}</p>
              {r.note ? (
                <p className="m-desc" style={{ margin: "6px 0 0 0", fontSize: 12 }}>
                  Not: {r.note}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
