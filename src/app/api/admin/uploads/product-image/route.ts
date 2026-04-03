import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { saveProductImageUpload } from "@/lib/admin-uploads";
import { rateLimitConsume } from "@/lib/rate-limit";

const UPLOAD_WINDOW_MS = 60 * 60 * 1000;
const UPLOAD_MAX_PER_HOUR = 100;

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Geçersiz form" }, { status: 400 });
  }

  const file = form.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "file alanı gerekli" }, { status: 400 });
  }

  const rl = rateLimitConsume(`admin:product-upload:${admin.id}`, UPLOAD_MAX_PER_HOUR, UPLOAD_WINDOW_MS);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Çok fazla yükleme. Lütfen bir süre sonra tekrar deneyin.", retryAfterSec: rl.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  const mime = file.type || "application/octet-stream";
  const buf = Buffer.from(await file.arrayBuffer());

  try {
    const { url } = await saveProductImageUpload(buf, mime);
    return NextResponse.json({ url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Yüklenemedi";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
