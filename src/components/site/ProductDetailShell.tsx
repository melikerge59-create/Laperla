"use client";

import Image from "next/image";
import { useCallback, useContext, type ReactNode } from "react";
import { isProductPlaceholderImageUrl } from "@/lib/product-image-url";
import { ProductGalleryContext, ProductGalleryProvider } from "./product-gallery-context";

function GalleryColumn({ productName, urls }: { productName: string; urls: string[] }) {
  const ctx = useContext(ProductGalleryContext);

  const go = useCallback(
    (delta: number) => {
      if (!ctx || urls.length < 2) return;
      const i = urls.indexOf(ctx.activeUrl);
      const from = i >= 0 ? i : 0;
      const next = (from + delta + urls.length) % urls.length;
      ctx.setActiveUrl(urls[next]);
    },
    [ctx, urls],
  );

  if (!ctx) return null;

  const { activeUrl, setActiveUrl } = ctx;

  return (
    <>
      <div
        className={`thumb${urls.length > 1 ? " lp-gallery-main" : ""}`}
        tabIndex={urls.length > 1 ? 0 : undefined}
        role={urls.length > 1 ? "region" : undefined}
        aria-label={urls.length > 1 ? `${productName} görselleri; sol ve sağ ok ile değiştirin` : undefined}
        onKeyDown={(e) => {
          if (urls.length < 2) return;
          if (e.key === "ArrowRight") {
            e.preventDefault();
            go(1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            go(-1);
          }
        }}
        style={{
          aspectRatio: "3/4",
          borderRadius: 0,
          border: "none",
          position: "relative",
          outline: "none",
        }}
      >
        <Image
          src={activeUrl}
          alt={productName}
          fill
          className="object-cover"
          sizes="(max-width: 900px) 100vw, 45vw"
          priority
          unoptimized={isProductPlaceholderImageUrl(activeUrl)}
        />
      </div>
      {urls.length > 1 ? (
        <div
          role="tablist"
          aria-label="Ürün görselleri"
          style={{
            display: "flex",
            gap: 8,
            padding: 12,
            flexWrap: "wrap",
            borderTop: "1px solid rgba(245, 224, 224, 0.95)",
            justifyContent: "center",
            background: "rgba(255,250,250,0.5)",
          }}
        >
          {urls.map((u, i) => {
            const selected = u === activeUrl;
            return (
              <button
                key={`thumb-${i}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-label={`Görsel ${i + 1}`}
                onClick={() => setActiveUrl(u)}
                style={{
                  position: "relative",
                  width: 56,
                  height: 70,
                  padding: 0,
                  borderRadius: 10,
                  overflow: "hidden",
                  cursor: "pointer",
                  border: selected ? "2px solid rgba(183, 142, 75, 0.95)" : "2px solid transparent",
                  opacity: selected ? 1 : 0.85,
                  background: "rgba(245,224,224,0.4)",
                }}
              >
                <Image
                  src={u}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="56px"
                  unoptimized={isProductPlaceholderImageUrl(u)}
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </>
  );
}

export function ProductDetailShell({
  productName,
  imageUrls,
  children,
}: {
  productName: string;
  imageUrls: string[];
  children: ReactNode;
}) {
  const urls = imageUrls.length > 0 ? imageUrls : ["/logo.png"];
  const defaultUrl = urls[0];

  return (
    <ProductGalleryProvider defaultUrl={defaultUrl}>
      <div className="contact">
        <div className="panel" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <GalleryColumn productName={productName} urls={urls} />
        </div>
        {children}
      </div>
    </ProductGalleryProvider>
  );
}
