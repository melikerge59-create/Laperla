"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { addToCart } from "@/lib/client-cart";
import { formatTryFromKurus } from "@/lib/money";
import { isProductPlaceholderImageUrl } from "@/lib/product-image-url";

export type LegacyProductModel = {
  slug: string;
  name: string;
  description: string;
  category: { name: string; slug: string } | null;
  variants: { id: string; priceCents: number; name: string; stock: number }[];
  images: { url: string }[];
};

export function LegacyProductCard({ product }: { product: LegacyProductModel }) {
  const router = useRouter();
  const href = `/urunler/${product.slug}`;
  const first = product.variants[0];
  const from = first?.priceCents ?? 0;
  const firstInStock = first ? first.stock > 0 : false;
  const cover = product.images[0]?.url;

  const onOpen = () => router.push(href);

  return (
    <article
      className="card"
      role="link"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      aria-label={`${product.name} ürününü görüntüle`}
    >
      <div className="thumb">
        {cover ? (
          <Image
            src={cover}
            alt={`${product.name} görseli`}
            fill
            className="object-cover"
            sizes="(max-width: 680px) 50vw, 25vw"
            unoptimized={isProductPlaceholderImageUrl(cover)}
          />
        ) : (
          <div className="ph">Ürün Fotoğrafı</div>
        )}
        <div className="add-hover">
          <button
            type="button"
            title={
              product.variants.length > 1
                ? "Birden fazla varyant var; seçim için ürün sayfasına gider"
                : !firstInStock
                  ? "Bu ürün şu an stokta değil"
                  : undefined
            }
            disabled={product.variants.length <= 1 && !firstInStock}
            onClick={(e) => {
              e.stopPropagation();
              if (product.variants.length > 1) {
                onOpen();
                return;
              }
              if (first && first.stock > 0) {
                addToCart({
                  variantId: first.id,
                  productSlug: product.slug,
                  productName: product.name,
                  variantName: first.name,
                  priceCents: first.priceCents,
                  imageUrl: cover,
                  maxStock: first.stock,
                });
              } else onOpen();
            }}
          >
            {product.variants.length <= 1 && !firstInStock ? "Stokta yok" : "Sepete Ekle"}
          </button>
        </div>
      </div>
      <div className="card-body">
        <div className="brandline">{product.category?.name ?? "La Perla"}</div>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="price-row">
          <div>
            <span className="price">{formatTryFromKurus(from)}</span>
          </div>
          <button
            type="button"
            className="plus"
            aria-label="Ürünü incele"
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
          >
            +
          </button>
        </div>
      </div>
    </article>
  );
}
