import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { clientIp, rateLimitConsume } from "@/lib/rate-limit";
import { hashResetToken } from "@/lib/reset-token-hash";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_ATTEMPTS = 20;

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limited = rateLimitConsume(`auth:reset:${ip}`, MAX_ATTEMPTS, WINDOW_MS);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Çok fazla deneme. Lütfen daha sonra tekrar deneyin.", retryAfterSec: limited.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  let body: { token?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz gövde" }, { status: 400 });
  }
  const raw = String(body.token ?? "").trim();
  const password = String(body.password ?? "");
  if (!raw || password.length < 6) {
    return NextResponse.json({ error: "Geçerli bağlantı ve en az 6 karakter şifre gerekli." }, { status: 400 });
  }

  const tokenHash = hashResetToken(raw);
  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: { userId: true, expiresAt: true },
  });

  if (!row || row.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Bağlantı geçersiz veya süresi dolmuş. Yeni bir sıfırlama talebi oluşturun." },
      { status: 400 },
    );
  }

  const passwordHash = await hashPassword(password);
  await prisma.$transaction([
    prisma.user.update({ where: { id: row.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.deleteMany({ where: { userId: row.userId } }),
  ]);

  return NextResponse.json({ ok: true });
}
