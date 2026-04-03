import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { readSessionPayload } from "@/lib/auth-cookie";

/** Oturum kullanıcısı: şifre alanı dahil (Prisma varsayılan sonuçta hash düşer; `select` ile alınır). */
const authUserSelect = {
  id: true,
  email: true,
  phone: true,
  name: true,
  passwordHash: true,
  emailVerifiedAt: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type AuthUser = Prisma.UserGetPayload<{ select: typeof authUserSelect }>;

export async function getOptionalUser(): Promise<AuthUser | null> {
  const s = await readSessionPayload();
  if (!s) return null;
  return prisma.user.findUnique({
    where: { id: s.sub },
    select: authUserSelect,
  });
}

export async function requireUser(): Promise<AuthUser> {
  const u = await getOptionalUser();
  if (!u) throw new Error("UNAUTHORIZED");
  return u;
}

export async function requireAdmin(): Promise<AuthUser> {
  const u = await requireUser();
  if (u.role !== "ADMIN") throw new Error("FORBIDDEN");
  return u;
}
