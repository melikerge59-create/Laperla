import type { NextConfig } from "next";

const imageRemotePatterns: Array<{
  protocol: "http" | "https";
  hostname: string;
  pathname: string;
}> = [
  { protocol: "http", hostname: "127.0.0.1", pathname: "/**" },
  { protocol: "http", hostname: "localhost", pathname: "/**" },
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
if (supabaseUrl) {
  try {
    const { hostname } = new URL(supabaseUrl);
    imageRemotePatterns.push({
      protocol: "https",
      hostname,
      pathname: "/storage/v1/object/public/**",
    });
  } catch {
    /* geçersiz URL yok say */
  }
}

const nextConfig: NextConfig = {
  devIndicators: false,
  async headers() {
    return [
      {
        source: "/uploads/products/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  images: {
    remotePatterns: imageRemotePatterns,
  },
};

export default nextConfig;
