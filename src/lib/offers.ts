import { and, eq, gte, inArray, lte } from 'drizzle-orm';
import { db } from '@/db';
import { offers, offerProducts, products } from '@/db/schema';

export async function getActiveOfferPrices(productIds: string[]) {
  if (!productIds.length) return new Map<string, { price: string; discount: string; offerTitle: string }>();
  const now = new Date();
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo' }).format(now);
  const rows = await db.select({ productId: offerProducts.productId, productPrice: products.price, productDiscount: products.discount, discountPercent: offerProducts.discountPercent, offerPrice: offerProducts.offerPrice, offerDiscount: offers.discountPercent, title: offers.title, featuredDate: offers.featuredDate })
    .from(offerProducts).innerJoin(offers, eq(offerProducts.offerId, offers.id)).innerJoin(products, eq(offerProducts.productId, products.id))
    .where(and(inArray(offerProducts.productId, productIds), eq(offers.isActive, true), lte(offers.startsAt, now), gte(offers.endsAt, now)));
  const result = new Map<string, { price: string; discount: string; offerTitle: string }>();
  for (const row of rows) {
    const discount = Number(row.discountPercent ?? row.offerDiscount);
    const current = result.get(row.productId);
    const basePrice = Number(row.productPrice) * (1 - Number(row.productDiscount) / 100);
    const candidate = row.offerPrice != null ? Number(row.offerPrice) : basePrice * (1 - discount / 100);
    if (candidate >= basePrice) continue;
    const totalDiscount = Number(row.productPrice) > 0 ? (1 - candidate / Number(row.productPrice)) * 100 : 0;
    const currentPrice = current ? Number(current.price) : Number.POSITIVE_INFINITY;
    const effectiveCandidate = candidate;
    const isManual = row.featuredDate === today;
    const currentManual = current?.offerTitle.startsWith('★') ?? false;
    if (isManual && !currentManual || (isManual === currentManual && (effectiveCandidate != null ? effectiveCandidate < currentPrice : discount > Number(current?.discount ?? 0)))) {
      result.set(row.productId, { price: candidate.toFixed(2), discount: totalDiscount.toFixed(2), offerTitle: `${isManual ? '★' : ''}${row.title}` });
    }
  }
  return result;
}
