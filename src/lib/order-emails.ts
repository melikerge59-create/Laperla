import type { OrderStatus } from "@/generated/prisma/client";
import { sendTransactionalEmail } from "@/lib/mail";
import { formatTryFromKurus } from "@/lib/money";
import { orderStatusLabel } from "@/lib/order-status";
import { absoluteUrl } from "@/lib/site-url";

function brandName(): string {
  return process.env.MAIL_BRAND_NAME?.trim() || "La Perla";
}

type PlacedLine = { productName: string; variantName: string; quantity: number; lineTotalCents: number };

/** Sipariş oluşturuldu (checkout). Başarısızlıkta yalnızca log; sipariş akışını bozmaz. */
export async function notifyOrderPlacedEmail(opts: {
  customerEmail: string;
  customerName: string | null;
  orderId: string;
  status: OrderStatus;
  totalCents: number;
  shippingCents: number;
  lines: PlacedLine[];
}): Promise<void> {
  const short = opts.orderId.slice(0, 8).toUpperCase();
  const detailUrl = absoluteUrl(`/hesabim/siparisler/${opts.orderId}`);
  const greet = opts.customerName?.trim() ? `Merhaba ${opts.customerName.trim()},` : "Merhaba,";
  const notifyBcc = process.env.ORDER_NOTIFY_EMAIL?.trim();

  const linesText = opts.lines
    .map((l) => `· ${l.productName} — ${l.variantName} × ${l.quantity}  (${formatTryFromKurus(l.lineTotalCents)})`)
    .join("\n");

  const text = `${greet}

${brandName()} siparişiniz alındı.

Sipariş no: #${short}
Durum: ${orderStatusLabel(opts.status)}
Ara ürünler + kargo dahil toplam: ${formatTryFromKurus(opts.totalCents)}
${opts.shippingCents > 0 ? `Kargo payı: ${formatTryFromKurus(opts.shippingCents)}\n` : ""}
Satırlar:
${linesText}

Detay ve teslimat özeti: ${detailUrl}

Ödeme onayı / kargo bilgisi için e-posta veya hesabınızdaki sipariş ekranını takip edebilirsiniz.

Teşekkürler,
${brandName()}`;

  try {
    await sendTransactionalEmail({
      to: opts.customerEmail,
      bcc: notifyBcc ? [notifyBcc] : undefined,
      subject: `${brandName()} — Sipariş alındı (#${short})`,
      text,
    });
  } catch (e) {
    console.error("[order-emails] notifyOrderPlacedEmail", e);
  }
}

/** Admin sipariş güncellediğinde müşteriye (durum veya takip değiştiyse). */
export async function notifyOrderUpdatedEmail(opts: {
  customerEmail: string;
  customerName: string | null;
  orderId: string;
  newStatus: OrderStatus;
  trackingCode: string | null;
  statusChanged: boolean;
  trackingChanged: boolean;
}): Promise<void> {
  if (!opts.statusChanged && !opts.trackingChanged) return;

  const short = opts.orderId.slice(0, 8).toUpperCase();
  const detailUrl = absoluteUrl(`/hesabim/siparisler/${opts.orderId}`);
  const greet = opts.customerName?.trim() ? `Merhaba ${opts.customerName.trim()},` : "Merhaba,";

  const parts: string[] = [];
  if (opts.statusChanged) {
    parts.push(`Güncel durum: ${orderStatusLabel(opts.newStatus)}`);
  }
  if (opts.trackingChanged) {
    parts.push(
      opts.trackingCode
        ? `Kargo takip numarası: ${opts.trackingCode}`
        : "Kargo takip numarası kaldırıldı veya güncellendi.",
    );
  }

  const text = `${greet}

#${short} numaralı siparişinizde güncelleme var.

${parts.join("\n")}

Detay: ${detailUrl}

${brandName()}`;

  try {
    await sendTransactionalEmail({
      to: opts.customerEmail,
      subject: `${brandName()} — Sipariş güncellendi (#${short})`,
      text,
    });
  } catch (e) {
    console.error("[order-emails] notifyOrderUpdatedEmail", e);
  }
}
