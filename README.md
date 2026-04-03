# La Perla — özel e-ticaret (Next.js)

Geliştirme sunucusu:

```bash
cd projects/la-perla-ecommerce
npm run dev
```

Tarayıcı: [http://localhost:3000](http://localhost:3000)

Yol haritası (tüm fazlar): `docs/YOL_HARITASI.md` — **Ödeme ve domain/canlı yayın** kasıtlı olarak en sona bırakılmıştır (dosyadaki «Öncelik politikası»).

İşletme bilgisi ve `.env` kontrol listesi: `docs/ISLETME_KONTROL_LISTESI.md`

**GitHub + Supabase + Vercel:** adım adım `docs/GITHUB_VE_SUPABASE.md`

Veritabanı:

1. İsteğe bağlı yerel Postgres: `docker compose up -d`
2. `.env` içinde `DATABASE_URL` (bkz. `.env.example`).
3. İlk şema: `npx prisma migrate deploy` (veya geliştirmede `npm run db:migrate`)
4. Örnek ürünler: `npm run db:seed`
5. Prisma Studio: `npm run db:studio`

> Yerel `npm` önbellek izni hatası alırsanız: `npm install … --cache .npm-cache` kullanın veya `~/.npm` sahipliğini düzeltin.
