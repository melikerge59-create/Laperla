import { NextResponse } from "next/server";
import { getOptionalUser } from "@/lib/auth-user";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";

export async function PATCH(request: Request) {
  const user = await getOptionalUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz gövde" }, { status: 400 });
  }
  const name = body.name !== undefined ? String(body.name).trim() || null : undefined;
  const phone = body.phone !== undefined ? String(body.phone).trim() || null : undefined;
  const newPassword = body.newPassword !== undefined ? String(body.newPassword) : undefined;
  const currentPassword = body.currentPassword !== undefined ? String(body.currentPassword) : undefined;

  if (newPassword) {
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Yeni şifre en az 6 karakter" }, { status: 400 });
    }
    if (user.passwordHash) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Mevcut şifre gerekli" }, { status: 400 });
      }
      const ok = await verifyPassword(currentPassword, user.passwordHash);
      if (!ok) {
        return NextResponse.json({ error: "Mevcut şifre hatalı" }, { status: 401 });
      }
    }
  }

  const passwordHash =
    newPassword && newPassword.length >= 6 ? await hashPassword(newPassword) : undefined;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(passwordHash ? { passwordHash } : {}),
    },
  });
  return NextResponse.json({
    user: { id: updated.id, email: updated.email, name: updated.name, phone: updated.phone },
  });
}
