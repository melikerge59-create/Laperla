import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/account/ProfileForm";
import { getOptionalUser } from "@/lib/auth-user";

export const metadata: Metadata = {
  title: "Profil",
  description: "Hesap bilgileriniz ve tercihleriniz.",
};

type Props = { searchParams: Promise<{ eposta?: string }> };

export default async function ProfilePage({ searchParams }: Props) {
  const user = await getOptionalUser();
  if (!user || (user.role !== "CUSTOMER" && user.role !== "ADMIN")) {
    redirect("/giris?next=/hesabim/profil");
  }

  const sp = await searchParams;
  const epostaFlash = sp.eposta;

  return (
    <div>
      <h3 style={{ margin: 0, fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 28 }}>Profil</h3>
      <p style={{ margin: "10px 0 0 0", fontSize: 13, lineHeight: 1.65, color: "rgba(168, 90, 90, 0.85)" }}>
        Ad, telefon, e-posta doğrulama ve şifre bilgilerinizi güncelleyin.
      </p>
      {epostaFlash === "ok" ? (
        <div
          style={{
            marginTop: 14,
            padding: "12px 14px",
            borderRadius: 14,
            background: "rgba(224, 242, 224, 0.5)",
            fontSize: 13,
            color: "rgba(46, 100, 50, 0.95)",
          }}
        >
          E-posta adresiniz doğrulandı.
        </div>
      ) : null}
      {epostaFlash === "hata" ? (
        <div
          style={{
            marginTop: 14,
            padding: "12px 14px",
            borderRadius: 14,
            background: "rgba(255, 240, 240, 0.75)",
            fontSize: 13,
            color: "rgba(122, 58, 58, 0.95)",
          }}
        >
          Doğrulama bağlantısı geçersiz veya süresi dolmuş. Yeni bağlantı için aşağıdaki düğmeyi kullanın.
        </div>
      ) : null}
      <div style={{ marginTop: 20 }}>
        <ProfileForm
          initial={{
            email: user.email,
            name: user.name ?? "",
            phone: user.phone ?? "",
          }}
          hasPassword={Boolean(user.passwordHash)}
          emailVerified={Boolean(user.emailVerifiedAt)}
        />
      </div>
    </div>
  );
}
