import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getOptionalUser } from "@/lib/auth-user";
import { prisma } from "@/lib/db";
import { formatTryFromKurus } from "@/lib/money";
import { orderStatusLabel } from "@/lib/order-status";

export const metadata: Metadata = {
  title: "Özet",
  description: "Hesap özetiniz ve hızlı durumlar.",
};

export default async function AccountDashboardPage() {
  const user = await getOptionalUser();
  if (!user || (user.role !== "CUSTOMER" && user.role !== "ADMIN")) {
    redirect("/giris?next=/hesabim");
  }

  const [openCount, lastOrder, defaultAddr, addrCount] = await Promise.all([
    prisma.order.count({
      where: {
        userId: user.id,
        status: { in: ["PENDING_PAYMENT", "PAID", "PROCESSING", "SHIPPED"] },
      },
    }),
    prisma.order.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          take: 2,
          include: { variant: { include: { product: { select: { name: true } } } } },
        },
      },
    }),
    prisma.address.findFirst({ where: { userId: user.id, isDefault: true } }),
    prisma.address.count({ where: { userId: user.id } }),
  ]);

  return (
    <div>
      <h3 style={{ margin: 0, fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 28 }}>Özet</h3>
      <p style={{ margin: "10px 0 0 0", fontSize: 13, lineHeight: 1.65, color: "rgba(168, 90, 90, 0.85)" }}>
        Hoş geldiniz{user.name ? `, ${user.name}` : ""}.
      </p>
      <ul style={{ margin: "20px 0 0 0", paddingLeft: 18, fontSize: 13, color: "rgba(122, 58, 58, 0.95)", lineHeight: 1.9 }}>
        <li>
          Açık sipariş: <strong>{openCount}</strong>{" "}
          <Link href="/hesabim/siparisler" style={{ color: "var(--gold)", fontWeight: 600 }}>
            Siparişlerim
          </Link>
        </li>
        <li>
          Kayıtlı adres: <strong>{addrCount}</strong>{" "}
          <Link href="/hesabim/adresler" style={{ color: "var(--gold)", fontWeight: 600 }}>
            Adreslerim
          </Link>
        </li>
        <li>
          Varsayılan adres:{" "}
          <strong>{defaultAddr ? `${defaultAddr.title} — ${defaultAddr.city}` : "—"}</strong>
        </li>
      </ul>

      {lastOrder ? (
        <div className="panel" style={{ marginTop: 24, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, alignItems: "baseline" }}>
            <span style={{ fontWeight: 600 }}>Son sipariş</span>
            <span className="m-desc" style={{ fontSize: 12 }}>
              {new Date(lastOrder.createdAt).toLocaleString("tr-TR")}
            </span>
          </div>
          <p style={{ margin: "8px 0 0 0", fontSize: 13 }}>
            Durum: <strong>{orderStatusLabel(lastOrder.status)}</strong> · Toplam{" "}
            <strong>{formatTryFromKurus(lastOrder.totalCents)}</strong>
          </p>
          <ul className="m-desc" style={{ margin: "8px 0 0 0", paddingLeft: 18, fontSize: 12 }}>
            {lastOrder.items.map((it) => (
              <li key={it.id}>
                {it.variant.product.name} × {it.quantity}
              </li>
            ))}
          </ul>
          <p style={{ marginTop: 12 }}>
            <Link href={`/hesabim/siparisler/${lastOrder.id}`} style={{ color: "var(--gold)", fontWeight: 600, fontSize: 13 }}>
              Detayı gör →
            </Link>
          </p>
        </div>
      ) : (
        <p className="m-desc" style={{ marginTop: 24 }}>
          Henüz sipariş yok.{" "}
          <Link href="/urunler" style={{ color: "var(--gold)", fontWeight: 600 }}>
            Alışverişe başlayın
          </Link>
        </p>
      )}
    </div>
  );
}
