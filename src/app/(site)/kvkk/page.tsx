import type { Metadata } from "next";
import Link from "next/link";
import { businessContactBlock, getBusinessProfile } from "@/lib/site-business";

export const metadata: Metadata = {
  title: "KVKK aydınlatma metni",
  description: "Kişisel verilerin korunması aydınlatma metni taslağı.",
};

export default async function KvkkPage() {
  const bp = getBusinessProfile();
  const contact = businessContactBlock(bp);

  return (
    <section className="section white" style={{ paddingTop: 36, paddingBottom: 64 }}>
      <div className="lp-container" style={{ maxWidth: 720 }}>
        <h1 style={{ margin: 0, fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 34 }}>KVKK aydınlatma metni</h1>
        <p className="m-desc" style={{ marginTop: 16, fontSize: 13, lineHeight: 1.7 }}>
          6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında veri sorumlusu sıfatıyla hazırlanacak resmi aydınlatma metni,{" "}
          <strong>veri envanteri ve hukuk danışmanlığı</strong> ile tamamlanmalıdır. Aşağıdaki bölümler yer tutucudur.
        </p>
        <div className="panel" style={{ marginTop: 24, padding: 20, fontSize: 14, lineHeight: 1.75 }}>
          <p style={{ margin: "0 0 12px 0" }}>
            <strong>Veri sorumlusu (taslak — .env ile güncelleyin)</strong>
          </p>
          <p style={{ margin: "0 0 12px 0", whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.65 }}>{contact}</p>
          <p className="m-desc" style={{ margin: "0 0 12px 0", fontSize: 12 }}>
            Başvuru: {bp.email || "[SITE_CONTACT_EMAIL]"} {bp.phone ? `· ${bp.phone}` : ""}
          </p>
          <p style={{ margin: "0 0 12px 0" }}>
            <strong>İşlenen veriler</strong>
            <br />
            Kimlik, iletişim, sipariş ve ödeme ile ilgili veriler; çerez ve kullanım verileri (politikanıza göre).
          </p>
          <p style={{ margin: "0 0 12px 0" }}>
            <strong>Amaç ve hukuki sebep</strong>
            <br />
            Siparişin yerine getirilmesi, müşteri desteği, yasal yükümlülükler.
          </p>
          <p style={{ margin: 0 }}>
            <strong>Haklarınız</strong>
            <br />
            KVKK md. 11 kapsamındaki talepler için başvuru kanalları [doldurulacak].
          </p>
        </div>

        <h2 id="cerezler" style={{ marginTop: 36, scrollMarginTop: 24, fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 26 }}>
          Çerezler
        </h2>
        <div className="panel" style={{ marginTop: 16, padding: 20, fontSize: 14, lineHeight: 1.75 }}>
          <p style={{ margin: "0 0 12px 0" }}>
            <strong>Zorunlu çerezler</strong>
            <br />
            Oturum, sepet ve güvenlik (ör. giriş durumu) için teknik olarak gerekli çerezler; site işleyişi için kullanılır.
          </p>
          <p style={{ margin: "0 0 12px 0" }}>
            <strong>Tercihe bağlı çerezler</strong>
            <br />
            Analiz veya pazarlama çerezleri yalnızca açık rızanızla etkinleştirilecektir. Şu an vitrin aşamasında bu tür çerezler için net
            liste ve süreler [politikanız ve araç seçiminize göre] tamamlanmalıdır.
          </p>
          <p style={{ margin: 0 }}>
            Site altındaki çerez bildiriminden &quot;Yalnızca zorunlu&quot; veya &quot;Tümünü kabul et&quot; seçiminiz tarayıcınızda yerel olarak
            saklanır; tercihi sıfırlamak için site verilerinizi temizleyebilirsiniz.
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
