import { SignJWT, jwtVerify } from "jose";
import { jwtSecretBytes } from "@/lib/jwt-secret";

export const AUTH_COOKIE = "lp_auth";

export type SessionPayload = { sub: string; role: "CUSTOMER" | "ADMIN" };

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(jwtSecretBytes());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, jwtSecretBytes());
    const sub = payload.sub;
    const role = payload.role;
    if (typeof sub !== "string" || (role !== "CUSTOMER" && role !== "ADMIN")) return null;
    return { sub, role: role as SessionPayload["role"] };
  } catch {
    return null;
  }
}
