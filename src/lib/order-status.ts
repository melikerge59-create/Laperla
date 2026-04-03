import type { OrderStatus } from "@/generated/prisma/client";

const LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Ödeme bekleniyor",
  PAID: "Ödendi",
  PROCESSING: "Hazırlanıyor",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim edildi",
  CANCELLED: "İptal",
  REFUNDED: "İade edildi",
};

export function orderStatusLabel(s: OrderStatus): string {
  return LABELS[s] ?? s;
}
