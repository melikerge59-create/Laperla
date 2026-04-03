import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordClient } from "@/components/site/ResetPasswordClient";

export const metadata: Metadata = {
  title: "Yeni şifre",
  description: "La Perla hesabınız için yeni şifre belirleyin.",
};

function Fallback() {
  return (
    <div className="panel" style={{ maxWidth: 520, margin: "0 auto", padding: 24 }}>
      <p className="m-desc" style={{ margin: 0 }}>
        Yükleniyor…
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <section className="section white" style={{ paddingTop: 36, paddingBottom: 64 }}>
      <div className="lp-container">
        <Suspense fallback={<Fallback />}>
          <ResetPasswordClient />
        </Suspense>
      </div>
    </section>
  );
}
