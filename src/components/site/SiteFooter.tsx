import Link from "next/link";
import { brand, brandWhatsAppDigits, isBrandWhatsAppConfigured } from "@/lib/brand";
import { getBusinessProfile } from "@/lib/site-business";

const waHref = isBrandWhatsAppConfigured() ? `https://wa.me/${brandWhatsAppDigits()}` : null;

export default async function SiteFooter() {
  const bp = getBusinessProfile();
  const bizLine = [bp.phone, bp.email].filter(Boolean).join(" · ");

  return (
    <footer>
      <div className="lp-container">
        <div className="foot">
          <div>
            <h4>{brand.name}</h4>
            <p>
              Eşarp, çanta ve aksesuar dünyasında zarafetin adresi. Her üründe kalite ve estetik.
            </p>
            <p className="m-desc" style={{ marginTop: 12, fontSize: 12, lineHeight: 1.55 }}>
              Ödeme sağlayıcı entegrasyonu ve hukuki metinler canlıya çıkmadan önce uzman onayı ile güncellenmelidir.
            </p>
          </div>
          <div>
            <h4>Hızlı Linkler</h4>
            <p>
              <Link href="/#urunler">Ürünler</Link>
            </p>
            <p>
              <Link href="/#instagram">Instagram</Link>
            </p>
            <p>
              <Link href="/#magaza">Mağaza</Link>
            </p>
            <p>
              <Link href="/urunler">Tüm ürünler</Link>
            </p>
            <p>
              <Link href="/kvkk">KVKK</Link>
            </p>
            <p>
              <Link href="/kvkk#cerezler">Çerez bilgisi</Link>
            </p>
            <p>
              <Link href="/mesafeli-satis">Mesafeli satış</Link>
            </p>
            <p>
              <Link href="/iade-ve-degisim">İade ve değişim</Link>
            </p>
          </div>
          <div>
            <h4>İletişim</h4>
            {bizLine ? (
              <p className="m-desc" style={{ fontSize: 13 }}>
                {bizLine}
              </p>
            ) : null}
            {waHref ? (
              <p>
                <a href={waHref} target="_blank" rel="noreferrer">
                  WhatsApp Sipariş
                </a>
              </p>
            ) : null}
            <p>
              <a href={brand.instagram} target="_blank" rel="noreferrer">
                Instagram DM
              </a>
            </p>
          </div>
        </div>

        <div className="copy">
          <span>
            © {new Date().getFullYear()} {brand.name} — Tüm hakları saklıdır
          </span>
          <span>Online satış vitrini</span>
        </div>
      </div>
    </footer>
  );
}
