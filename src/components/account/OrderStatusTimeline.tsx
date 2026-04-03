import type { OrderStatus } from "@/generated/prisma/client";
import { orderStatusLabel } from "@/lib/order-status";

const FLOW: OrderStatus[] = ["PENDING_PAYMENT", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

export function OrderStatusTimeline({ status }: { status: OrderStatus }) {
  if (status === "CANCELLED") {
    return (
      <div
        className="panel"
        style={{
          marginTop: 16,
          padding: 14,
          borderLeft: "4px solid rgba(180, 68, 68, 0.85)",
          background: "rgba(255, 240, 240, 0.65)",
        }}
      >
        <strong style={{ fontSize: 14, color: "rgba(122, 58, 58, 0.98)" }}>Sipariş iptal</strong>
        <p className="m-desc" style={{ margin: "8px 0 0 0", fontSize: 13 }}>
          Bu sipariş iptal edilmiştir.
        </p>
      </div>
    );
  }

  if (status === "REFUNDED") {
    return (
      <div
        className="panel"
        style={{
          marginTop: 16,
          padding: 14,
          borderLeft: "4px solid rgba(183, 142, 75, 0.95)",
          background: "rgba(253, 245, 245, 0.9)",
        }}
      >
        <strong style={{ fontSize: 14, color: "rgba(122, 58, 58, 0.98)" }}>{orderStatusLabel("REFUNDED")}</strong>
        <p className="m-desc" style={{ margin: "8px 0 0 0", fontSize: 13 }}>
          Ödeme iade sürecine alınmış veya tamamlanmıştır. Detay için müşteri hizmetlerimizle iletişime geçebilirsiniz.
        </p>
      </div>
    );
  }

  const currentIndex = FLOW.indexOf(status);

  return (
    <div className="panel" style={{ marginTop: 16, padding: 16 }}>
      <h4 style={{ margin: "0 0 12px 0", fontSize: 15 }}>Durum akışı</h4>
      <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {FLOW.map((step, i) => {
          const done = currentIndex > i;
          const current = currentIndex === i;
          const pending = currentIndex < i;
          return (
            <li
              key={step}
              style={{
                display: "grid",
                gridTemplateColumns: "28px 1fr",
                gap: 10,
                alignItems: "center",
                padding: "10px 0",
                borderBottom: i < FLOW.length - 1 ? "1px solid rgba(245, 224, 224, 0.85)" : undefined,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 999,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  background: done ? "rgba(46, 125, 50, 0.18)" : current ? "rgba(196, 124, 124, 0.35)" : "rgba(245, 224, 224, 0.6)",
                  color: done ? "rgba(27, 94, 32, 0.95)" : current ? "rgba(122, 58, 58, 0.95)" : "rgba(168, 90, 90, 0.55)",
                  border: current ? "2px solid rgba(183, 142, 75, 0.75)" : "2px solid transparent",
                }}
              >
                {done ? "✓" : current ? "●" : i + 1}
              </span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: current ? 600 : 400,
                  color: pending ? "rgba(168, 90, 90, 0.65)" : "rgba(122, 58, 58, 0.95)",
                }}
              >
                {orderStatusLabel(step)}
                {current ? (
                  <span className="m-desc" style={{ display: "block", fontSize: 11, marginTop: 2, fontWeight: 400 }}>
                    Güncel adım
                  </span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
