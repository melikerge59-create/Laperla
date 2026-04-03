import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function AdminDashboardPage() {
  const [products, ordersPending, ordersTotal, users, returnsPending] = await Promise.all([
    prisma.product.count({ where: { active: true } }),
    prisma.order.count({ where: { status: "PENDING_PAYMENT" } }),
    prisma.order.count(),
    prisma.user.count(),
    prisma.returnRequest.count({ where: { status: "PENDING" } }),
  ]);

  const cards = [
    { label: "Aktif ürün", value: products, href: "/admin/urunler" },
    { label: "Bekleyen ödeme", value: ordersPending, href: "/admin/siparisler" },
    { label: "Toplam sipariş", value: ordersTotal, href: "/admin/siparisler" },
    { label: "İade talebi (bekleyen)", value: returnsPending, href: "/admin/iade-talepleri" },
    { label: "Kullanıcı", value: users, href: null },
  ];

  return (
    <div>
      <p className="m-desc" style={{ margin: "0 0 16px 0", fontSize: 13 }}>
        Özet istatistikler. Sipariş ve ürün yönetimi için menüyü kullanın.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 14,
        }}
      >
        {cards.map((c) => {
          const inner = (
            <div className="panel" style={{ padding: 18, margin: 0 }}>
              <div className="m-desc" style={{ margin: 0, fontSize: 12 }}>{c.label}</div>
              <div style={{ marginTop: 8, fontFamily: "var(--font-display),serif", fontSize: 32, fontWeight: 600 }}>{c.value}</div>
            </div>
          );
          return c.href ? (
            <Link key={c.label} href={c.href} style={{ textDecoration: "none", color: "inherit" }}>
              {inner}
            </Link>
          ) : (
            <div key={c.label}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
}
