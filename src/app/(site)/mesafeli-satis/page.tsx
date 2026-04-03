import type { Metadata } from "next";
import Link from "next/link";
import { businessContactBlock, getBusinessProfile } from "@/lib/site-business";

export const metadata: Metadata = {
  title: "Mesafeli satış sözleşmesi",
  description: "Mesafeli satış sözleşmesi taslağı.",
};

export default async function DistanceSalesPage() {
  const bp = getBusinessProfile();
  const seller = businessContactBlock(bp);

  return (
    <section className="section white" style={{ paddingTop: 36, paddingBottom: 64 }}>
      <div className="lp-container" style={{ maxWidth: 720 }}>
        <h1 style={{ margin: 0, fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 34 }}>Mesafeli satış sözleşmesi</h1>
        <p className="m-desc" style={{ marginTop: 16, fontSize: 13, lineHeight: 1.7 }}>
          Bu metin yayın öncesi <strong>hukuk danışmanınız</strong> tarafından gözden geçirilmelidir. Mesafeli Satışlar Yönetmeliği ve
          ilgili mevzuata uygun, sitenize özel maddeler (taraflar, cayma hakkı, iade koşulları, ödeme ve teslimat) eklenmelidir.
        </p>
        <div className="panel" style={{ marginTop: 24, padding: 20, fontSize: 14, lineHeight: 1.75 }}>
          <p style={{ margin: "0 0 12px 0" }}>
            <strong>1. Taraflar</strong>
          </p>
          <p style={{ margin: "0 0 12px 0", whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.65 }}>
            <strong>Satıcı</strong>
            <br />
            {seller}
          </p>
          <p style={{ margin: "0 0 12px 0" }}>
            <strong>Alıcı</strong>
            <br />
            Sipariş sırasında beyan edilen bilgiler.
          </p>
          <p style={{ margin: "0 0 12px 0" }}>
            <strong>2. Konu</strong>
            <br />
            İşbu sözleşme, alıcının elektronik ortamda verdiği siparişe ilişkin hak ve yükümlülükleri düzenler.
          </p>
          <p style={{ margin: "0 0 12px 0" }}>
            <strong>3. Cayma hakkı</strong>
            <br />
            [Süre, istisnalar, iade süreci — hukuk metni ile doldurulacak.]
          </p>
          <p style={{ margin: 0 }}>
            <strong>4. Uyuşmazlık</strong>
            <br />
            [Yetkili mahkeme / Tüketici Hakem Heyeti — hukuk metni ile doldurulacak.]
          </p>
        </div>
        <p style={{ marginTop: 24 }}>
          <Link href="/" style={{ color: "var(--gold)", fontWeight: 600 }}>
            Ana sayfa
          </Link>
        </p>
      </div>
    </section>
  );
}
