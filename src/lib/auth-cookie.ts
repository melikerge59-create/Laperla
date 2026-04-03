import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { AUTH_COOKIE, signSessionToken, verifySessionToken, type SessionPayload } from "@/lib/session-token";

const MAX_AGE = 60 * 60 * 24 * 30;

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: MAX_AGE,
  path: "/",
};

/**
 * Route Handler’larda oturum çerezini güvenilir şekilde göndermek için `NextResponse` üzerine yazar.
 * (`cookies().set` + ayrı `NextResponse.json` bazı ortamlarda Set-Cookie’yi düşürebiliyor.)
 */
export async function setAuthCookieOnResponse(
  response: NextResponse,
  userId: string,
  role: SessionPayload["role"],
): Promise<void> {
  const token = await signSessionToken({ sub: userId, role });
  response.cookies.set(AUTH_COOKIE, token, cookieOpts);
}

export function clearAuthCookieOnResponse(response: NextResponse): void {
  response.cookies.set(AUTH_COOKIE, "", { ...cookieOpts, maxAge: 0 });
}

export async function readSessionPayload(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const raw = jar.get(AUTH_COOKIE)?.value;
  if (!raw) return null;
  return verifySessionToken(raw);
}
