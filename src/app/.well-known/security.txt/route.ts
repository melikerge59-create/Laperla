import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** RFC 9116 — güvenlik araştırmacıları için iletişim (SITE_CONTACT_EMAIL ile doldurun). */
function securityContactEmail(): string | null {
  const site = process.env.SITE_CONTACT_EMAIL?.trim();
  if (site) return site;
  const mf = process.env.MAIL_FROM?.trim();
  if (!mf) return null;
  const angled = mf.match(/<([^>]+)>/);
  if (angled?.[1]?.includes("@")) return angled[1].trim();
  if (mf.includes("@")) return mf;
  return null;
}

export async function GET() {
  const email = securityContactEmail();

  const lines = [
    "# Güvenlik bildirimleri (security.txt)",
    email
      ? `Contact: mailto:${email}`
      : "# Contact: SITE_CONTACT_EMAIL veya MAIL_FROM tanımlayın",
    "Preferred-Languages: tr, en",
    "",
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
