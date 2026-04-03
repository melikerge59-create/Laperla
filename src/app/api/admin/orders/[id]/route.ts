import { NextResponse } from "next/server";
import type { OrderStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { getAdminUser } from "@/lib/admin-auth";
import { notifyOrderUpdatedEmail } from "@/lib/order-emails";

const STATUSES: OrderStatus[] = [
  "PENDING_PAYMENT",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  const { id } = await params;
  let body: { status?: string; trackingCode?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz gövde" }, { status: 400 });
  }
  const data: { status?: OrderStatus; trackingCode?: string | null } = {};
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status as OrderStatus)) {
      return NextResponse.json({ error: "Geçersiz durum" }, { status: 400 });
    }
    data.status = body.status as OrderStatus;
  }
  if (body.trackingCode !== undefined) {
    data.trackingCode = body.trackingCode === null || body.trackingCode === "" ? null : String(body.trackingCode);
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Güncellenecek alan yok" }, { status: 400 });
  }
  const existing = await prisma.order.findUnique({
    where: { id },
    include: { user: { select: { email: true, name: true } } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
  }

  const statusChanged = data.status !== undefined && data.status !== existing.status;
  const trackingChanged =
    data.trackingCode !== undefined && data.trackingCode !== existing.trackingCode;

  const order = await prisma.order.update({
    where: { id },
    data,
  });

  if (existing.user.email && (statusChanged || trackingChanged)) {
    void notifyOrderUpdatedEmail({
      customerEmail: existing.user.email,
      customerName: existing.user.name,
      orderId: order.id,
      newStatus: order.status,
      trackingCode: order.trackingCode,
      statusChanged,
      trackingChanged,
    });
  }

  return NextResponse.json({ order });
}
