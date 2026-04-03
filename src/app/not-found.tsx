import type { Metadata } from "next";
import Link from "next/link";
import { CookieConsentBanner } from "@/components/site/CookieConsentBanner";
import { FloatWhatsApp } from "@/components/site/FloatWhatsApp";
import SiteFooter from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SkipToContent } from "@/components/site/SkipToContent";

export const metadata: Metadata = {
  title: "Sayfa bulunamadı",
};

export default async function NotFound() {
  return (
    <>
      <SkipToContent />
      <SiteHeader />
      <main id="top">
        <section className="section white" style={{ paddingTop: 80, paddingBottom: 80, textAlign: "center" }}>
          <div className="lp-container">
            <h1 style={{ margin: 0, fontFamily: "var(--font-display), serif", fontWeight: 400, fontSize: 40 }}>404</h1>
            <p className="m-desc" style={{ marginTop: 16, fontSize: 16 }}>
              Aradığınız sayfa yok veya taşınmış olabilir.
            </p>
            <p style={{ marginTop: 28 }}>
              <Link href="/" className="btn primary" style={{ display: "inline-flex", textDecoration: "none" }}>
                Ana sayfaya dön
              </Link>
            </p>
            <p className="m-desc" style={{ marginTop: 20 }}>
              <Link href="/urunler" style={{ color: "var(--gold)", fontWeight: 600 }}>
                Ürünleri incele
              </Link>
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
      <FloatWhatsApp />
      <CookieConsentBanner />
    </>
  );
}
