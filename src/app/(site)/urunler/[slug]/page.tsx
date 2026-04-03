import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetailShell } from "@/components/site/ProductDetailShell";
import { ProductPurchasePanel } from "@/components/site/ProductPurchasePanel";
import { getProductBySlug } from "@/data/products";
import { brand } from "@/lib/brand";
import { formatTryFromKurus } from "@/lib/money";
import { absoluteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Ürün bulunamadı" };
  const description =
    product.description.length > 155 ? `${product.description.slice(0, 152).trim()}…` : product.description || `${product.name} — La Perla`;
  const canonical = absoluteUrl(`/urunler/${slug}`);
  const ogImage = product.images[0]?.url ? absoluteUrl(product.images[0].url) : absoluteUrl("/logo.png");
  return {
    title: product.name,
    description,
    alternates: { canonical },
    openGraph: {
      title: product.name,
      description,
      type: "website",
      url: canonical,
      images: [{ url: ogImage }],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const imageUrls = product.images.map((im) => im.url);
  const cover = imageUrls[0] ?? "/logo.png";
  const minPrice = Math.min(...product.variants.map((v) => v.priceCents));
  const pricesTry = product.variants.map((v) => v.priceCents / 100);
  const lowTry = Math.min(...pricesTry);
  const highTry = Math.max(...pricesTry);
  const imageAbs = (imageUrls.length > 0 ? imageUrls : ["/logo.png"]).map((u) => absoluteUrl(u));
  const productPageUrl = absoluteUrl(`/urunler/${product.slug}`);
  const anyInStock = product.variants.some((v) => v.stock > 0);
  const availability = anyInStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
  const productJsonLd = {
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: imageAbs,
    brand: { "@type": "Brand" as const, name: brand.name },
    offers:
      product.variants.length > 1
        ? {
            "@type": "AggregateOffer" as const,
            lowPrice: lowTry.toFixed(2),
            highPrice: highTry.toFixed(2),
            priceCurrency: "TRY",
            availability,
            url: productPageUrl,
          }
        : {
            "@type": "Offer" as const,
            price: lowTry.toFixed(2),
            priceCurrency: "TRY",
            availability,
            url: productPageUrl,
          },
  };

  const crumbPaths: { name: string; href: string }[] = [
    { name: "Ana sayfa", href: "/" },
    { name: "Ürünler", href: "/urunler" },
  ];
  if (product.category) {
    crumbPaths.push({
      name: product.category.name,
      href: `/urunler?cat=${product.category.slug}`,
    });
  }
  crumbPaths.push({ name: product.name, href: `/urunler/${product.slug}` });

  const breadcrumbJsonLd = {
    "@type": "BreadcrumbList",
    itemListElement: crumbPaths.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.href),
    })),
  };

  const jsonLdCombined = {
    "@context": "https://schema.org",
    "@graph": [productJsonLd, breadcrumbJsonLd],
  };

  return (
    <section className="section white" style={{ paddingTop: 36 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdCombined) }} />
      <div className="lp-container">
        <nav aria-label="Sayfa konumu" style={{ marginBottom: 14, fontSize: 13, lineHeight: 1.6, color: "rgba(168, 90, 90, 0.95)" }}>
          {crumbPaths.map((c, i) => (
            <span key={`${c.href}-${i}`}>
              {i > 0 ? <span aria-hidden="true"> · </span> : null}
              {i === crumbPaths.length - 1 ? (
                <span style={{ color: "rgba(122, 58, 58, 0.98)", fontWeight: 600 }}>{c.name}</span>
              ) : (
                <Link href={c.href} style={{ color: "rgba(168, 90, 90, 0.95)" }}>
                  {c.name}
                </Link>
              )}
            </span>
          ))}
        </nav>
        <p style={{ marginBottom: 16 }}>
          <Link href="/urunler" style={{ color: "rgba(168, 90, 90, 0.95)", fontSize: 13 }}>
            ← Ürünlere dön
          </Link>
        </p>
        <ProductDetailShell key={product.slug} productName={product.name} imageUrls={imageUrls}>
          <div className="panel">
            <p className="brandline">{product.category?.name ?? "La Perla"}</p>
            <h3 style={{ marginTop: 8, fontFamily: "var(--font-display), serif", fontSize: 34, fontWeight: 400 }}>{product.name}</h3>
            <p className="m-desc" style={{ marginTop: 12 }}>
              {product.description}
            </p>
            <p className="m-price" style={{ marginTop: 8 }}>
              {formatTryFromKurus(minPrice)}
              {product.variants.length > 1 ? (
                <span style={{ fontSize: 16, fontWeight: 400, marginLeft: 8 }}>&apos;den başlayan</span>
              ) : null}
            </p>

            {product.variants.length > 1 ? (
              <div style={{ marginTop: 18 }}>
                <p className="brandline">Varyantlar</p>
                <ul style={{ listStyle: "none", padding: 0, margin: "10px 0 0 0" }}>
                  {product.variants.map((v) => (
                    <li
                      key={v.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "12px 0",
                        borderBottom: "1px solid rgba(245, 224, 224, 0.95)",
                        fontSize: 14,
                      }}
                    >
                      <span>
                        {v.name}
                        {v.sku ? <span style={{ opacity: 0.7, marginLeft: 8 }}>SKU: {v.sku}</span> : null}
                      </span>
                      <span style={{ fontFamily: "var(--font-display), serif", fontSize: 18, whiteSpace: "nowrap", marginLeft: 8 }}>
                        {formatTryFromKurus(v.priceCents)}
                        {v.stock <= 0 ? (
                          <span className="m-desc" style={{ display: "block", fontSize: 11, marginTop: 2 }}>
                            Tükendi
                          </span>
                        ) : (
                          <span className="m-desc" style={{ display: "block", fontSize: 11, marginTop: 2, fontWeight: 400 }}>
                            {v.stock} ad.
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <ProductPurchasePanel
              slug={product.slug}
              name={product.name}
              imageUrl={cover}
              variants={product.variants.map((v) => ({
                id: v.id,
                name: v.name,
                priceCents: v.priceCents,
                sku: v.sku,
                stock: v.stock,
              }))}
            />
          </div>
        </ProductDetailShell>
      </div>
    </section>
  );
}
