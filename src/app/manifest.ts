import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${brand.name} — ${brand.tagline}`,
    short_name: brand.name,
    description: "Eşarp, çanta ve aksesuar vitrin mağazası.",
    start_url: "/",
    display: "standalone",
    background_color: "#fff8f6",
    theme_color: "#fff8f6",
    lang: "tr",
    icons: [
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
