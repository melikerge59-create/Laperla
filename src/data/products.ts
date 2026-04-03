import { cache } from "react";
import { prisma } from "@/lib/db";

const productDetailInclude = {
  category: true,
  variants: { orderBy: { priceCents: "asc" as const } },
  images: { orderBy: { sortOrder: "asc" as const } },
} as const;

export type ProductListSort = "newest" | "price-asc" | "price-desc" | "name-asc" | "name-desc";

type ProductListRow = {
  name: string;
  createdAt: Date;
  variants: { priceCents: number }[];
};

function minVariantPriceCents(p: ProductListRow): number {
  const v = p.variants.map((x) => x.priceCents);
  return v.length ? Math.min(...v) : Number.MAX_SAFE_INTEGER;
}

function sortProductList<T extends ProductListRow>(products: T[], sort: ProductListSort): T[] {
  const copy = [...products];
  switch (sort) {
    case "name-asc":
      return copy.sort((a, b) => a.name.localeCompare(b.name, "tr", { sensitivity: "base" }));
    case "name-desc":
      return copy.sort((a, b) => b.name.localeCompare(a.name, "tr", { sensitivity: "base" }));
    case "price-asc":
      return copy.sort((a, b) => minVariantPriceCents(a) - minVariantPriceCents(b));
    case "price-desc":
      return copy.sort((a, b) => minVariantPriceCents(b) - minVariantPriceCents(a));
    default:
      return copy.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export async function getProductList(
  categorySlug?: string | null,
  search?: string | null,
  take?: number,
  sort: ProductListSort = "newest",
) {
  const q = search?.trim();
  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(categorySlug && categorySlug !== "all" ? { category: { slug: categorySlug } } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { description: { contains: q } },
            ],
          }
        : {}),
    },
    include: productDetailInclude,
    orderBy: { createdAt: "desc" },
    ...(take ? { take } : {}),
  });
  if (take != null) return products;
  return sortProductList(products, sort);
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, active: true },
    include: productDetailInclude,
  });
}

export const getCategories = cache(async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
});
