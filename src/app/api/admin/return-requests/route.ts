import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminUser } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const take = Math.min(100, Math.max(1, parseInt(searchParams.get("take") ?? "80", 10) || 80));
  const requests = await prisma.returnRequest.findMany({
    take,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, name: true } },
      order: {
        select: {
          id: true,
          status: true,
          totalCents: true,
          createdAt: true,
        },
      },
    },
  });
  return NextResponse.json({ requests });
}
