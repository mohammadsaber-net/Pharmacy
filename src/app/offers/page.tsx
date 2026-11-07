import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { desc, eq, inArray } from 'drizzle-orm';
import { StoreHeader } from '@/components/store/header';import { StoreFooter } from '@/components/store/footer';import { db } from '@/db';import { offers,offerProducts,products,productImages } from '@/db/schema';import { formatEGP } from '@/lib/money';
export const dynamic='force-dynamic';export const metadata:Metadata={title:'عروض صيدليتي',description:'تصفح أحدث عروض وخصومات صيدليتي.'};
export default async function OffersPage(){const rows=await db.select().from(offers).orderBy(desc(offers.createdAt));const links=rows.length?await db.select({offerId:offerProducts.offerId,productId:products.id,name:products.name,slug:products.slug,price:products.price,discount:offerProducts.discountPercent,offerPrice:offerProducts.offerPrice}).from(offerProducts).innerJoin(products,eq(offerProducts.productId,products.id)).where(inArray(offerProducts.offerId,rows.map(r=>r.id))):[];const ids=[...new Set(links.map(x=>x.productId))];const images=ids.length?await db.select({productId:productImages.productId,imageUrl:productImages.imageUrl,isPrimary:productImages.isPrimary}).from(productImages).where(inArray(productImages.productId,ids)):[];const now=new Date();return <>
<StoreHeader/>
<main dir="rtl" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <div className="mb-8 rounded-3xl `bg-gradient-to-l` from-emerald-950 to-teal-700 p-8 text-white">
        <p className="text-sm font-bold text-emerald-100">فرصتك للتوفير</p>
        <h1 className="mt-2 text-3xl font-black">عروض صيدليتي</h1>
        <p className="mt-3 text-emerald-50"
        >العروض الحالية والسابقة في مكان واحد، ويمكنك العودة للعروض التي انتهت.</p>
        </div>{rows.length?<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map(o=>{const items=links.filter(x=>x.offerId===o.id);
            const active=o.isActive&&o.startsAt<=now&&o.endsAt>=now;return <article
             key={o.id} className="overflow-hidden rounded-2xl border border-emerald-200
              bg-white shadow-sm">
                <div className="relative flex h-40 items-center justify-center
                `bg-gradient-to-br` from-emerald-50 to-slate-100">{o.imageUrl?
                <Image src={o.imageUrl} alt={o.title} fill sizes="(max-width: 640px) 
                100vw, 33vw" unoptimized className="object-cover"/>:
                <span className="text-5xl">🎁</span>}
                <span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs 
                font-bold text-white ${active?'bg-rose-600':'bg-slate-500'}`}>
                    {active?'عرض متاح':'عرض سابق'}
                    </span>
                </div>
                <div className="p-5">
                <h2 className="text-lg font-black">{o.title}</h2>{o.description&&<p className="mt-2 text-sm leading-6 text-slate-500">{o.description}</p>}<p className="mt-3 text-xs text-slate-500">{new Date(o.startsAt).toLocaleDateString('ar-EG')} – {new Date(o.endsAt).toLocaleDateString('ar-EG')}</p><div className="mt-4 space-y-2">{items.map(item=>{const img=images.find(i=>i.productId===item.productId&&i.isPrimary)?.imageUrl||images.find(i=>i.productId===item.productId)?.imageUrl;return <Link key={item.productId} href={`/products/${item.slug}`} className="flex items-center gap-3 rounded-xl bg-slate-50 p-2 hover:bg-emerald-50">{img?<Image src={img} alt={item.name} width={48} height={48} className="h-12 w-12 rounded-lg object-contain"/>:<span className="flex h-12 w-12 items-center justify-center rounded-lg bg-white">✚</span>}<span className="min-w-0 flex-1 text-sm font-semibold">{item.name}</span><span className="text-xs font-bold text-emerald-800">{item.offerPrice?formatEGP(item.offerPrice):`خصم ${item.discount??o.discountPercent}%`}</span></Link>})}</div></div></article>})}</div>:<p className="rounded-2xl border border-dashed p-10 text-center text-slate-500">لا توجد عروض حتى الآن.</p>}</main><StoreFooter/></>}
