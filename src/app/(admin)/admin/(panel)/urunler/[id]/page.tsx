import { notFound } from "next/navigation";
import { AdminProductEditClient } from "@/components/admin/AdminProductEditClient";
import { prisma } from "@/lib/db";

type Props = { params: Promise<{ id: string }> };

export default async function AdminProductEditPage({ params }: Props) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: { orderBy: { priceCents: "asc" } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!product) notFound();

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  const productPlain = JSON.parse(
    JSON.stringify({
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      active: product.active,
      categoryId: product.categoryId,
      variants: product.variants.map((v) => ({
        id: v.id,
        name: v.name,
        sku: v.sku,
        priceCents: v.priceCents,
        stock: v.stock,
      })),
      images: product.images.map((im) => ({
        id: im.id,
        url: im.url,
        sortOrder: im.sortOrder,
        variantId: im.variantId,
      })),
    }),
  );

  const categoriesPlain = JSON.parse(JSON.stringify(categories.map((c) => ({ id: c.id, name: c.name }))));

  return <AdminProductEditClient product={productPlain} categories={categoriesPlain} />;
}
