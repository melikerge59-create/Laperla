"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type ProductGalleryContextValue = { activeUrl: string; setActiveUrl: (url: string) => void };

export const ProductGalleryContext = createContext<ProductGalleryContextValue | null>(null);

export function ProductGalleryProvider({ defaultUrl, children }: { defaultUrl: string; children: ReactNode }) {
  const [activeUrl, setActiveUrl] = useState(defaultUrl);
  const value = useMemo(() => ({ activeUrl, setActiveUrl }), [activeUrl]);
  return <ProductGalleryContext.Provider value={value}>{children}</ProductGalleryContext.Provider>;
}

export function useOptionalProductGallery() {
  return useContext(ProductGalleryContext);
}
