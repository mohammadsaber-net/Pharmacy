import { NextResponse } from 'next/server';
import { and, desc, eq, gte, inArray, lte } from 'drizzle-orm';
import { db } from '@/db';
import { offers, offerProducts, products, productImages } from '@/db/schema';
export const dynamic = 'force-dynamic';
export async function GET() {
 const now=new Date();
 const rows=await db.select().from(offers).where(and(eq(offers.isActive,true),lte(offers.startsAt,now),gte(offers.endsAt,now))).orderBy(desc(offers.isToday),desc(offers.discountPercent),desc(offers.updatedAt));
 if(!rows.length)return NextResponse.json({today:null,offers:[]},{headers:{'Cache-Control':'no-store'}});
 const links=await db.select({offerId:offerProducts.offerId,productId:products.id,productName:products.name,slug:products.slug,price:products.price,productDiscount:products.discount,discount:products.discount,overrideDiscount:offerProducts.discountPercent,offerPrice:offerProducts.offerPrice}).from(offerProducts).innerJoin(products,eq(offerProducts.productId,products.id)).where(inArray(offerProducts.offerId,rows.map(r=>r.id)));
 const ids=[...new Set(links.map(l=>l.productId))];const images=ids.length?await db.select({productId:productImages.productId,imageUrl:productImages.imageUrl,isPrimary:productImages.isPrimary}).from(productImages).where(inArray(productImages.productId,ids)):[];
 const mapped=rows.map(offer=>({...offer,products:links.filter(l=>l.offerId===offer.id).map(l=>({...l,imageUrl:images.find(i=>i.productId===l.productId&&i.isPrimary)?.imageUrl||images.find(i=>i.productId===l.productId)?.imageUrl||null}))}));
 const score=(o:typeof mapped[number])=>Math.max(0,...o.products.map(p=>{const base=Number(p.price)*(1-Number(p.discount)/100);const final=p.offerPrice==null?base*(1-Number(p.overrideDiscount??o.discountPercent)/100):Number(p.offerPrice);return Number(p.price)>0?(1-final/Number(p.price))*100:0;}));
 const todayKey=new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Cairo'}).format(now);
 const today=mapped.find(o=>o.featuredDate===todayKey)||[...mapped].sort((a,b)=>score(b)-score(a))[0]||null;
 return NextResponse.json({today,offers:mapped},{headers:{'Cache-Control':'no-store'}});
}
