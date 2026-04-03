/** Dinamik SVG placeholder; next/image bu URL'lerde optimizasyonu kapatmalı. */
export function isProductPlaceholderImageUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  return url.startsWith("/api/placeholder/product/");
}
