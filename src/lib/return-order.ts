import type { OrderStatus } from "@/generated/prisma/client";

const ALLOWED: OrderStatus[] = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

export function orderEligibleForReturnRequest(status: OrderStatus): boolean {
  return ALLOWED.includes(status);
}
