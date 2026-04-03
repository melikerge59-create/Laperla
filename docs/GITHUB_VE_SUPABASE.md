# GitHub ve Supabase kurulumu (La Perla)

Bu projede **uygulama veritabanı şeması Prisma** ile yönetilir (`prisma/migrations`). **Supabase klasöründeki migration** yalnızca **Storage bucket** (`product-images`) içindir.

---

## 1) GitHub’a yükleme

### 1.1 Depoyu başlatma (henüz yoksa)

Proje kökünde:

```bash
git init
git add .
git commit -m "La Perla e-ticaret — ilk commit"
```

### 1.2 GitHub’da boş repo oluşturma

[github.com/new](https://github.com/new) → Repository adı seçin (ör. `la-perla-ecommerce`) → **Public/Private** → **Create repository** (README eklemeden).

### 1.3 Uzak adres ve push

GitHub’ın verdiği URL ile:

```bash
git branch -M main
git remote add origin https://github.com/KULLANICI_ADI/REPO_ADI.git
git push -u origin main
```

SSH kullanıyorsanız `git@github.com:KULLANICI/REPO.git` kullanın.

### 1.4 CI

`.github/workflows/ci.yml` push ve pull request’te **Postgres + migrate + seed + build + lint + Playwright** çalıştırır. Repo GitHub’da olduktan sonra **Actions** sekmesinden durumu izleyebilirsiniz.

---

## 2) Supabase projesi

### 2.1 Yeni proje

[supabase.com/dashboard](https://supabase.com/dashboard) → **New project** → bölge ve güçlü veritabanı şifresi seçin.

### 2.2 Postgres bağlantı dizileri (Prisma / Vercel)

**Settings → Database:**

- **Transaction pooler** (veya “Connection pooling”, port **6543**) → genelde `DATABASE_URL` (URI’de `pgbouncer=true` olabilir).
- **Session mode** veya **doğrudan bağlantı** (port **5432**, host `db.<ref>.supabase.co`) → `DIRECT_URL`.

Her ikisini de `.env` ve Vercel **Environment Variables** içine koyun. Yerel Docker kullanıyorsanız `.env.example`’daki `127.0.0.1` satırları yeterlidir.

### 2.3 Storage bucket (ürün görselleri)

**Yöntem A — SQL Editor (en basit)**  
Dashboard → **SQL Editor** → `supabase/migrations/20260403190000_storage_product_images_bucket.sql` dosyasının içeriğini yapıştırıp **Run**.

**Yöntem B — Supabase CLI**  
Projeyi bağlayıp migration uygulayın (Prisma şeması zaten uygulanmış olmalı):

```bash
npx supabase login
npx supabase link --project-ref <SUPABASE_PROJECT_REF>
npx supabase db push
```

`<SUPABASE_PROJECT_REF>`: proje ayarlarında **Reference ID**.

### 2.4 API anahtarları (Next.js / Vercel)

**Settings → API:**

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **service_role** (gizli) → `SUPABASE_SERVICE_ROLE_KEY` — yalnızca sunucu tarafında; istemciye koymayın.

İsteğe bağlı: `SUPABASE_STORAGE_BUCKET=product-images` (varsayılan zaten bu).

### 2.5 Prisma ile sıra özeti

1. Boş Supabase Postgres üzerinde: `npx prisma migrate deploy` (veya Vercel build içindeki `build:vercel`).
2. Ardından Storage SQL veya `supabase db push` ile bucket.
3. Örnek veri: `npx prisma db seed` (üretimde bir kez, güvenli şifre ile).

---

## 3) Vercel (kısa)

1. [vercel.com](https://vercel.com) → **Import** → GitHub repo.
2. **Environment Variables**: `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`, Google ID’ler, Supabase URL + service role, vb. (tam liste `.env.example`).
3. Deploy; build komutu `vercel.json` ile `npm run build:vercel` (migrate deploy dahil).

---

## Özet tablo

| Ne | Nerede |
|----|--------|
| Uygulama tabloları | Prisma `migrate deploy` |
| Ürün görseli bucket | `supabase/migrations/...storage...sql` veya SQL Editor |
| Kaynak kod | GitHub |
| Canlı build | Vercel + env |
