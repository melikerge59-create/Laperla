import { sendTransactionalEmail } from "@/lib/mail";
import { absoluteUrl } from "@/lib/site-url";

function brandName(): string {
  return process.env.MAIL_BRAND_NAME?.trim() || "La Perla";
}

export async function notifyReturnRequestCreated(opts: {
  customerEmail: string;
  orderShort: string;
  reason: string;
  note: string | null;
}): Promise<void> {
  const notify = process.env.ORDER_NOTIFY_EMAIL?.trim();
  if (!notify) return;

  const text = `Yeni iade / değişim talebi

Sipariş: #${opts.orderShort}
Müşteri e-posta: ${opts.customerEmail}

Gerekçe:
${opts.reason}
${opts.note ? `\nNot:\n${opts.note}` : ""}

Admin panelinden siparişi kontrol edin.
${absoluteUrl("/admin/siparisler")}`;

  try {
    await sendTransactionalEmail({
      to: notify,
      subject: `${brandName()} — İade talebi (#${opts.orderShort})`,
      text,
    });
  } catch (e) {
    console.error("[return-request-mail]", e);
  }
}
