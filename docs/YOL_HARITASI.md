# La Perla — Özel e-ticaret yol haritası (sıralı aşamalar)

## Öncelik politikası

**Ödeme** (iyzico veya seçilen PSP, sandbox → canlı, callback/webhook, gerçek tahsilat) ile **domain ve canlı yayın** (DNS, SSL/TLS, prod ortam değişkenleri, `NEXT_PUBLIC_SITE_URL`, prod veritabanı, hosting seçimi, izleme ve yedekleme) konuları **bilinçli olarak en sona** bırakılır: önce vitrin, kimlik, hesap, sepet/checkout mantığı, operasyon, hukuki metinler ve kalite işleri tamamlanır; **her şey oturduktan sonra** ödeme stack’i ve gerçek domain / prod geçişi yapılır.

Geliştirme süresince `localhost` ve mevcut ödeme sayfası taslağı yeterlidir; canlı ödeme anahtarları ve mağaza domain’i finalize aşamasına kadar ertelenir.

---

## Faz 0 — Proje omurgası
1. Next.js (App Router) + TypeScript + Tailwind kurulumu
2. Repo yapısı: `app/` route grupları, `components/`, `lib/`, `prisma/`
3. Marka tema (renk/font) ve temel layout
4. Postgres + Prisma şema taslağı

## Faz 1 — Katalog (M1)
5. Kategori + ürün + varyant + görsel modelleri (DB)
6. Admin: ürün CRUD, görsel yükleme, stok/fiyat
7. Vitrin: ana sayfa, kategori, ürün detay, arama/filtre
8. SEO: meta, sitemap, ürün schema

## Faz 2 — Kimlik (auth)
9. Kayıt / giriş / çıkış / şifre sıfırlama
10. Google OAuth
11. Rol: `CUSTOMER` | `ADMIN`, korumalı route’lar

## Faz 3 — Müşteri paneli (hesabım)
12. Özet dashboard
13. Profil (ad, telefon, e-posta doğrulama)
14. Adres defteri (varsayılan adres)
15. Siparişlerim (liste + detay + durum zaman çizelgesi)
16. İade talebi (opsiyonel, iş kuralına göre)

## Faz 4 — Sepet ve checkout (M2)
17. Sepet (oturum + DB birleştirme)
18. Checkout: adres, kargo kuralı, sipariş taslağı

## Faz 5 — Ödeme (M3) — **en son (ödeme stack)**
19. iyzico (veya seçilen PSP) sandbox
20. Callback/webhook, idempotency, imza doğrulama
21. Ödeme sonrası stok düşümü ve sipariş durumu

> Bu faz, yukarıdaki **Öncelik politikası** gereği diğer fonksiyonel işler bittikten sonra uygulanır.

## Faz 6 — Operasyon ve bildirim (M4)
22. Admin sipariş yönetimi (durum, kargo takip no)
23. E-posta bildirimleri (sipariş/ödeme/kargo)
24. Kargo kuralları ve ücretsiz kargo eşiği

## Faz 7 — Hukuki ve kalite (M5)
25. KVKK, mesafeli satış, iade politikası, çerez banner
26. Performans: görsel optimizasyon, CDN cache
27. E2E testler, güvenlik gözden geçirme

## Faz 8 — Canlı yayın — **en son (domain & prod)**
28. Prod DB, env, domain/SSL, izleme (Sentry), yedekleme

> Domain, SSL ve prod ortam; ödeme ile birlikte veya hemen sonrasında, **tüm ürün özellikleri hazır olduktan sonra** netleştirilir.

---

**Şu an:** Faz 0–2 tam sayılır; **Faz 3:** özet, profil (+ e-posta doğrulama, `EmailVerificationToken`), adresler, siparişler + durum akışı, **iade talebi** (`ReturnRequest`, `/hesabim/iade-talepleri`). Faz 4 checkout; Faz 6 admin sipariş + müşteri e-postaları + ücretsiz kargo eşiği; Faz 7 çerez + hukuki taslaklar **`SITE_*` / `getBusinessProfile`** ile doldurulabilir. **Ödeme (PSP) ve domain/prod** en sonda. İşletme için: `docs/ISLETME_KONTROL_LISTESI.md`. Sırada: Faz 7 performans/test, admin iade talepleri listesi (isteğe bağlı), Faz 5/8.
