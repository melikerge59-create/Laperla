import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getOptionalUser } from "@/lib/auth-user";

export const metadata: Metadata = {
  title: "Giriş Yap",
  description: "La Perla hesabınıza giriş yapın.",
};

type Props = {
  searchParams: Promise<{ hesabim?: string; next?: string; sifre?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  const user = await getOptionalUser();
  if (user && (user.role === "CUSTOMER" || user.role === "ADMIN")) {
    const n = sp.next;
    if (n && n.startsWith("/") && !n.startsWith("//")) {
      redirect(n);
    }
    redirect("/hesabim");
  }

  const fromAccount = sp.hesabim === "1";
  const fromReset = sp.sifre === "1";

  return (
    <section className="section white" style={{ paddingTop: 36, paddingBottom: 64 }}>
      <div className="lp-container">
        <div className="panel" style={{ maxWidth: 520, margin: "0 auto" }}>
          <h3 style={{ margin: 0, fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 34 }}>Giriş Yap</h3>
          {fromReset ? (
            <p
              style={{
                margin: "12px 0 0 0",
                padding: "12px 14px",
                borderRadius: 14,
                background: "rgba(224, 242, 224, 0.45)",
                fontSize: 13,
                lineHeight: 1.65,
                color: "rgba(46, 100, 50, 0.95)",
              }}
            >
              Şifreniz güncellendi. Üst menüden <b>Giriş Yap</b> ile yeni şifrenizle oturum açabilirsiniz.
            </p>
          ) : null}
          {fromAccount ? (
            <p
              style={{
                margin: "12px 0 0 0",
                padding: "12px 14px",
                borderRadius: 14,
                background: "rgba(245, 224, 224, 0.35)",
                fontSize: 13,
                lineHeight: 1.65,
                color: "rgba(122, 58, 58, 0.95)",
              }}
            >
              Bu sayfayı korumak için oturum açmanız gerekiyor. Üst menüden <b>Giriş Yap</b> ile giriş yaptıktan sonra adres
              çubuğundaki <b>next</b> parametresiyle belirtilen sayfaya yönlendirilirsiniz.
            </p>
          ) : null}
          <p style={{ margin: "12px 0 0 0", fontSize: 13, lineHeight: 1.65, color: "rgba(168, 90, 90, 0.85)" }}>
            Üst menüden <b>Giriş Yap</b> ile Google veya e‑posta ile giriş kullanın. Hesabınız yoksa{" "}
            <Link href="/kayit" style={{ color: "var(--gold)" }}>
              kayıt olun
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
