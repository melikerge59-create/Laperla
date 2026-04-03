import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Sepetteki varyant ID’leri için güncel stok (maks. 100 id). */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz gövde" }, { status: 400 });
  }
  const variantIds = (body as { variantIds?: unknown }).variantIds;
  if (!Array.isArray(variantIds) || variantIds.some((x) => typeof x !== "string")) {
    return NextResponse.json({ error: "variantIds string[] gerekli" }, { status: 400 });
  }
  const ids = [...new Set(variantIds as string[])].slice(0, 100);
  if (ids.length === 0) {
    return NextResponse.json({ stocks: {} as Record<string, number> });
  }

  const rows = await prisma.productVariant.findMany({
    where: { id: { in: ids } },
    select: { id: true, stock: true },
  });

  const stocks: Record<string, number> = {};
  for (const r of rows) {
    stocks[r.id] = r.stock;
  }

  return NextResponse.json({ stocks });
}
