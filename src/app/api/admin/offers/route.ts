import { NextResponse } from 'next/server';
import { desc, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { offers, offerProducts, products } from '@/db/schema';
import { requireAdminResponse } from '@/lib/auth/require-admin';

export const runtime = 'nodejs';
const offerSchema = z.object({
  title: z.string().trim().min(2).max(220),
  description: z.string().max(4000).optional().nullable(),
  imageUrl: z.string().url().optional().nullable().or(z.literal('')),
  offerType: z.enum(['single', 'group']),
  discountPercent: z.coerce.number().min(0).max(100),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  isActive: z.boolean().default(true),
  isToday: z.boolean().default(false),
  products: z.array(z.object({ productId: z.string().uuid(), discountPercent: z.coerce.number().min(0).max(100).optional().nullable(), offerPrice: z.coerce.number().min(0).optional().nullable() })).min(1),
}).refine((data) => new Date(data.endsAt) >= new Date(data.startsAt), { message: 'تاريخ نهاية العرض يجب أن يكون بعد تاريخ البداية.' }).refine((data) => data.offerType !== 'single' || data.products.length === 1, { message: 'العرض الفردي يجب أن يحتوي على منتج واحد.' });

export async function GET() {
  const auth = await requireAdminResponse(); if (auth.response) return auth.response;
  const rows = await db.select().from(offers).orderBy(desc(offers.updatedAt));
  const links = rows.length ? await db.select({ offerId: offerProducts.offerId, productId: offerProducts.productId, discountPercent: offerProducts.discountPercent, offerPrice: offerProducts.offerPrice, productName: products.name }).from(offerProducts).innerJoin(products, eq(offerProducts.productId, products.id)).where(inArray(offerProducts.offerId, rows.map((row) => row.id))) : [];
  const todayKey = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo' }).format(new Date());
  return NextResponse.json(rows.map((offer) => ({ ...offer, isToday: offer.featuredDate === todayKey, products: links.filter((link) => link.offerId === offer.id) })), { headers: { 'Cache-Control': 'private, no-store' } });
}

export async function POST(request: Request) {
  const auth = await requireAdminResponse(); if (auth.response) return auth.response;
  const parsed = offerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'راجع بيانات العرض والمنتجات والتواريخ.' }, { status: 400 });
  try {
    const data = parsed.data;
    const result = await db.transaction(async (tx) => {
      if (data.isToday) await tx.update(offers).set({ isToday: false, featuredDate: null, updatedAt: new Date() });
      const [created] = await tx.insert(offers).values({ title: data.title, description: data.description || null, imageUrl: data.imageUrl || null, offerType: data.offerType, discountPercent: data.discountPercent.toFixed(2), startsAt: new Date(data.startsAt), endsAt: new Date(data.endsAt), isActive: data.isActive, isToday: data.isToday, featuredDate: data.isToday ? new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo' }).format(new Date()) : null, updatedAt: new Date() }).returning({ id: offers.id });
      await tx.insert(offerProducts).values(data.products.map((item) => ({ offerId: created.id, productId: item.productId, discountPercent: item.discountPercent == null ? null : item.discountPercent.toFixed(2), offerPrice: item.offerPrice == null ? null : item.offerPrice.toFixed(2) })));
      return created.id;
    });
    return NextResponse.json({ id: result }, { status: 201 });
  } catch (error) { console.error('Create offer failed:', error); return NextResponse.json({ error: 'تعذر إنشاء العرض. تأكد من المنتجات المختارة.' }, { status: 409 }); }
}
