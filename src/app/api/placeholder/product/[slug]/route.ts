function escapeXml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const alt = new URL(request.url).searchParams.get("thumb") === "1";
  const label = escapeXml(slug.replace(/-/g, " "));
  const c0 = alt ? "#D4A5A4" : "#E09C9B";
  const c1 = alt ? "#9B6B6A" : "#C47878";
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${c0}"/>
      <stop offset="100%" style="stop-color:${c1}"/>
    </linearGradient>
  </defs>
  <rect width="600" height="800" fill="url(#g)"/>
  <text x="300" y="375" fill="#F0E0B0" font-family="Georgia,serif" font-size="20" text-anchor="middle">${label}</text>
  <text x="300" y="410" fill="#FDF5F5" font-family="Georgia,serif" font-size="13" text-anchor="middle" opacity="0.85">La Perla</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
