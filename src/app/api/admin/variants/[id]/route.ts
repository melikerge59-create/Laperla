import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminUser } from "@/lib/admin-auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz gövde" }, { status: 400 });
  }
  const data: {
    name?: string;
    sku?: string | null;
    priceCents?: number;
    stock?: number;
  } = {};
  if (body.name !== undefined) data.name = String(body.name).trim();
  if (body.sku !== undefined) data.sku = body.sku === null || body.sku === "" ? null : String(body.sku);
  if (body.priceCents !== undefined) data.priceCents = Math.max(0, Math.floor(Number(body.priceCents)));
  if (body.stock !== undefined) data.stock = Math.max(0, Math.floor(Number(body.stock)));
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Alan yok" }, { status: 400 });
  }
  const variant = await prisma.productVariant.update({ where: { id }, data });
  return NextResponse.json({ variant });
}
