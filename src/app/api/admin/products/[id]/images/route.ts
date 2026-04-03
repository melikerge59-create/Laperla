import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminUser } from "@/lib/admin-auth";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Ctx) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  const { id: productId } = await params;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "Ürün yok" }, { status: 404 });

  let body: { url?: string; variantId?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz gövde" }, { status: 400 });
  }

  const url = String(body.url ?? "").trim();
  if (!url) {
    return NextResponse.json({ error: "url gerekli" }, { status: 400 });
  }

  let variantId: string | null = null;
  if (body.variantId !== undefined && body.variantId !== null && body.variantId !== "") {
    variantId = String(body.variantId);
    const v = await prisma.productVariant.findFirst({
      where: { id: variantId, productId },
    });
    if (!v) {
      return NextResponse.json({ error: "Varyant bu ürüne ait değil" }, { status: 400 });
    }
  }

  const maxSort = await prisma.productImage.aggregate({
    where: { productId },
    _max: { sortOrder: true },
  });
  const sortOrder = (maxSort._max.sortOrder ?? -1) + 1;

  const image = await prisma.productImage.create({
    data: {
      productId,
      variantId,
      url,
      sortOrder,
    },
  });

  return NextResponse.json({ image });
}
