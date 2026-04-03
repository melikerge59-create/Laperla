import type { Metadata } from "next";
import Link from "next/link";
import { LegacyProductCard } from "@/components/site/LegacyProductCard";
import { getCategories, getProductList, type ProductListSort } from "@/data/products";

export const dynamic = "force-dynamic";

const SORT_OPTIONS: { value: ProductListSort; label: string }[] = [
  { value: "newest", label: "En yeni" },
  { value: "price-asc", label: "Fiyat ↑" },
  { value: "price-desc", label: "Fiyat ↓" },
  { value: "name-asc", label: "Ada göre A→Z" },
  { value: "name-desc", label: "Ada göre Z→A" },
];

const ALLOWED_SORTS: ProductListSort[] = ["newest", "price-asc", "price-desc", "name-asc", "name-desc"];

function parseSort(raw: string | undefined): ProductListSort {
  if (raw && ALLOWED_SORTS.includes(raw as ProductListSort)) return raw as ProductListSort;
  return "newest";
}

function catalogHref(opts: { cat?: string; q?: string; sort?: ProductListSort }) {
  const sp = new URLSearchParams();
  if (opts.cat && opts.cat !== "all") sp.set("cat", opts.cat);
  if (opts.q?.trim()) sp.set("q", opts.q.trim());
  if (opts.sort && opts.sort !== "newest") sp.set("sort", opts.sort);
  const s = sp.toString();
  return s ? `/urunler?${s}` : "/urunler";
}

type Props = {
  searchParams: Promise<{ cat?: string; q?: string; sort?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { cat, q } = await searchParams;
  const qv = q?.trim() ?? "";
  const categories = await getCategories();
  const catLabel = cat && cat !== "all" ? categories.find((c) => c.slug === cat)?.name ?? null : null;

  let title = "Ürünler";
  if (qv && catLabel) title = `${qv} · ${catLabel}`;
  else if (qv) title = `“${qv}” araması`;
  else if (catLabel) title = catLabel;

  const description =
    qv || catLabel
      ? `La Perla ürün kataloğu${catLabel ? ` — ${catLabel}` : ""}${qv ? ` — arama: ${qv}` : ""}.`
      : "La Perla ipek eşarp, çanta ve aksesuar koleksiyonu. Kategorilere göz atın veya arayın.";

  return { title, description };
}

export default async function ProductsPage({ searchParams }: Props) {
  const { cat, q, sort: sortParam } = await searchParams;
  const categorySlug = cat ?? "all";
  const sortResolved = parseSort(sortParam);
  const [products, categories] = await Promise.all([
    getProductList(cat, q ?? null, undefined, sortResolved),
    getCategories(),
  ]);

  return (
    <section className="section white" style={{ paddingTop: 36 }}>
      <div className="lp-container">
        <div className="section-head">
          <span className="tag">✦ Katalog</span>
          <h2>
            Tüm <em>Ürünler</em>
          </h2>
          <div className="divider" />
        </div>

        <div className="search" aria-label="Arama">
          <form action="/urunler" method="get" style={{ display: "contents" }}>
            <input name="q" type="search" placeholder="Ürün ara (örn: ipek, çanta, bileklik)" defaultValue={q ?? ""} autoComplete="off" />
            {categorySlug !== "all" ? <input type="hidden" name="cat" value={categorySlug} /> : null}
            {sortResolved !== "newest" ? <input type="hidden" name="sort" value={sortResolved} /> : null}
          </form>
          <Link href="/urunler" className="mini">
            Temizle
          </Link>
        </div>

        <div className="catalog-bar" role="tablist" aria-label="Kategori filtreleri">
          <Link
            href={catalogHref({ q, sort: sortResolved })}
            className={`chip${categorySlug === "all" && !q?.trim() ? " active" : ""}`}
          >
            Tümü
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={catalogHref({ cat: c.slug, q, sort: sortResolved })}
              className={`chip${categorySlug === c.slug ? " active" : ""}`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        <div className="catalog-bar" role="tablist" aria-label="Sıralama" style={{ marginTop: 4 }}>
          {SORT_OPTIONS.map((opt) => (
            <Link
              key={opt.value}
              href={catalogHref({
                cat: categorySlug !== "all" ? categorySlug : undefined,
                q,
                sort: opt.value,
              })}
              className={`chip${sortResolved === opt.value ? " active" : ""}`}
            >
              {opt.label}
            </Link>
          ))}
        </div>

        {products.length === 0 ? (
          <p style={{ textAlign: "center", color: "rgba(168, 90, 90, 0.85)", marginTop: 24 }}>
            Bu kriterlerde ürün bulunamadı.{" "}
            <Link href="/urunler" style={{ color: "var(--gold)" }}>
              Filtreleri sıfırla
            </Link>
          </p>
        ) : (
          <div className="grid-products" aria-label="Ürün listesi">
            {products.map((p) => (
              <LegacyProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
