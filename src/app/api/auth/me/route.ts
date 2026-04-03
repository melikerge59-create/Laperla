import { NextResponse } from "next/server";
import { getOptionalUser } from "@/lib/auth-user";

export async function GET() {
  const user = await getOptionalUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
    },
  });
}
