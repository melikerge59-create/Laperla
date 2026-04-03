import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminUser } from "@/lib/admin-auth";
import { tryRemoveUploadedFile } from "@/lib/admin-uploads";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Ctx) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  const { id } = await params;

  const img = await prisma.productImage.findUnique({ where: { id } });
  if (!img) return NextResponse.json({ error: "Yok" }, { status: 404 });

  const url = img.url;
  await prisma.productImage.delete({ where: { id } });
  await tryRemoveUploadedFile(url);

  return NextResponse.json({ ok: true });
}
