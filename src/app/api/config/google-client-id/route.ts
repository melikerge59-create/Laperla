import { NextResponse } from "next/server";
import { primaryGoogleWebClientId } from "@/lib/google-oauth";

export const dynamic = "force-dynamic";

/** Tarayıcıda Google GIS için sadece Web Client ID döner (gizli bilgi yok). */
export async function GET() {
  return NextResponse.json({ clientId: primaryGoogleWebClientId() });
}
