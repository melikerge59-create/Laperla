import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminUser } from "@/lib/admin-auth";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      category: true,
      variants: { orderBy: { priceCents: "asc" } },
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  let body: {
    slug?: string;
    name?: string;
    description?: string;
    categoryId?: string | null;
    active?: boolean;
    variant?: { sku?: string | null; name?: string; priceCents?: number; stock?: number };
    imageUrl?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz gövde" }, { status: 400 });
  }
  const slug = String(body.slug ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  const name = String(body.name ?? "").trim();
  const description = String(body.description ?? "").trim();
  if (!slug || !name) {
    return NextResponse.json({ error: "slug ve name gerekli" }, { status: 400 });
  }
  const v = body.variant ?? {};
  const variantName = String(v.name ?? "Standart").trim();
  const priceCents = Math.max(0, Math.floor(Number(v.priceCents) || 0));
  const stock = Math.max(0, Math.floor(Number(v.stock) || 0));
  const sku = v.sku ? String(v.sku).trim() : null;
  const imageUrl = String(body.imageUrl ?? "").trim() || `/api/placeholder/product/${slug}`;

  const exists = await prisma.product.findUnique({ where: { slug } });
  if (exists) {
    return NextResponse.json({ error: "Bu slug kullanılıyor" }, { status: 409 });
  }

  const product = await prisma.$transaction(async (tx) => {
    const p = await tx.product.create({
      data: {
        slug,
        name,
        description: description || name,
        active: body.active !== false,
        categoryId: body.categoryId || null,
      },
    });
    const variant = await tx.productVariant.create({
      data: {
        productId: p.id,
        sku,
        name: variantName,
        priceCents,
        stock,
      },
    });
    await tx.productImage.create({
      data: {
        productId: p.id,
        variantId: variant.id,
        url: imageUrl,
        sortOrder: 0,
      },
    });
    return tx.product.findUnique({
      where: { id: p.id },
      include: { variants: true, images: true },
    });
  });
  return NextResponse.json({ product });
}
