import type { Metadata } from "next";
import Link from "next/link";
import { getBusinessProfile } from "@/lib/site-business";

export const metadata: Metadata = {
  title: "İade ve değişim",
  description: "İade ve değişim politikası taslağı.",
};

export default async function ReturnPolicyPage() {
  const bp = getBusinessProfile();
  const contactLine = [bp.email && `E-posta: ${bp.email}`, bp.phone && `Tel: ${bp.phone}`].filter(Boolean).join(" · ") || "[SITE_CONTACT_EMAIL ve SITE_PHONE]";

  return (
    <section className="section white" style={{ paddingTop: 36, paddingBottom: 64 }}>
      <div className="lp-container" style={{ maxWidth: 720 }}>
        <h1 style={{ margin: 0, fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 34 }}>İade ve değişim</h1>
        <p className="m-desc" style={{ marginTop: 16, fontSize: 13, lineHeight: 1.7 }}>
          Bu metin yayın öncesi <strong>hukuk ve operasyon ekibiniz</strong> tarafından ürün kategorilerinize (ör. hijyen, kişiselleştirme)
          göre güncellenmelidir. Cayma hakkı istisnaları ve süreler mevzuata uygun netleştirilmelidir.
        </p>
        <div className="panel" style={{ marginTop: 24, padding: 20, fontSize: 14, lineHeight: 1.75 }}>
          <p style={{ margin: "0 0 12px 0" }}>
            <strong>Genel</strong>
            <br />
            Cayma hakkı süresi, iade koşulları (etiket, kullanılmamış ürün) ve kargo masraflarının kim tarafından karşılanacağı [doldurulacak].
          </p>
          <p style={{ margin: "0 0 12px 0" }}>
            <strong>Değişim</strong>
            <br />
            Beden / renk değişimi süreci ve stok durumuna göre kurallar [doldurulacak].
          </p>
          <p style={{ margin: "0 0 12px 0" }}>
            <strong>Hasarlı / eksik gönderim</strong>
            <br />
            Teslimatta hasar bildirimi ve destek kanalları [doldurulacak].
          </p>
          <p style={{ margin: 0 }}>
            <strong>İletişim</strong>
            <br />
            Hesabınızdan sipariş bazında talep oluşturabilirsiniz: <Link href="/hesabim/siparisler">Siparişlerim</Link>. İletişim:{" "}
            {contactLine}
          </p>
        </div>
        <p style={{ marginTop: 24 }}>
          <Link href="/" style={{ color: "var(--gold)", fontWeight: 600 }}>
            Ana sayfa
          </Link>
          {" · "}
          <Link href="/mesafeli-satis" style={{ color: "var(--gold)", fontWeight: 600 }}>
            Mesafeli satış
          </Link>
        </p>
      </div>
    </section>
  );
}
