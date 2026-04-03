import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getOptionalUser } from "@/lib/auth-user";
import { prisma } from "@/lib/db";
import { formatTryFromKurus } from "@/lib/money";
import { OrderStatusTimeline } from "@/components/account/OrderStatusTimeline";
import { ReturnRequestForm } from "@/components/account/ReturnRequestForm";
import { formatOrderAddressSnapshotLines } from "@/lib/order-address-snapshot";
import { orderStatusLabel } from "@/lib/order-status";
import { orderEligibleForReturnRequest } from "@/lib/return-order";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tesekkur?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Sipariş ${id.slice(0, 8)}` };
}

export default async function OrderDetailPage({ params, searchParams }: Props) {
  const user = await getOptionalUser();
  if (!user || (user.role !== "CUSTOMER" && user.role !== "ADMIN")) {
    const { id } = await params;
    redirect(`/giris?next=${encodeURIComponent(`/hesabim/siparisler/${id}`)}`);
  }

  const { id } = await params;
  const sp = await searchParams;
  const order = await prisma.order.findFirst({
    where: user.role === "ADMIN" ? { id } : { id, userId: user.id },
    include: {
      items: {
        include: {
          variant: { include: { product: { select: { name: true, slug: true } } } },
        },
      },
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!order) notFound();

  const pendingReturn = await prisma.returnRequest.findFirst({
    where: { orderId: order.id, status: "PENDING" },
  });
  const eligible = orderEligibleForReturnRequest(order.status);
  let returnBlocked: string | null = null;
  if (!eligible) {
    returnBlocked = "Bu sipariş durumunda (ör. ödeme bekleniyor, iptal) iade/değişim talebi açılamaz.";
  } else if (pendingReturn) {
    returnBlocked = "Bu sipariş için bekleyen bir iade/değişim talebiniz var. Sonuç için iletişim bilgilerinizi kontrol edin.";
  }

  const snapLines = formatOrderAddressSnapshotLines(order.addressSnapshot);
  const thank = sp.tesekkur === "1";

  return (
    <div>
      <p style={{ margin: 0 }}>
        <Link href="/hesabim/siparisler" className="m-desc" style={{ fontSize: 13, color: "var(--gold)", fontWeight: 600 }}>
          ← Sipariş listesi
        </Link>
      </p>
      {thank ? (
        <div
          style={{
            marginTop: 14,
            padding: "12px 14px",
            borderRadius: 14,
            background: "rgba(224, 242, 224, 0.55)",
            fontSize: 13,
            color: "rgba(46, 100, 50, 0.95)",
          }}
        >
          Siparişiniz alındı. Ödeme onayı ve kargo bilgisi için ekibimiz veya hesabınızdaki durum güncellemelerini takip edin.
        </div>
      ) : null}
      <h3 style={{ margin: "16px 0 0 0", fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 28 }}>
        Sipariş #{order.id.slice(0, 8).toUpperCase()}
      </h3>
      <p className="m-desc" style={{ margin: "8px 0 0 0", fontSize: 13 }}>
        {new Date(order.createdAt).toLocaleString("tr-TR")}
      </p>
      <p style={{ margin: "12px 0 0 0", fontSize: 14 }}>
        <strong>{orderStatusLabel(order.status)}</strong>
        {order.trackingCode ? (
          <>
            {" "}
            · Kargo takip: <strong>{order.trackingCode}</strong>
          </>
        ) : null}
      </p>
      <OrderStatusTimeline status={order.status} />
      <p style={{ margin: "8px 0 0 0", fontSize: 15 }}>
        Toplam: <strong>{formatTryFromKurus(order.totalCents)}</strong>
        {order.shippingCents > 0 ? ` (kargo dahil ${formatTryFromKurus(order.shippingCents)})` : null}
      </p>

      <div className="panel" style={{ marginTop: 20, padding: 16 }}>
        <h4 style={{ margin: "0 0 10px 0", fontSize: 15 }}>Ürünler</h4>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 13, lineHeight: 1.7 }}>
          {order.items.map((it) => (
            <li key={it.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "6px 0", borderBottom: "1px solid rgba(245,224,224,0.85)" }}>
              <span>
                <Link href={`/urunler/${it.variant.product.slug}`} style={{ color: "rgba(122, 58, 58, 0.95)", fontWeight: 600 }}>
                  {it.variant.product.name}
                </Link>
                {" — "}
                {it.variant.name} × {it.quantity}
              </span>
              <span>{formatTryFromKurus(it.priceCents * it.quantity)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="panel" style={{ marginTop: 16, padding: 16 }}>
        <h4 style={{ margin: "0 0 10px 0", fontSize: 15 }}>Teslimat adresi</h4>
        {snapLines.length ? (
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, whiteSpace: "pre-line" }}>
            {snapLines.join("\n")}
          </p>
        ) : (
          <p className="m-desc" style={{ margin: 0 }}>Adres bilgisi yok.</p>
        )}
      </div>

      <div className="panel" style={{ marginTop: 16, padding: 16 }}>
        <h4 style={{ margin: "0 0 10px 0", fontSize: 15 }}>Ödeme</h4>
        <p className="m-desc" style={{ margin: 0, fontSize: 13, lineHeight: 1.65 }}>
          Sağlayıcı: <strong>{order.payments[0]?.provider ?? "—"}</strong>
          <br />
          Durum: <strong>{order.payments[0]?.status ?? "—"}</strong>
          <br />
          Tutar: <strong>{formatTryFromKurus(order.payments[0]?.amountCents ?? order.totalCents)}</strong>
        </p>
        <p className="m-desc" style={{ margin: "12px 0 0 0", fontSize: 12 }}>
          Kart / iyzico / Stripe entegrasyonu canlıya alınırken ödeme satırı güncellenecektir. Şu an havale veya manuel onay akışı için
          uygundur.
        </p>
      </div>

      <div className="panel" style={{ marginTop: 16, padding: 16 }}>
        <h4 style={{ margin: "0 0 10px 0", fontSize: 15 }}>İade / değişim talebi</h4>
        {user.id === order.userId ? (
          <>
            <p className="m-desc" style={{ margin: "0 0 12px 0", fontSize: 12, lineHeight: 1.55 }}>
              Talebiniz kayda geçer; operasyon ekibi size döner. Koşullar için{" "}
              <Link href="/iade-ve-degisim" style={{ color: "var(--gold)", fontWeight: 600 }}>
                iade ve değişim
              </Link>{" "}
              sayfasına bakın.
            </p>
            <ReturnRequestForm orderId={order.id} canRequest={eligible && !pendingReturn} blockedReason={returnBlocked} />
          </>
        ) : (
          <p className="m-desc" style={{ margin: 0, fontSize: 12, lineHeight: 1.55 }}>
            Müşteri siparişi görüntüleniyor. İade talebi yalnızca sipariş sahibinin hesabından oluşturulur. Talep listesi ve durum
            güncellemesi için{" "}
            <Link href="/admin/iade-talepleri" style={{ color: "var(--gold)", fontWeight: 600 }}>
              yönetim — iade talepleri
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
