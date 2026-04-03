# İşletme — sizin doldurmanız gerekenler

Bu liste canlıya çıkmadan veya hukuk danışmanı görüşünden önce tamamlanmalıdır. Teknik taraf `.env` ve aşağıdaki alanlarla bağlanır.

## 1. Ortam değişkenleri (`.env`)

| Değişken | Açıklama |
|----------|-----------|
| `SITE_LEGAL_NAME` | Ticari ünvan / tüzel kişi unvanı (KVKK, mesafeli satış) |
| `SITE_TRADE_NAME` | Marka veya mağaza adı (boşsa “La Perla”) |
| `SITE_ADDRESS` | Adres; satır sonları için gerçek satır sonu veya `\n` kullanın |
| `SITE_PHONE` | Sabit hat veya mağaza telefonu |
| `SITE_CONTACT_EMAIL` | Müşteri ve başvuru e-postası |
| `SITE_MERSIS` | MERSİS numarası veya VKN bilgisi (metin olarak) |
| `NEXT_PUBLIC_WHATSAPP_E164` | WhatsApp: ülke kodu + numara, sadece rakam (örn. `905551234567`) |
| `NEXT_PUBLIC_SITE_URL` | Canlı site adresi (şifre sıfırlama ve e-posta linkleri) |
| `RESEND_API_KEY` | E-posta gönderimi (şifre sıfırlama, sipariş, doğrulama) |
| `MAIL_FROM` | Doğrulanmış gönderici (Resend) |
| `ORDER_NOTIFY_EMAIL` | Yeni sipariş ve iade talebi için mağaza kutusu (BCC / bildirim) |
| `AUTH_SECRET` | En az 16 karakter (üretim zorunlu) |
| `GOOGLE_CLIENT_ID` | Google “Web application” OAuth istemci kimliği (sunucu doğrulama) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Aynı kimlik (tarayıcıda GSI; `GOOGLE_CLIENT_ID` ile birebir aynı olmalı) |

### Google ile giriş — `origin_mismatch` (400)

1. [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials** → ilgili **OAuth 2.0 Client ID** (tür: **Web application**).
2. **Authorized JavaScript origins** listesine, siteyi açtığınız adresi **aynen** yazın: şema (`http` / `https`), host (`localhost` veya `127.0.0.1`), **port** (`:3000` gibi). Sonunda `/` olmasın.
3. Geliştirmede genelde hem `http://localhost:3000` hem `http://127.0.0.1:3000` eklenir; tarayıcıda hangisini kullanıyorsanız o kök listede olmalıdır.
4. Canlı domain için ayrıca `https://www.siteniz.com` (ve gerekirse `https://siteniz.com`) ekleyin.
5. **GSI_LOGGER / popup blocked**: Safari veya eklentiler açılır pencereyi engelliyorsa izin verin; asıl yapılandırma yine **JavaScript origins** ile aynıdır.

## 2. Hukuk ve metin

- **KVKK**, **mesafeli satış**, **iade** sayfaları taslaktır; veri envanterinize ve ürün kategorilerinize göre hukukçu ile kesinleştirin.
- Cayma süresi, istisnalar (hijyen, kişiye özel ürün vb.) ve yetkili merci maddelerini ekleyin.

## 3. Operasyon

- Admin panelinden sipariş **durumu** ve **kargo takip** güncelleyin; müşteriye e-posta gider (`ORDER_NOTIFY_EMAIL` tanımlıysa siz de kopya alırsınız).
- İade talepleri hesaptan düşer; iç süreç (onay/red) için CRM veya e-posta disiplinini netleştirin.

## 4. Son aşamalar (yol haritası)

- Gerçek **ödeme sağlayıcı** (iyzico vb.) ve **domain / SSL / prod veritabanı** bilinçli olarak en sona bırakılmıştır; bkz. `docs/YOL_HARITASI.md`.
