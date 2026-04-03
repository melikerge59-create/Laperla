# Supabase ile veritabanı + ürün görseli (Vercel şart değil)

Admin panelinden yüklenen görseller, ortam değişkenleri doluysa **Supabase Storage**’a gider; boşsa yerelde `public/uploads/products` kullanılır. Yerel `npm run dev` ile de çalışır.

---

## 1) Supabase projesi

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project** → bölge + DB şifresi.
2. Proje hazır olunca **Settings → Database**:
   - **Connection string** → Prisma için `DATABASE_URL` (Transaction pooler / URI) ve `DIRECT_URL` (Session veya doğrudan `5432`).  
   - Bunları `.env` / `.env.local` içine yazın; `npx prisma migrate deploy` ve `npm run db:seed` çalıştırın (şema + örnek veri).

---

## 2) Storage bucket (ürün görselleri)

### Yöntem A — SQL Editor (önerilen)

1. Sol menü **SQL Editor** → **New query**.
2. Repodaki dosyanın içeriğini yapıştırın: `supabase/migrations/20260403190000_storage_product_images_bucket.sql`
3. **Run**.

Bu, **`product-images`** adlı **public** bucket’ı oluşturur (max ~5 MB, jpeg/png/webp/gif).

### Yöntem B — Panel

1. **Storage** → **New bucket**  
2. Ad: `product-images`  
3. **Public bucket** işaretli olsun (vitrin ve `next/image` için gerekli).

---

## 3) API anahtarları

**Settings → API**

| Değer | `.env` anahtarı |
|--------|------------------|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `service_role` (gizli) | `SUPABASE_SERVICE_ROLE_KEY` |

- **`service_role`** yalnızca sunucuda (API route’lar). Tarayıcıya, GitHub’a, istemci koduna koymayın.
- İsteğe bağlı: farklı bucket adı kullanıyorsanız `SUPABASE_STORAGE_BUCKET=...`

---

## 4) `.env` örneği (yerel)

```env
# Postgres (Supabase)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Storage (bunlar dolunca admin yükleme Supabase’e gider)
NEXT_PUBLIC_SUPABASE_URL="https://xxxxxxxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
# SUPABASE_STORAGE_BUCKET="product-images"
```

**Önemli:** `NEXT_PUBLIC_SUPABASE_URL` ekledikten veya değiştirdikten sonra **`npm run dev`’i yeniden başlatın** — `next.config.ts` içindeki görsel `remotePatterns` build/dev başlarken okunur.

---

## 5) Doğrulama

1. `npm run dev` → `/admin/giris` ile admin girişi.
2. Ürün düzenle / yeni ürün → **görsel yükle**.
3. Görsel URL’si `https://....supabase.co/storage/v1/object/public/product-images/...` biçiminde olmalı.
4. Vitrinde ürün kartında görsel açılıyorsa tamam.

---

## Sorun giderme

| Sorun | Kontrol |
|--------|---------|
| Yükleme hatası | `SUPABASE_SERVICE_ROLE_KEY` doğru mu; bucket adı `product-images` (veya env ile aynı) mı? |
| `next/image` kırık | `NEXT_PUBLIC_SUPABASE_URL` set + **dev sunucusunu yeniden başlat** |
| DB bağlanmıyor | `DATABASE_URL` / `DIRECT_URL` Supabase ekranındaki string ile birebir; `?pgbouncer=true` pooler için |

---

## Vercel

Canlıya alırken aynı env değişkenlerini hosting paneline kopyalamanız yeterli; şimdilik atlayabilirsiniz.
