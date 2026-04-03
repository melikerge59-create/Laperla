import Link from "next/link";
import { redirect } from "next/navigation";
import { getOptionalUser } from "@/lib/auth-user";

const nav = [
  { href: "/admin", label: "Özet" },
  { href: "/admin/siparisler", label: "Siparişler" },
  { href: "/admin/iade-talepleri", label: "İade talepleri" },
  { href: "/admin/urunler", label: "Ürünler" },
  { href: "/admin/urunler/yeni", label: "Yeni ürün" },
  { href: "/admin/kategoriler", label: "Kategoriler" },
];

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getOptionalUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/admin/giris");
  }

  return (
    <>
      <div className="panel" style={{ marginBottom: 20, padding: 16 }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <h1 style={{ margin: 0, fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 28 }}>Yönetim paneli</h1>
          <Link href="/" style={{ fontSize: 13, color: "rgba(122, 58, 58, 0.95)" }}>
            Siteye dön
          </Link>
        </div>
        <nav style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              style={{
                fontSize: 13,
                padding: "8px 12px",
                borderRadius: 12,
                border: "1px solid rgba(245, 224, 224, 0.95)",
                color: "rgba(122, 58, 58, 0.95)",
                textDecoration: "none",
              }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </>
  );
}
