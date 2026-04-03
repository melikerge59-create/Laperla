import { NextResponse } from "next/server";
import { setAuthCookieOnResponse } from "@/lib/auth-cookie";
import { prisma } from "@/lib/db";
import { createAndSendEmailVerification } from "@/lib/email-verification-send";
import { hashPassword } from "@/lib/password";
import { clientIp, rateLimitConsume } from "@/lib/rate-limit";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_ATTEMPTS = 12;

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limited = rateLimitConsume(`auth:register:${ip}`, MAX_ATTEMPTS, WINDOW_MS);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Çok fazla kayıt denemesi. Lütfen daha sonra tekrar deneyin.", retryAfterSec: limited.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  let body: { email?: string; password?: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(body.password ?? "");
  const name = String(body.name ?? "").trim() || null;
  if (!email || !password || password.length < 6) {
    return NextResponse.json({ error: "E-posta ve en az 6 karakter şifre gerekli." }, { status: 400 });
  }
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "Bu e-posta zaten kayıtlı." }, { status: 409 });
  }
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, name, role: "CUSTOMER" },
  });
  void createAndSendEmailVerification(user.id, user.email, user.name);
  const res = NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
  await setAuthCookieOnResponse(res, user.id, "CUSTOMER");
  return res;
}
