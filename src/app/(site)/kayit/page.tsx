import type { Metadata } from "next";
import { RegisterForm } from "@/components/site/RegisterForm";

export const metadata: Metadata = {
  title: "Kayıt Ol",
  description: "La Perla için yeni hesap oluşturun.",
};

export default function RegisterPage() {
  return (
    <section className="section white" style={{ paddingTop: 36, paddingBottom: 64 }}>
      <div className="lp-container">
        <div className="panel" style={{ maxWidth: 520, margin: "0 auto" }}>
          <div className="m-brand">LA PERLA</div>
          <h3 style={{ margin: "8px 0 0 0", fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 34 }}>
            Kayıt Ol
          </h3>
          <p className="m-desc" style={{ marginTop: 10 }}>
            Demo kayıt: bilgiler sunucuya kaydedilmez; tarayıcıda oturum açılır. Gerçek üyelik için Faz 2’de veritabanı ve doğrulama
            eklenecek.
          </p>
          <RegisterForm />
        </div>
      </div>
    </section>
  );
}
