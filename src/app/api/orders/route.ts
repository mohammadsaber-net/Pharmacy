import { NextResponse } from 'next/server';
import { z } from 'zod';
import { and, eq, gte, inArray, lte } from 'drizzle-orm';
import { db } from '@/db';
import { inventoryMovements, orderItems, orders, products, offers, offerProducts } from '@/db/schema';

export const runtime = 'nodejs';

const orderSchema = z.object({
  customerName: z.string().trim().min(3).max(160),
  phone: z.string().trim().regex(/^[0-9+()\- ]{10,20}$/),
  address: z.string().trim().min(8).max(1000),
  notes: z.string().trim().max(1000).optional().nullable(),
  items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int().min(1).max(99), unitMode: z.enum(['pack','single']).default('pack') })).min(1).max(30),
});

function moneyFromCents(cents: number) { return (cents / 100).toFixed(2); }
function priceInCents(price: string, discount: string) {
  const baseCents = Math.round(Number(price) * 100);
  const discountBasisPoints = Math.round(Number(discount) * 100);
  return Math.round(baseCents * (10_000 - discountBasisPoints) / 10_000);
}

export async function POST(request: Request) {
  const parsed = orderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'راجع بيانات الطلب ورقم الهاتف والكميات.' }, { status: 400 });

  const requested = parsed.data.items;
  const ids = [...new Set(requested.map((item) => item.productId))];

  try {
    const orderNumber = `SD-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    const result = await db.transaction(async (tx) => {
      const lockedProducts = await tx.select().from(products).where(inArray(products.id, ids)).for('update');
      if (lockedProducts.length !== ids.length) throw new Error('PRODUCT_NOT_FOUND');

      const selected = new Map(lockedProducts.map((product) => [product.id, product]));
      const now = new Date();
      const todayKey = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo' }).format(now);
      const activeOfferRows = await tx.select({ productId: offerProducts.productId, discountPercent: offerProducts.discountPercent, offerPrice: offerProducts.offerPrice, offerDiscount: offers.discountPercent, featuredDate: offers.featuredDate }).from(offerProducts).innerJoin(offers, eq(offerProducts.offerId, offers.id)).where(and(inArray(offerProducts.productId, ids), eq(offers.isActive, true), lte(offers.startsAt, now), gte(offers.endsAt, now)));
      const offerPriceByProduct = new Map<string, number>();
      const manualOfferProducts = new Set<string>();
      for (const row of activeOfferRows) {
        const product = selected.get(row.productId)!;
        const base = Number(product.price) * (1 - Number(product.discount) / 100);
        const discount = Number(row.discountPercent ?? row.offerDiscount);
        const candidate = row.offerPrice == null ? base * (1 - discount / 100) : Number(row.offerPrice);
        if (candidate >= base) continue;
        const isManual = row.featuredDate === todayKey;
        if (isManual && !manualOfferProducts.has(row.productId)) { offerPriceByProduct.set(row.productId, candidate); manualOfferProducts.add(row.productId); }
        else if (!manualOfferProducts.has(row.productId) && candidate < (offerPriceByProduct.get(row.productId) ?? base)) offerPriceByProduct.set(row.productId, candidate);
      }
      let subtotalCents = 0;
      const preparedItems = requested.map((requestItem) => {
        const product = selected.get(requestItem.productId)!;
        if (!product.isActive) throw new Error('PRODUCT_UNAVAILABLE');
        if (product.requiresPrescription) throw new Error('PRESCRIPTION_REQUIRED');
        const stockQuantity = requestItem.quantity * (requestItem.unitMode === 'pack' ? product.unitsPerPack : 1);
        if (product.quantity < stockQuantity) throw new Error(`INSUFFICIENT_STOCK:${product.name}`);
        const effectivePackPrice = offerPriceByProduct.get(product.id);
        const packCents = effectivePackPrice == null ? priceInCents(product.price, product.discount) : Math.round(effectivePackPrice * 100);
        const unitCents = requestItem.unitMode === 'pack' ? packCents : Math.round(packCents / product.unitsPerPack);
        const lineCents = unitCents * requestItem.quantity;
        subtotalCents += lineCents;
        return { product, quantity: requestItem.quantity, stockQuantity, unitName: requestItem.unitMode === 'pack' ? 'علبة' : product.unitName, unitCents, lineCents };
      });
      const stockTotals = new Map<string, number>();
      for (const item of preparedItems) stockTotals.set(item.product.id, (stockTotals.get(item.product.id) ?? 0) + item.stockQuantity);
      for (const [productId, amount] of stockTotals) { const product = selected.get(productId)!; if (product.quantity < amount) throw new Error(`INSUFFICIENT_STOCK:${product.name}`); }

      const [createdOrder] = await tx.insert(orders).values({
        orderNumber,
        customerName: parsed.data.customerName,
        phone: parsed.data.phone,
        address: parsed.data.address,
        notes: parsed.data.notes || null,
        subtotal: moneyFromCents(subtotalCents),
        deliveryFee: '0.00',
        total: moneyFromCents(subtotalCents),
        currency: 'EGP',
        paymentMethod: 'cash_on_delivery',
        paymentStatus: 'unpaid',
        status: 'pending',
      }).returning({ id: orders.id });

      for (const item of preparedItems) {
        await tx.insert(orderItems).values({
          orderId: createdOrder.id,
          productId: item.product.id,
          productName: item.product.name,
          unitPrice: moneyFromCents(item.unitCents),
          quantity: item.quantity,
          unitName: item.unitName,
          stockQuantity: item.stockQuantity,
          lineTotal: moneyFromCents(item.lineCents),
        });
        // Stock is updated once per product below, after all order lines are recorded.

      }
      for (const [productId, amount] of stockTotals) {
        const product = selected.get(productId)!;
        const quantityAfter = product.quantity - amount;
        await tx.update(products).set({ quantity: quantityAfter, updatedAt: new Date() }).where(and(eq(products.id, productId), eq(products.quantity, product.quantity)));
        await tx.insert(inventoryMovements).values({ productId, orderId: createdOrder.id, movementType: 'sale', quantityChange: -amount, quantityAfter, note: `حجز مخزون للطلب ${orderNumber}` });
      }
      return { orderNumber };
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'PRODUCT_NOT_FOUND' || message === 'PRODUCT_UNAVAILABLE') return NextResponse.json({ error: 'أحد المنتجات لم يعد متاحًا. حدّث السلة وحاول مرة أخرى.' }, { status: 409 });
    if (message === 'PRESCRIPTION_REQUIRED') return NextResponse.json({ error: 'يوجد منتج يتطلب مراجعة الصيدلي أو وصفة طبية، ولا يمكن طلبه مباشرة.' }, { status: 400 });
    if (message.startsWith('INSUFFICIENT_STOCK:')) return NextResponse.json({ error: `الكمية المتاحة من ${message.split(':')[1]} غير كافية. حدّث السلة وحاول مرة أخرى.` }, { status: 409 });
    console.error('Order creation failed:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تسجيل الطلب. حاول مرة أخرى أو تواصل مع الصيدلية.' }, { status: 500 });
  }
}
