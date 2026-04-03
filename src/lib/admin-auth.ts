import { getOptionalUser, type AuthUser } from "@/lib/auth-user";

export async function getAdminUser(): Promise<AuthUser | null> {
  const u = await getOptionalUser();
  if (!u || u.role !== "ADMIN") return null;
  return u;
}
