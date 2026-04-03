import type { Metadata } from "next";
import Link from "next/link";
import { LegacyProductCard } from "@/components/site/LegacyProductCard";
import { getCategories, getProductList } from "@/data/products";
import { brand, brandWhatsAppDigits, isBrandWhatsAppConfigured } from "@/lib/brand";
import { getSiteBaseUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: `${brand.name} — ${brand.tagline}` },
  description:
    "İpek eşarp, tasarım çanta ve özel aksesuarlar. La Perla online koleksiyonu ile zarafeti keşfedin; sepet ve mağaza deneyimi.",
};

const mapsEmbed =
  "https://maps.google.com/maps?q=Abdurrahman+Gazi+Mahallesi%2C+Sevenler+Caddesi+No%3A35%2C+Sancaktepe%2F%C4%B0stanbul&hl=tr&z=17&output=embed";
const mapsDirections =
  "https://www.google.com/maps/search/?api=1&query=Abdurrahman+Gazi+Mahallesi%2C+Sevenler+Caddesi+No%3A35%2C+Sancaktepe%2F%C4%B0stanbul";

export default async function HomePage() {
  const [products, categories] = await Promise.all([getProductList("all", null, 8), getCategories()]);
  const waHref = isBrandWhatsAppConfigured() ? `https://wa.me/${brandWhatsAppDigits()}` : null;
  const base = getSiteBaseUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${base}/#organization`,
        name: brand.name,
        description: brand.tagline,
        url: base,
        sameAs: [brand.instagram],
        address: {
          "@type": "PostalAddress",
          streetAddress: brand.address.lines.join(", "),
          addressLocality: "İstanbul",
          addressCountry: "TR",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        name: `${brand.name} — ${brand.tagline}`,
        url: base,
        publisher: { "@id": `${base}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${base}/urunler?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="hero">
        <div className="lp-container">
          <div className="grid">
            <div>
              <div className="hero-tag">✦ Yeni Sezon Koleksiyonu</div>
              <h1>
                Zarafetin<br />
                <em>Dokunuşu</em>
              </h1>
              <p>
                İpek eşarplar, tasarım çantalar ve özel aksesuarlarla stilinizi tamamlayın. Sepeti kullanın; sipariş ve
                bilgi için iletişim kanallarımızdan bize ulaşın.
              </p>

              <div className="hero-ctas">
                <Link href="/urunler" className="btn primary">
                  Alışverişe Başla →
                </Link>
                <Link href="/#instagram" className="btn ghost" scroll={true}>
                  Instagram&apos;ı Gör
                </Link>
              </div>

              <div className="hero-stats" aria-label="Özet">
                <div className="stat">
                  <strong>500+</strong>
                  <span>Ürün Çeşidi</span>
                </div>
                <div className="stat">
                  <strong>10+</strong>
                  <span>Yıllık Tecrübe</span>
                </div>
                <div className="stat">
                  <strong>5K+</strong>
                  <span>Mutlu Müşteri</span>
                </div>
              </div>
            </div>

            <div className="hero-card" aria-label="Ürün görselleri">
              <div className="hero-media" aria-label="Ürün vitrin görselleri (3 adet)">
                <div className="shot big missing" data-label="Ürün Görseli 1" />
                <div className="shot missing" data-label="Ürün Görseli 2" />
                <div className="shot missing" data-label="Ürün Görseli 3" />
              </div>
              <small>
                Sağ alandaki bu bölüm <b>3 ürün görseli</b> için hazır. Görselleri <b>public/</b> içinde güncelleyin.
              </small>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="urunler">
        <div className="lp-container">
          <div className="section-head">
            <span className="tag">✦ Öne Çıkanlar</span>
            <h2>
              Seçili <em>Ürünler</em>
            </h2>
            <div className="divider" />
          </div>

          <div className="search" aria-label="Arama">
            <form action="/urunler" method="get" style={{ display: "contents" }}>
              <input name="q" type="search" placeholder="Ürün ara (örn: ipek, çanta, bileklik)" autoComplete="off" />
            </form>
            <Link href="/urunler" className="mini">
              Temizle
            </Link>
          </div>

          <div className="catalog-bar" role="tablist" aria-label="Kategori filtreleri">
            <Link href="/urunler" className="chip active" data-cat="all">
              Tümü
            </Link>
            {categories.map((c) => (
              <Link key={c.id} href={`/urunler?cat=${c.slug}`} className="chip" data-cat={c.slug}>
                {c.name}
              </Link>
            ))}
          </div>

          <div className="grid-products" aria-label="Ürün listesi">
            {products.length === 0 ? (
              <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "rgba(168, 90, 90, 0.85)" }}>
                Henüz vitrin ürünü yok. <Link href="/urunler">Tüm ürünler</Link>
              </p>
            ) : (
              products.map((p) => <LegacyProductCard key={p.id} product={p} />)
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: 22 }}>
            <Link href="/urunler" className="pill">
              Tüm ürünleri gör →
            </Link>
          </div>
        </div>
      </section>

      <section className="section white">
        <div className="lp-container">
          <div className="features">
            <div className="feat">
              <div className="i">🚚</div>
              <h4>Hızlı Teslimat</h4>
              <p>Türkiye geneli 1–3 iş günü kargo.</p>
            </div>
            <div className="feat">
              <div className="i">🔒</div>
              <h4>Güvenli alışveriş</h4>
              <p>Kart ve havale gibi ödeme seçenekleri, canlı yayın öncesi son adımda entegre edilecek.</p>
            </div>
            <div className="feat">
              <div className="i">🔄</div>
              <h4>Kolay İade</h4>
              <p>14 gün içinde iade desteği.</p>
            </div>
            <div className="feat">
              <div className="i">💬</div>
              <h4>{waHref ? "WhatsApp Destek" : "Müşteri Desteği"}</h4>
              <p>Hızlı stok, ölçü, renk ve sipariş bilgisi.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="instagram">
        <div className="lp-container">
          <div className="section-head">
            <span className="tag">✦ @laperla_esarp</span>
            <h2>
              Instagram&apos;da <em>Takip Et</em>
            </h2>
            <div className="divider" />
          </div>

          <div className="insta-grid" aria-label="Instagram görsel alanı">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="insta-item">
                📸
              </div>
            ))}
          </div>

          <div className="insta-cta">
            <a className="pill" href={brand.instagram} target="_blank" rel="noreferrer">
              Instagram&apos;a Git
            </a>
          </div>
        </div>
      </section>

      <section className="section white" id="magaza">
        <div className="lp-container">
          <div className="section-head">
            <span className="tag">✦ Mağaza</span>
            <h2>
              Bizi <em>Ziyaret</em> Edin
            </h2>
            <div className="divider" />
          </div>

          <div className="contact">
            <div className="panel">
              <h3>İletişim Bilgileri</h3>
              <div className="rowinfo">
                <div className="dot">📍</div>
                <div>
                  <b>Adres</b>
                  <p>
                    Abdurrahman Gazi Mah.<br />
                    Sevenler Cad. No: 35<br />
                    Sancaktepe / İstanbul
                  </p>
                </div>
              </div>
              <div className="rowinfo">
                <div className="dot">🕐</div>
                <div>
                  <b>Çalışma Saatleri</b>
                  <p>
                    Hafta içi: 09:00–20:00<br />
                    Cumartesi: 09:00–21:00 · Pazar: 11:00–18:00
                  </p>
                </div>
              </div>
              <div className="rowinfo" id="iletisim">
                <div className="dot">📞</div>
                <div>
                  <b>İletişim</b>
                  <p>+90 XXX XXX XX XX</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
                {waHref ? (
                  <a className="pill wa" href={waHref} target="_blank" rel="noreferrer">
                    WhatsApp Destek
                  </a>
                ) : null}
                <a className="pill" href={brand.instagram} target="_blank" rel="noreferrer">
                  Instagram DM
                </a>
              </div>
            </div>

            <div className="panel">
              <h3>Harita</h3>
              <div className="mapbox" id="mapbox">
                <iframe title="La Perla mağaza konumu" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={mapsEmbed} allowFullScreen />
              </div>
              <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a className="mini" href={mapsDirections} target="_blank" rel="noreferrer">
                  Yol Tarifi
                </a>
                <Link className="mini" href="/#iletisim">
                  İletişime Git
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
