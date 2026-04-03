import { NextResponse } from "next/server";
import { getOptionalUser } from "@/lib/auth-user";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getOptionalUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const list = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ addresses: list });
}

export async function POST(request: Request) {
  const user = await getOptionalUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz gövde" }, { status: 400 });
  }
  const title = String(body.title ?? "").trim();
  const fullName = String(body.fullName ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const line1 = String(body.line1 ?? "").trim();
  const line2 = String(body.line2 ?? "").trim() || null;
  const district = String(body.district ?? "").trim();
  const city = String(body.city ?? "").trim();
  const postalCode = String(body.postalCode ?? "").trim() || null;
  const isDefault = Boolean(body.isDefault);
  if (!title || !fullName || !phone || !line1 || !district || !city) {
    return NextResponse.json({ error: "Zorunlu alanlar eksik" }, { status: 400 });
  }
  const created = await prisma.$transaction(async (tx) => {
    if (isDefault) {
      await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    }
    return tx.address.create({
      data: {
        userId: user.id,
        title,
        fullName,
        phone,
        line1,
        line2,
        district,
        city,
        postalCode,
        isDefault,
      },
    });
  });
  return NextResponse.json({ address: created });
}
