import { NextResponse } from "next/server";
import { getOptionalUser } from "@/lib/auth-user";
import { createAndSendEmailVerification } from "@/lib/email-verification-send";
import { prisma } from "@/lib/db";

export async function POST() {
  const user = await getOptionalUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (user.emailVerifiedAt) {
    return NextResponse.json({ error: "E-posta zaten doğrulanmış." }, { status: 400 });
  }

  const since = new Date(Date.now() - 120_000);
  const recent = await prisma.emailVerificationToken.count({
    where: { userId: user.id, createdAt: { gte: since } },
  });
  if (recent > 0) {
    return NextResponse.json(
      { error: "Çok sık istek. Birkaç dakika sonra tekrar deneyin." },
      { status: 429 },
    );
  }

  await createAndSendEmailVerification(user.id, user.email, user.name);
  return NextResponse.json({ ok: true, message: "Doğrulama e-postası gönderildi." });
}
