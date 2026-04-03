import { NextResponse } from "next/server";
import { getOptionalUser } from "@/lib/auth-user";
import { prisma } from "@/lib/db";
import { notifyReturnRequestCreated } from "@/lib/return-request-mail";
import { orderEligibleForReturnRequest } from "@/lib/return-order";
import { rateLimitConsume } from "@/lib/rate-limit";

const RETURN_WINDOW_MS = 60 * 60 * 1000;
const RETURN_MAX_PER_HOUR = 20;

export async function GET() {
  const user = await getOptionalUser();
  if (!user || (user.role !== "CUSTOMER" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const requests = await prisma.returnRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      order: { select: { id: true, status: true, totalCents: true, createdAt: true } },
    },
  });

  return NextResponse.json({ requests });
}

export async function POST(request: Request) {
  const user = await getOptionalUser();
  if (!user || user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  let body: { orderId?: string; reason?: string; note?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz gövde" }, { status: 400 });
  }

  const orderId = String(body.orderId ?? "").trim();
  const reason = String(body.reason ?? "").trim();
  const note = body.note ? String(body.note).trim() || null : null;

  if (!orderId || reason.length < 8) {
    return NextResponse.json({ error: "Sipariş ve en az 8 karakter gerekçe gerekli." }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id },
  });
  if (!order) {
    return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
  }
  if (!orderEligibleForReturnRequest(order.status)) {
    return NextResponse.json({ error: "Bu sipariş durumunda talep oluşturulamaz." }, { status: 400 });
  }

  const pending = await prisma.returnRequest.findFirst({
    where: { orderId, status: "PENDING" },
  });
  if (pending) {
    return NextResponse.json({ error: "Bu sipariş için bekleyen talep var." }, { status: 409 });
  }

  const rl = rateLimitConsume(`return-request:${user.id}`, RETURN_MAX_PER_HOUR, RETURN_WINDOW_MS);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Çok fazla talep gönderimi. Lütfen daha sonra tekrar deneyin.", retryAfterSec: rl.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  const created = await prisma.returnRequest.create({
    data: { userId: user.id, orderId, reason, note },
  });

  void notifyReturnRequestCreated({
    customerEmail: user.email,
    orderShort: order.id.slice(0, 8).toUpperCase(),
    reason,
    note,
  });

  return NextResponse.json({ request: created });
}
