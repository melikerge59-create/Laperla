import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getOptionalUser } from "@/lib/auth-user";
import { prisma } from "@/lib/db";
import { formatTryFromKurus } from "@/lib/money";
import { orderStatusLabel } from "@/lib/order-status";

export const metadata: Metadata = {
  title: "Siparişlerim",
  description: "Geçmiş ve güncel siparişleriniz.",
};

export default async function OrdersPage() {
  const user = await getOptionalUser();
  if (!user || (user.role !== "CUSTOMER" && user.role !== "ADMIN")) {
    redirect("/giris?next=/hesabim/siparisler");
  }

  const isAdmin = user.role === "ADMIN";

  const orders = await prisma.order.findMany({
    where: isAdmin ? {} : { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: isAdmin ? 100 : 80,
    include: {
      items: {
        include: {
          variant: { include: { product: { select: { name: true, slug: true } } } },
        },
      },
      ...(isAdmin ? { user: { select: { email: true, name: true } } } : {}),
    },
  });

  return (
    <div>
      <h3 style={{ margin: 0, fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 28 }}>
        {isAdmin ? "Tüm siparişler" : "Siparişlerim"}
      </h3>
      <p style={{ margin: "10px 0 0 0", fontSize: 13, lineHeight: 1.65, color: "rgba(168, 90, 90, 0.85)" }}>
        {isAdmin ? (
          <>
            Yönetici görünümü: son 100 sipariş. Detay için numaraya tıklayın. Operasyon için{" "}
            <Link href="/admin/siparisler" style={{ color: "var(--gold)", fontWeight: 600 }}>
              admin siparişler
            </Link>{" "}
            sayfasını da kullanabilirsiniz.
          </>
        ) : (
          "Sipariş numarasına tıklayarak detay ve teslimat adresi özetini görüntüleyin."
        )}
      </p>

      {orders.length === 0 ? (
        <p className="m-desc" style={{ marginTop: 24 }}>
          {isAdmin ? (
            "Henüz sipariş kaydı yok."
          ) : (
            <>
              Henüz sipariş yok.{" "}
              <Link href="/urunler" style={{ color: "var(--gold)", fontWeight: 600 }}>
                Ürünlere göz atın
              </Link>
            </>
          )}
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: "20px 0 0 0", display: "grid", gap: 12 }}>
          {orders.map((o) => (
            <li key={o.id} className="panel" style={{ padding: 16, margin: 0 }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                <Link href={`/hesabim/siparisler/${o.id}`} style={{ fontWeight: 600, color: "rgba(122, 58, 58, 0.95)", textDecoration: "none" }}>
                  Sipariş #{o.id.slice(0, 8).toUpperCase()}
                </Link>
                <span className="m-desc" style={{ fontSize: 12 }}>{new Date(o.createdAt).toLocaleString("tr-TR")}</span>
              </div>
              {isAdmin && "user" in o && o.user ? (
                <p className="m-desc" style={{ margin: "6px 0 0 0", fontSize: 12 }}>
                  Müşteri: {o.user.name ?? o.user.email} · {o.user.email}
                </p>
              ) : null}
              <p style={{ margin: "8px 0 0 0", fontSize: 13 }}>
                {orderStatusLabel(o.status)} · {formatTryFromKurus(o.totalCents)}
                {o.shippingCents > 0 ? ` (kargo ${formatTryFromKurus(o.shippingCents)})` : null}
              </p>
              <ul className="m-desc" style={{ margin: "6px 0 0 0", paddingLeft: 18, fontSize: 12 }}>
                {o.items.map((it) => (
                  <li key={it.id}>
                    {it.variant.product.name} — {it.variant.name} × {it.quantity}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
