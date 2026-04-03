import type { ReturnRequestStatus } from "@/generated/prisma/client";

const LABELS: Record<ReturnRequestStatus, string> = {
  PENDING: "İnceleniyor",
  REVIEWED: "İncelendi",
  REJECTED: "Reddedildi",
  COMPLETED: "Tamamlandı",
};

export function returnRequestStatusLabel(s: ReturnRequestStatus): string {
  return LABELS[s] ?? s;
}
