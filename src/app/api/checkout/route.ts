import { NextResponse } from "next/server";
import { getOptionalUser } from "@/lib/auth-user";
import { prisma } from "@/lib/db";
import { notifyOrderPlacedEmail } from "@/lib/order-emails";
import { rateLimitConsume } from "@/lib/rate-limit";
import { computeShippingCents } from "@/lib/shipping";

type LineIn = { variantId: string; quantity: number };

const CHECKOUT_WINDOW_MS = 60 * 60 * 1000;
const CHECKOUT_MAX_PER_HOUR = 40;

export async function POST(request: Request) {
  const user = await getOptionalUser();
  if (!user) {
    return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  }

  let body: { addressId?: string; lines?: LineIn[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz gövde" }, { status: 400 });
  }
  const addressId = body.addressId;
  const lines = body.lines;
  if (!addressId || typeof addressId !== "string") {
    return NextResponse.json({ error: "Teslimat adresi seçin" }, { status: 400 });
  }
  if (!Array.isArray(lines) || lines.length === 0) {
    return NextResponse.json({ error: "Sepet boş" }, { status: 400 });
  }
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId: user.id },
  });
  if (!address) {
    return NextResponse.json({ error: "Adres bulunamadı" }, { status: 400 });
  }
  const normalized: { variantId: string; quantity: number }[] = [];
  for (const l of lines) {
    if (!l || typeof l.variantId !== "string" || typeof l.quantity !== "number") {
      return NextResponse.json({ error: "Geçersiz satır" }, { status: 400 });
    }
    const q = Math.floor(l.quantity);
    if (q < 1 || q > 999) {
      return NextResponse.json({ error: "Geçersiz adet" }, { status: 400 });
    }
    normalized.push({ variantId: l.variantId, quantity: q });
  }

  const checkoutRl = rateLimitConsume(`checkout:${user.id}`, CHECKOUT_MAX_PER_HOUR, CHECKOUT_WINDOW_MS);
  if (!checkoutRl.ok) {
    return NextResponse.json(
      {
        error: "Çok fazla sipariş denemesi. Lütfen bir süre sonra tekrar deneyin.",
        retryAfterSec: checkoutRl.retryAfterSec,
      },
      { status: 429, headers: { "Retry-After": String(checkoutRl.retryAfterSec) } },
    );
  }

  const addressSnapshot = {
    title: address.title,
    fullName: address.fullName,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2,
    district: address.district,
    city: address.city,
    postalCode: address.postalCode,
  };

  try {
    const order = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderLines: { variantId: string; quantity: number; priceCents: number }[] = [];
      for (const row of normalized) {
        const v = await tx.productVariant.findUnique({
          where: { id: row.variantId },
          include: { product: { select: { active: true } } },
        });
        if (!v || !v.product.active) {
          throw new Error(`UNAVAILABLE:${row.variantId}`);
        }
        if (v.stock < row.quantity) {
          throw new Error(`STOCK:${row.variantId}`);
        }
        subtotal += v.priceCents * row.quantity;
        orderLines.push({
          variantId: v.id,
          quantity: row.quantity,
          priceCents: v.priceCents,
        });
      }
      const shippingCents = computeShippingCents(subtotal);
      const totalCents = subtotal + shippingCents;
      const created = await tx.order.create({
        data: {
          userId: user.id,
          status: "PENDING_PAYMENT",
          totalCents,
          shippingCents,
          addressSnapshot,
          items: {
            create: orderLines.map((ol) => ({
              variantId: ol.variantId,
              quantity: ol.quantity,
              priceCents: ol.priceCents,
            })),
          },
        },
      });
      for (const ol of orderLines) {
        await tx.productVariant.update({
          where: { id: ol.variantId },
          data: { stock: { decrement: ol.quantity } },
        });
      }
      await tx.payment.create({
        data: {
          orderId: created.id,
          provider: "manual",
          status: "pending",
          amountCents: totalCents,
        },
      });
      return created;
    });

    const full = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        user: { select: { email: true, name: true } },
        items: {
          include: {
            variant: { include: { product: { select: { name: true } } } },
          },
        },
      },
    });
    if (full?.user.email) {
      void notifyOrderPlacedEmail({
        customerEmail: full.user.email,
        customerName: full.user.name,
        orderId: full.id,
        status: full.status,
        totalCents: full.totalCents,
        shippingCents: full.shippingCents,
        lines: full.items.map((it) => ({
          productName: it.variant.product.name,
          variantName: it.variant.name,
          quantity: it.quantity,
          lineTotalCents: it.priceCents * it.quantity,
        })),
      });
    }

    return NextResponse.json({ orderId: order.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.startsWith("STOCK:")) {
      return NextResponse.json({ error: "Bir ürün için yeterli stok yok. Sepeti güncelleyin." }, { status: 409 });
    }
    if (msg.startsWith("UNAVAILABLE:")) {
      return NextResponse.json({ error: "Sepetteki bir ürün artık satışta değil." }, { status: 409 });
    }
    throw e;
  }
}
