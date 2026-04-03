import { formatTryFromKurus } from "@/lib/money";

export type CartLine = {
  variantId: string;
  productSlug: string;
  productName: string;
  variantName: string;
  priceCents: number;
  qty: number;
  imageUrl?: string;
  /** Sunucu stoku; tanımlıysa miktar bu değeri aşamaz (eski sepet satırlarında yoktur). */
  maxStock?: number;
};

const KEY = "lp_cart";

export function emitCartChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("lp-cart-changed"));
}

function isCartLineShape(x: unknown): x is CartLine {
  if (typeof x !== "object" || x === null) return false;
  const l = x as CartLine;
  if (typeof l.variantId !== "string") return false;
  if (typeof l.productSlug !== "string") return false;
  if (typeof l.productName !== "string") return false;
  if (typeof l.variantName !== "string") return false;
  if (typeof l.priceCents !== "number") return false;
  if (typeof l.qty !== "number") return false;
  if (l.maxStock !== undefined && (typeof l.maxStock !== "number" || l.maxStock < 0)) return false;
  return true;
}

function clampLinesToMaxStock(lines: CartLine[]): CartLine[] {
  return lines.map((l) => {
    if (l.maxStock !== undefined && l.maxStock > 0 && l.qty > l.maxStock) {
      return { ...l, qty: l.maxStock };
    }
    return l;
  });
}

/** localStorage’tan okur; yazma / emit yapmaz. */
function parseStoredCartLines(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCartLineShape);
  } catch {
    return [];
  }
}

export function getCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  const lines = parseStoredCartLines();
  const clamped = clampLinesToMaxStock(lines);
  if (JSON.stringify(lines) !== JSON.stringify(clamped)) {
    setCartRaw(clamped);
    return clamped;
  }
  return lines;
}

/** Sunucudaki güncel stokla sepeti hizalar; satır kaldırıldıysa veya miktar değiştiyse true. */
export async function reconcileCartStocksFromServer(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const lines = parseStoredCartLines();
  if (lines.length === 0) return false;
  const ids = [...new Set(lines.map((l) => l.variantId))].slice(0, 100);
  try {
    const res = await fetch("/api/cart/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantIds: ids }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { stocks?: Record<string, number> };
    const stocks = data.stocks ?? {};
    let changed = false;
    const next: CartLine[] = [];
    for (const l of lines) {
      const s = stocks[l.variantId];
      if (typeof s !== "number" || s < 0) {
        changed = true;
        continue;
      }
      if (s === 0) {
        changed = true;
        continue;
      }
      const maxStock = s;
      const qty = Math.min(l.qty, maxStock);
      if (l.maxStock !== maxStock || l.qty !== qty) changed = true;
      next.push({ ...l, maxStock, qty });
    }
    if (changed) setCartRaw(next);
    return changed;
  } catch {
    return false;
  }
}

function setCartRaw(lines: CartLine[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    /* ignore */
  }
  emitCartChanged();
}

export function cartLineItemCount(lines: CartLine[]): number {
  return lines.reduce((n, l) => n + l.qty, 0);
}

export function cartTotalCents(lines: CartLine[]): number {
  return lines.reduce((n, l) => n + l.priceCents * l.qty, 0);
}

export function addToCart(entry: Omit<CartLine, "qty"> & { qty?: number }) {
  const qtyWant = entry.qty ?? 1;
  const lines = getCart();
  const i = lines.findIndex((l) => l.variantId === entry.variantId);
  const cap =
    entry.maxStock !== undefined && entry.maxStock > 0
      ? entry.maxStock
      : undefined;

  if (i >= 0) {
    const next = [...lines];
    const prev = next[i];
    const mergedCap = cap ?? (prev.maxStock !== undefined && prev.maxStock > 0 ? prev.maxStock : undefined);
    let newQty = prev.qty + qtyWant;
    if (mergedCap !== undefined) newQty = Math.min(newQty, mergedCap);
    next[i] = {
      ...prev,
      qty: newQty,
      ...(mergedCap !== undefined ? { maxStock: mergedCap } : {}),
      ...(entry.imageUrl !== undefined ? { imageUrl: entry.imageUrl } : {}),
    };
    setCartRaw(next);
    return;
  }

  const initialQty = cap !== undefined ? Math.min(qtyWant, cap) : qtyWant;
  if (initialQty < 1) return;
  setCartRaw([
    ...lines,
    {
      variantId: entry.variantId,
      productSlug: entry.productSlug,
      productName: entry.productName,
      variantName: entry.variantName,
      priceCents: entry.priceCents,
      qty: initialQty,
      imageUrl: entry.imageUrl,
      ...(cap !== undefined ? { maxStock: cap } : {}),
    },
  ]);
}

export function setLineQty(variantId: string, qty: number) {
  const lines = getCart();
  const line = lines.find((l) => l.variantId === variantId);
  if (!line) return;
  let nextQty = qty;
  if (line.maxStock !== undefined && line.maxStock > 0) {
    nextQty = Math.min(qty, line.maxStock);
  }
  if (nextQty < 1) {
    removeLine(variantId);
    return;
  }
  const next = lines.map((l) => (l.variantId === variantId ? { ...l, qty: nextQty } : l));
  setCartRaw(next);
}

export function removeLine(variantId: string) {
  setCartRaw(getCart().filter((l) => l.variantId !== variantId));
}

export function clearCart() {
  setCartRaw([]);
}

/** WhatsApp / mesaj uygulamaları için sipariş özeti (UTF-8). */
export function cartSummaryPlainText(lines: CartLine[], storeName = "La Perla"): string {
  if (lines.length === 0) return "";
  const body = lines
    .map(
      (l) =>
        `• ${l.productName} (${l.variantName}) × ${l.qty} — ${formatTryFromKurus(l.priceCents * l.qty)}`,
    )
    .join("\n");
  const total = formatTryFromKurus(cartTotalCents(lines));
  return `Merhaba, ${storeName} sitesinden sipariş vermek istiyorum:\n\n${body}\n\nToplam: ${total}`;
}
