import type { Metadata } from "next";
import Link from "next/link";
import { SkipToContent } from "@/components/site/SkipToContent";
import { CookieConsentBanner } from "@/components/site/CookieConsentBanner";
import { FloatWhatsApp } from "@/components/site/FloatWhatsApp";
import SiteFooter from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { brand } from "@/lib/brand";
import { getOptionalUser } from "@/lib/auth-user";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hesabım",
  description: "Siparişleriniz, adresleriniz ve profil bilgileriniz.",
};

const links = [
  { href: "/hesabim", label: "Özet" },
  { href: "/hesabim/siparisler", label: "Siparişlerim" },
  { href: "/hesabim/iade-talepleri", label: "İade talepleri" },
  { href: "/hesabim/adresler", label: "Adreslerim" },
  { href: "/hesabim/profil", label: "Profil" },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const accountUser = await getOptionalUser();
  const navLinks =
    accountUser?.role === "ADMIN"
      ? [{ href: "/admin", label: "Yönetim paneli" }, ...links]
      : links;

  return (
    <>
      <SkipToContent />
      <SiteHeader />
      <main id="top" className="section white" style={{ paddingTop: 28, paddingBottom: 64 }}>
        <div className="lp-container">
          <div className="panel" style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
              <div>
                <span
                  style={{
                    display: "block",
                    marginBottom: 10,
                    fontSize: 11,
                    letterSpacing: 3,
                    textTransform: "uppercase",
                    color: "var(--rose-dark)",
                    fontWeight: 300,
                  }}
                >
                  {brand.name}
                </span>
                <h3 style={{ margin: 0, fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 34 }}>Hesabım</h3>
                <p style={{ margin: "10px 0 0 0", fontSize: 13, lineHeight: 1.65, color: "rgba(168, 90, 90, 0.85)" }}>
                  Siparişlerinizi takip edin, adres ve profil bilgilerinizi güncelleyin.
                </p>
              </div>
              <Link href="/" style={{ fontSize: 13, color: "rgba(122, 58, 58, 0.95)" }}>
                ← Siteye dön
              </Link>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 24,
              alignItems: "start",
            }}
          >
            <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  style={{
                    borderRadius: 14,
                    border:
                      l.href === "/admin"
                        ? "1px solid rgba(183, 142, 75, 0.45)"
                        : "1px solid rgba(245, 224, 224, 0.9)",
                    padding: "12px 14px",
                    fontSize: 13,
                    color: l.href === "/admin" ? "rgba(100, 72, 28, 0.98)" : "rgba(122, 58, 58, 0.95)",
                    textDecoration: "none",
                    fontWeight: l.href === "/admin" ? 600 : 400,
                  }}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="panel">{children}</div>
          </div>
        </div>
      </main>
      <SiteFooter />
      <FloatWhatsApp />
      <CookieConsentBanner />
    </>
  );
}
