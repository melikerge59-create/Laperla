import { existsSync } from "node:fs";
import path from "node:path";
import { config as loadEnv } from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

/**
 * Prisma CLI alt süreçte eski ADMIN_* değerlerini miras bırakabilir; dotenv varsayılan override=false.
 * .env dosyası her zaman baskın olmalı (şifre değişince seed doğru hash üretsin).
 */
function loadProjectEnv() {
  const dirs = [process.cwd(), path.resolve(process.cwd(), "..")];
  for (const dir of dirs) {
    const envFile = path.join(dir, ".env");
    const localFile = path.join(dir, ".env.local");
    if (existsSync(envFile)) loadEnv({ path: envFile, override: true });
    if (existsSync(localFile)) loadEnv({ path: localFile, override: true });
    if (existsSync(envFile) || existsSync(localFile)) return;
  }
}
loadProjectEnv();

const prisma = new PrismaClient();

/** Fiyatlar TL kuruşu (örn. 890 TL → 89000) */
function lira(whole: number) {
  return whole * 100;
}

async function main() {
  const cats = await Promise.all([
    prisma.category.upsert({
      where: { slug: "esarp" },
      create: { slug: "esarp", name: "Eşarp" },
      update: {},
    }),
    prisma.category.upsert({
      where: { slug: "canta" },
      create: { slug: "canta", name: "Çanta" },
      update: {},
    }),
    prisma.category.upsert({
      where: { slug: "taki" },
      create: { slug: "taki", name: "Takı" },
      update: {},
    }),
    prisma.category.upsert({
      where: { slug: "aksesuar" },
      create: { slug: "aksesuar", name: "Aksesuar" },
      update: {},
    }),
  ]);
  const bySlug = Object.fromEntries(cats.map((c) => [c.slug, c]));

  const items: Array<{
    slug: string;
    name: string;
    description: string;
    cat: keyof typeof bySlug;
    sku: string;
    priceLira: number;
    stock: number;
    label: string;
  }> = [
    {
      slug: "mihrie-desenli-ipek-esarp",
      name: "Desenli İpek Eşarp",
      description: "Doğal ipek, 90×90 cm. Mihrie.",
      cat: "esarp",
      sku: "LP-ES-001",
      priceLira: 890,
      stock: 12,
      label: "Standart",
    },
    {
      slug: "coach-signature-tote",
      name: "Signature Tote",
      description: "Büyük boy, siyah monogram. Coach.",
      cat: "canta",
      sku: "LP-CA-002",
      priceLira: 4500,
      stock: 3,
      label: "Tek beden",
    },
    {
      slug: "pashmina-buyuk-sal",
      name: "Pashmina Büyük Şal",
      description: "70×180 cm, yumuşak dokulu.",
      cat: "esarp",
      sku: "LP-ES-003",
      priceLira: 650,
      stock: 20,
      label: "Standart",
    },
    {
      slug: "altin-bileklik-seti",
      name: "Altın Bileklik Seti",
      description: "5’li set, altın kaplama.",
      cat: "taki",
      sku: "LP-TK-004",
      priceLira: 380,
      stock: 30,
      label: "Set",
    },
    {
      slug: "guess-logo-omuz",
      name: "Logo Omuz Çantası",
      description: "Orta boy, monogram, gri.",
      cat: "canta",
      sku: "LP-CA-005",
      priceLira: 3200,
      stock: 4,
      label: "Tek beden",
    },
    {
      slug: "mihrice-cicekli-ipek-esarp",
      name: "Çiçekli İpek Eşarp",
      description: "90×90 cm, pembe tonlar. Mihrie.",
      cat: "esarp",
      sku: "LP-ES-006",
      priceLira: 950,
      stock: 8,
      label: "Standart",
    },
    {
      slug: "fiyonk-lu-sapka",
      name: "Fiyonklu Şapka",
      description: "Bej, kadife kurdele.",
      cat: "aksesuar",
      sku: "LP-AK-007",
      priceLira: 420,
      stock: 15,
      label: "Tek beden",
    },
    {
      slug: "calvin-klein-logo-cuzdan",
      name: "Logo Deri Cüzdan",
      description: "Siyah deri, CK logo.",
      cat: "canta",
      sku: "LP-CA-008",
      priceLira: 1800,
      stock: 6,
      label: "Tek beden",
    },
  ];

  for (const row of items) {
    const categoryId = bySlug[row.cat].id;
    const product = await prisma.product.upsert({
      where: { slug: row.slug },
      create: {
        slug: row.slug,
        name: row.name,
        description: row.description,
        active: true,
        categoryId,
      },
      update: {
        name: row.name,
        description: row.description,
        categoryId,
        active: true,
      },
    });

    const variant = await prisma.productVariant.upsert({
      where: { sku: row.sku },
      create: {
        productId: product.id,
        sku: row.sku,
        name: row.label,
        priceCents: lira(row.priceLira),
        stock: row.stock,
      },
      update: {
        name: row.label,
        priceCents: lira(row.priceLira),
        stock: row.stock,
      },
    });

    const placeholderUrl = `/api/placeholder/product/${product.slug}`;
    const extraThumbUrl = `/api/placeholder/product/${product.slug}?thumb=1`;
    const existing = await prisma.productImage.findFirst({
      where: { productId: product.id, sortOrder: 0 },
    });
    if (!existing) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          variantId: variant.id,
          url: placeholderUrl,
          sortOrder: 0,
        },
      });
    }
    // İlk üç üründe galeri (çoklu küçük görsel) demoları
    if (items.indexOf(row) < 3) {
      const second = await prisma.productImage.findFirst({
        where: { productId: product.id, sortOrder: 1 },
      });
      if (!second) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            variantId: variant.id,
            url: extraThumbUrl,
            sortOrder: 1,
          },
        });
      }
    }
  }

  const adminEmail = (process.env.ADMIN_SEED_EMAIL ?? "admin@laperla.local").trim();
  const adminPass = process.env.ADMIN_SEED_PASSWORD ?? "AdminLaPerla123!";
  const passwordHash = await bcrypt.hash(adminPass, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      name: "Yönetici",
      role: "ADMIN",
      passwordHash,
      emailVerifiedAt: new Date(),
    },
    update: {
      role: "ADMIN",
      passwordHash,
      emailVerifiedAt: new Date(),
    },
  });

  console.log("Seed tamam:", items.length, "ürün.");
  console.log("Yönetici:", adminEmail, "— Giriş: /admin/giris (şifre .env → ADMIN_SEED_PASSWORD)");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
