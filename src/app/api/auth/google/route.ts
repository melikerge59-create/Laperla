import type { TokenPayload } from "google-auth-library";
import { OAuth2Client } from "google-auth-library";
import { NextResponse } from "next/server";
import { setAuthCookieOnResponse } from "@/lib/auth-cookie";
import { getGoogleWebClientIds } from "@/lib/google-oauth";
import { prisma } from "@/lib/db";
import { clientIp, rateLimitConsume } from "@/lib/rate-limit";

const GOOGLE_WINDOW_MS = 15 * 60 * 1000;
const GOOGLE_MAX = 60;

const ORIGIN_HINT = [
  "Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID (Web application).",
  "“Authorized JavaScript origins” içine adresi TAM ve PORT ile ekleyin; sonda / olmasın.",
  "Örnek (Next varsayılan 3000): http://localhost:3000 ve http://127.0.0.1:3000 — ikisini birden ekleyin.",
  "http://localhost ile http://localhost:3000 farklı kökendir; adres çubuğundaki ile aynısı olmalı.",
  ".env: GOOGLE_CLIENT_ID ve NEXT_PUBLIC_GOOGLE_CLIENT_ID aynı Web Client ID olmalı.",
].join("\n");

export async function POST(request: Request) {
  const clientIds = getGoogleWebClientIds();
  if (clientIds.length === 0) {
    return NextResponse.json(
      { error: "Google Client ID yapılandırılmamış.", hint: ORIGIN_HINT },
      { status: 503 },
    );
  }

  let body: { credential?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }
  const credential = body.credential;
  if (!credential || typeof credential !== "string") {
    return NextResponse.json({ error: "credential gerekli" }, { status: 400 });
  }

  const ip = clientIp(request);
  const limited = rateLimitConsume(`auth:google:${ip}`, GOOGLE_MAX, GOOGLE_WINDOW_MS);
  if (!limited.ok) {
    return NextResponse.json(
      {
        error: "Çok fazla Google giriş denemesi. Lütfen bir süre sonra tekrar deneyin.",
        hint: ORIGIN_HINT,
        retryAfterSec: limited.retryAfterSec,
      },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  let googlePayload: TokenPayload | undefined;
  try {
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientIds.length === 1 ? clientIds[0]! : clientIds,
    });
    googlePayload = ticket.getPayload();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[api/auth/google] verifyIdToken:", msg);
    return NextResponse.json(
      {
        error: "Google doğrulama başarısız",
        hint: ORIGIN_HINT,
        ...(process.env.NODE_ENV === "development" ? { detail: msg } : {}),
      },
      { status: 401 },
    );
  }

  const email = googlePayload?.email?.trim().toLowerCase();
  const sub = googlePayload?.sub;
  const name = googlePayload?.name?.trim() || null;
  if (!email || !sub) {
    return NextResponse.json({ error: "Google token geçersiz (e-posta veya sub yok)." }, { status: 401 });
  }

  const verifiedByGoogle = googlePayload?.email_verified === true;

  try {
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          role: "CUSTOMER",
          emailVerifiedAt: verifiedByGoogle ? new Date() : null,
        },
      });
    } else {
      const data: { name?: string | null; emailVerifiedAt?: Date } = {};
      if (name && !user.name) data.name = name;
      if (verifiedByGoogle) data.emailVerifiedAt = new Date();
      if (Object.keys(data).length > 0) {
        user = await prisma.user.update({ where: { id: user.id }, data });
      }
    }
    const res = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
    await setAuthCookieOnResponse(res, user.id, user.role);
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[api/auth/google] kullanıcı / oturum:", msg);
    return NextResponse.json(
      {
        error: "Hesap oluşturulamadı veya oturum kurulamadı.",
        hint: "Veritabanı ve AUTH_SECRET (≥16 karakter) ayarlarını kontrol edin.",
        ...(process.env.NODE_ENV === "development" ? { detail: msg } : {}),
      },
      { status: 500 },
    );
  }
}
