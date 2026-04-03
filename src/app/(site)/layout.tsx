import { CookieConsentBanner } from "@/components/site/CookieConsentBanner";
import { FloatWhatsApp } from "@/components/site/FloatWhatsApp";
import SiteFooter from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SkipToContent } from "@/components/site/SkipToContent";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipToContent />
      <SiteHeader />
      <main id="top">{children}</main>
      <SiteFooter />
      <FloatWhatsApp />
      <CookieConsentBanner />
    </>
  );
}
