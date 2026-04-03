import type { Metadata } from "next";
import { ForgotPasswordClient } from "@/components/site/ForgotPasswordClient";

export const metadata: Metadata = {
  title: "Şifremi unuttum",
  description: "La Perla hesabınız için şifre sıfırlama.",
};

export default function ForgotPasswordPage() {
  return (
    <section className="section white" style={{ paddingTop: 36, paddingBottom: 64 }}>
      <div className="lp-container">
        <ForgotPasswordClient />
      </div>
    </section>
  );
}
