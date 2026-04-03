import { FloatWhatsApp } from "@/components/site/FloatWhatsApp";
import SiteFooter from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SkipToContent } from "@/components/site/SkipToContent";

export const dynamic = "force-dynamic";

/** Ortak kabuk; panel koruması (panel)/layout içinde, giriş (auth)/giris’te açık. */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipToContent />
      <SiteHeader />
      <main id="top" className="section white" style={{ paddingTop: 24, paddingBottom: 64 }}>
        <div className="lp-container">{children}</div>
      </main>
      <SiteFooter />
      <FloatWhatsApp />
    </>
  );
}
