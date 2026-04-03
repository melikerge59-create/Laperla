import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminUser } from "@/lib/admin-auth";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      variants: { orderBy: { priceCents: "asc" } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!product) return NextResponse.json({ error: "Yok" }, { status: 404 });
  return NextResponse.json({ product });
}

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
  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: String(body.name).trim() } : {}),
      ...(body.description !== undefined ? { description: String(body.description).trim() } : {}),
      ...(body.active !== undefined ? { active: Boolean(body.active) } : {}),
      ...(body.categoryId !== undefined
        ? { categoryId: body.categoryId === null || body.categoryId === "" ? null : String(body.categoryId) }
        : {}),
      ...(body.slug !== undefined
        ? {
            slug: String(body.slug)
              .trim()
              .toLowerCase()
              .replace(/\s+/g, "-"),
          }
        : {}),
    },
  });
  return NextResponse.json({ product });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
