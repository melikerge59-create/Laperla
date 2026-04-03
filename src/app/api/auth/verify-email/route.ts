import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashResetToken } from "@/lib/reset-token-hash";
import { absoluteUrl } from "@/lib/site-url";

export async function GET(request: Request) {
  const fail = absoluteUrl("/hesabim/profil?eposta=hata");
  const ok = absoluteUrl("/hesabim/profil?eposta=ok");

  const url = new URL(request.url);
  const raw = url.searchParams.get("token")?.trim();
  if (!raw) {
    return NextResponse.redirect(fail);
  }

  const tokenHash = hashResetToken(raw);
  const row = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    select: { userId: true, expiresAt: true },
  });

  if (!row || row.expiresAt < new Date()) {
    return NextResponse.redirect(fail);
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { emailVerifiedAt: new Date() },
    }),
    prisma.emailVerificationToken.deleteMany({ where: { userId: row.userId } }),
  ]);

  return NextResponse.redirect(ok);
}
