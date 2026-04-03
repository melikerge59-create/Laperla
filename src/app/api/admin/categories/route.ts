import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminUser } from "@/lib/admin-auth";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  let body: { slug?: string; name?: string };
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
  if (!slug || !name) return NextResponse.json({ error: "slug ve name gerekli" }, { status: 400 });
  const cat = await prisma.category.create({ data: { slug, name } });
  return NextResponse.json({ category: cat });
}
