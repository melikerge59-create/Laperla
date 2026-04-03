import { NextResponse } from "next/server";
import { getOptionalUser } from "@/lib/auth-user";
import { prisma } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const user = await getOptionalUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { id } = await params;
  const existing = await prisma.address.findFirst({ where: { id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz gövde" }, { status: 400 });
  }
  const isDefault = body.isDefault;
  const updated = await prisma.$transaction(async (tx) => {
    if (isDefault === true) {
      await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    }
    return tx.address.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: String(body.title).trim() } : {}),
        ...(body.fullName !== undefined ? { fullName: String(body.fullName).trim() } : {}),
        ...(body.phone !== undefined ? { phone: String(body.phone).trim() } : {}),
        ...(body.line1 !== undefined ? { line1: String(body.line1).trim() } : {}),
        ...(body.line2 !== undefined ? { line2: String(body.line2).trim() || null } : {}),
        ...(body.district !== undefined ? { district: String(body.district).trim() } : {}),
        ...(body.city !== undefined ? { city: String(body.city).trim() } : {}),
        ...(body.postalCode !== undefined ? { postalCode: String(body.postalCode).trim() || null } : {}),
        ...(typeof isDefault === "boolean" ? { isDefault } : {}),
      },
    });
  });
  return NextResponse.json({ address: updated });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const user = await getOptionalUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { id } = await params;
  const existing = await prisma.address.findFirst({ where: { id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  await prisma.address.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
