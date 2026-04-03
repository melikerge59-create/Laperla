import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { getSiteBaseUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteBaseUrl();
  const now = new Date();

  const staticPaths = [
    "",
    "/urunler",
    "/sepet",
    "/odeme",
    "/giris",
    "/kayit",
    "/sifremi-unuttum",
    "/mesafeli-satis",
    "/iade-ve-degisim",
    "/kvkk",
  ];
  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "daily",
    priority: path === "" ? 1 : 0.8,
  }));

  let products: { slug: string; updatedAt: Date }[] = [];
  try {
    products = await prisma.product.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
  } catch {
    /* Derleme veya geçici DB kesintisinde yalnızca statik URL’ler */
  }

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/urunler/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...productEntries];
}
