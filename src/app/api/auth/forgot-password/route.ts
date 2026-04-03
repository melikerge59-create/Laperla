import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendTransactionalEmail } from "@/lib/mail";
import { clientIp, rateLimitConsume } from "@/lib/rate-limit";
import { createRawResetToken, hashResetToken } from "@/lib/reset-token-hash";
import { absoluteUrl } from "@/lib/site-url";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_ATTEMPTS = 8;

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limited = rateLimitConsume(`auth:forgot:${ip}`, MAX_ATTEMPTS, WINDOW_MS);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Çok fazla talep. Lütfen bir süre sonra tekrar deneyin.", retryAfterSec: limited.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz gövde" }, { status: 400 });
  }
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "E-posta gerekli" }, { status: 400 });
  }

  const generic = NextResponse.json({
    ok: true,
    message: "E-posta adresiniz kayıtlıysa kısa süre içinde şifre sıfırlama bağlantısı gönderilir.",
  });

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true, email: true, name: true },
  });

  if (!user?.passwordHash) {
    return generic;
  }

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  const raw = createRawResetToken();
  const tokenHash = hashResetToken(raw);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const link = absoluteUrl(`/sifre-yenile?token=${encodeURIComponent(raw)}`);
  const greeting = user.name?.trim() ? `Merhaba ${user.name.trim()},` : "Merhaba,";
  const brand = process.env.MAIL_BRAND_NAME?.trim() || "La Perla";
  const text = `${greeting}

La Perla hesabınız için şifre sıfırlama talebi alındı. Aşağıdaki bağlantıyı 1 saat içinde kullanabilirsiniz:

${link}

Bu talebi siz yapmadıysanız bu e-postayı yok sayabilirsiniz; şifreniz değişmez.

Teşekkürler,
${brand}`;

  await sendTransactionalEmail({
    to: user.email,
    subject: `${brand} — Şifre sıfırlama`,
    text,
  });

  return generic;
}
