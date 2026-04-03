import { NextResponse } from "next/server";
import type { ReturnRequestStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { getAdminUser } from "@/lib/admin-auth";

const STATUSES: ReturnRequestStatus[] = ["PENDING", "REVIEWED", "REJECTED", "COMPLETED"];

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  const { id } = await params;
  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz gövde" }, { status: 400 });
  }
  if (body.status === undefined) {
    return NextResponse.json({ error: "Durum gerekli" }, { status: 400 });
  }
  if (!STATUSES.includes(body.status as ReturnRequestStatus)) {
    return NextResponse.json({ error: "Geçersiz durum" }, { status: 400 });
  }
  const existing = await prisma.returnRequest.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Talep bulunamadı" }, { status: 404 });
  }
  const updated = await prisma.returnRequest.update({
    where: { id },
    data: { status: body.status as ReturnRequestStatus },
    include: {
      user: { select: { email: true, name: true } },
      order: { select: { id: true, status: true, totalCents: true, createdAt: true } },
    },
  });
  return NextResponse.json({ request: updated });
}
