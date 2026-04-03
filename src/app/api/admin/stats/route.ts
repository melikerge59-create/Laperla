import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminUser } from "@/lib/admin-auth";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  const [products, ordersPending, ordersTotal, users] = await Promise.all([
    prisma.product.count({ where: { active: true } }),
    prisma.order.count({ where: { status: "PENDING_PAYMENT" } }),
    prisma.order.count(),
    prisma.user.count(),
  ]);
  return NextResponse.json({ products, ordersPending, ordersTotal, users });
}
