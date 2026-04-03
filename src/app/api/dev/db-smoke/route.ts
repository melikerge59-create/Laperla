import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Sadece geliştirme: hangi DB ve admin hash eşleşmesi görülüyor. */
export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const url = process.env.DATABASE_URL ?? "";
  const u = await prisma.user.findUnique({
    where: { email: "admin@laperla.local" },
    select: { passwordHash: true },
  });
  const bcrypt1910 = u?.passwordHash ? await bcrypt.compare("1910Huzur", u.passwordHash) : false;
  return NextResponse.json({
    databaseUrlHash: url.length + ":" + url.slice(-48),
    adminFound: !!u,
    hasPasswordHash: !!u?.passwordHash,
    bcrypt1910,
  });
}
