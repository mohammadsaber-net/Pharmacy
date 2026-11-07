import { Suspense } from 'react';
import Link from 'next/link';
import { and, desc, eq, gte, inArray, lte } from 'drizzle-orm';
import { StoreHeader } from '@/components/store/header';
import { ProductCard } from '@/components/store/product-card';
import { StoreFooter } from '@/components/store/footer';
import { db } from '@/db';
import { categories, products, productImages, offers, offerProducts } from '@/db/schema';
import { formatEGP } from '@/lib/money';
import { getActiveOfferPrices } from '@/lib/offers';
import { AnimatedHeroTitle } from '@/components/store/AnimatedHeroTitel';
import HeroProductSearch from '@/components/store/hero-product-search';
import { DailyOfferSection } from "@/components/store/daily-offer-section";
export const dynamic = 'force-dynamic';

function CategorySkeleton() {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-2xl bg-slate-100" />)}</div>;
}

function ProductSkeleton() {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="aspect-[4/3] animate-pulse bg-slate-100" /><div className="space-y-3 p-4"><div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" /><div className="h-3 w-full animate-pulse rounded bg-slate-100" /><div className="h-5 w-1/2 animate-pulse rounded bg-slate-100" /></div></div>)}</div>;
}

async function HomeCategories() {
  let categoryRows: (typeof categories.$inferSelect)[] | null = null;
  try {
    categoryRows = await db.select().from(categories).where(eq(categories.isActive, true)).orderBy(categories.sortOrder, categories.name);
  } catch {
    categoryRows = null;
  }
  if (categoryRows === null) return <p className="rounded-2xl bg-white p-6 text-sm text-slate-500">تعذر تحميل التصنيفات حاليًا.</p>;
  return categoryRows.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{categoryRows.map((category) => <Link key={category.id} href={`/products?category=${category.slug}`} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-sm"><span className="text-2xl text-emerald-700">✚</span><h3 className="mt-3 font-bold">{category.name}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{category.description}</p></Link>)}</div> : <p className="rounded-2xl bg-white p-6 text-sm text-slate-500">لا توجد تصنيفات نشطة حاليًا.</p>;
}

async function HomeProducts() {
  let productCards: Array<React.ComponentProps<typeof ProductCard>['product']> | null = null;
  let hasNoProducts = false;
  try {
    const productRows = await db.select({
      id: products.id, name: products.name, scientificName: products.scientificName,
      englishName: products.englishName, slug: products.slug, description: products.description,
      price: products.price, discount: products.discount, quantity: products.quantity,
      unitsPerPack: products.unitsPerPack, unitName: products.unitName,
      requiresPrescription: products.requiresPrescription, categoryName: categories.name,
    }).from(products).leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.isActive, true)).orderBy(desc(products.createdAt)).limit(8);
    const imageRows = productRows.length
      ? await db.select({ id: productImages.id, productId: productImages.productId, imageUrl: productImages.imageUrl, isPrimary: productImages.isPrimary }).from(productImages).where(inArray(productImages.productId, productRows.map((product) => product.id))).orderBy(productImages.sortOrder)
      : [];
    const imagesByProduct = new Map<string, typeof imageRows>();
    for (const image of imageRows) imagesByProduct.set(image.productId, [...(imagesByProduct.get(image.productId) || []), image]);
    const offerPrices = await getActiveOfferPrices(productRows.map((product) => product.id));
    const productsWithImages = productRows.map((product) => {
      const offer = offerPrices.get(product.id);
      const images = imagesByProduct.get(product.id) || [];
      return { ...product, offerPrice: offer?.price || null, offerDiscount: offer?.discount || null, offerTitle: offer?.offerTitle || null, images, imageUrl: images.find((image) => image.isPrimary)?.imageUrl || images[0]?.imageUrl || null };
    });
    productCards = productsWithImages;
    hasNoProducts = productRows.length === 0;
  } catch {
    productCards = null;
  }
  if (productCards === null) return <p className="rounded-2xl bg-white p-6 text-sm text-slate-500">تعذر تحميل المنتجات حاليًا. حاول تحديث الصفحة.</p>;
  return hasNoProducts
    ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><h3 className="font-bold">لسه مفيش منتجات مضافة</h3><p className="mt-2 text-sm text-slate-500">ستظهر المنتجات هنا بعد إضافتها من لوحة إدارة الصيدلية.</p></div>
    : <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">{productCards.map((product) => <ProductCard key={product.id} product={product} />)}</div>;
}


async function HomeDailyOffer() {
  let selectedData: {
    offer: typeof offers.$inferSelect;
    products: {
      productId: string;
      name: string;
      slug: string;
      offerPrice: string | null;
      discount: string | null;
    }[];
  } | null = null;

  let failed = false;

  try {
    const now = new Date();

    const rows = await db
      .select()
      .from(offers)
      .where(
        and(
          eq(offers.isActive, true),
          lte(offers.startsAt, now),
          gte(offers.endsAt, now)
        )
      );

    if (rows.length) {
      const links = await db
        .select({
          offerId: offerProducts.offerId,
          productId: products.id,
          name: products.name,
          slug: products.slug,
          price: products.price,
          productDiscount: products.discount,
          discount: offerProducts.discountPercent,
          offerPrice: offerProducts.offerPrice,
        })
        .from(offerProducts)
        .innerJoin(
          products,
          eq(offerProducts.productId, products.id)
        )
        .where(
          inArray(
            offerProducts.offerId,
            rows.map((r) => r.id)
          )
        );

      const score = (o: typeof rows[number]) =>
        Math.max(
          0,
          ...links
            .filter((x) => x.offerId === o.id)
            .map((x) => {
              const base =
                Number(x.price) *
                (1 - Number(x.productDiscount) / 100);

              const final =
                x.offerPrice == null
                  ? base *
                    (1 - Number(x.discount ?? o.discountPercent) / 100)
                  : Number(x.offerPrice);

              return Number(x.price) > 0
                ? (1 - final / Number(x.price)) * 100
                : 0;
            })
        );

      const todayKey = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Africa/Cairo",
      }).format(now);

      const selected =
        rows.find((o) => o.featuredDate === todayKey) ||
        [...rows].sort((a, b) => score(b) - score(a))[0];

      selectedData = {
        offer: selected,
        products: links.filter(
          (x) => x.offerId === selected.id
        ),
      };
    }
  } catch {
    failed = true;
  }

  if (failed) {
    return <DailyOfferSection status="error" />;
  }

  if (!selectedData) {
    return <DailyOfferSection status="empty" />;
  }

  const { offer, products: selectedLinks } = selectedData;

  return (
    <DailyOfferSection
      status="offer"
      title={offer.title}
      description={offer.description}
      products={selectedLinks.map((item) => {
        const discount =
          item.discount ?? offer.discountPercent;

        return {
          productId: item.productId,
          name: item.name,
          slug: item.slug,
          priceLabel:
            item.offerPrice != null
              ? formatEGP(item.offerPrice)
              : `خصم ${discount}%`,
          discountLabel: `خصم ${discount}%`,
        };
      })}
    />
  );
}

export default function HomePage() {
  return <><StoreHeader />
  <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <section className="overflow-hidden rounded-[2rem] bg-gradient-to-b from-emerald-900 via-emerald-800 to-teal-700 px-6 py-12 text-white sm:px-12 sm:py-16">
      <div className="max-w-2xl">
        <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold"
        >أهلًا بك في صيدلية د/ محمد صابر</span>
        <AnimatedHeroTitle />
        <p className="mt-5 max-w-xl leading-8 text-emerald-50"
        >تصفح المنتجات المتاحة،
         أضف احتياجاتك إلى السلة، وسنراجع طلبك ونتواصل معك لتأكيد التوصيل.
         </p>
          <HeroProductSearch/>
         <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/products" className="rounded-xl bg-white px-6 py-3 font-bold text-emerald-900 hover:bg-emerald-50">تصفح المنتجات
          </Link>
          <Link href="/cart" className="rounded-xl border border-white/50 px-6 py-3 font-bold text-white hover:bg-white/10"
          >عرض السلة</Link>
          </div>
          <p className="mt-6 text-sm text-emerald-100"
          >الدفع نقدًا عند الاستلام · تأكيد التوصيل هاتفيًا
          </p>
          </div>
    </section>
    <Suspense fallback={<div className="mt-10 h-52 animate-pulse rounded-3xl bg-slate-100" />}><HomeDailyOffer /></Suspense>
    <section className="mt-12"><div className="mb-5 flex items-end justify-between gap-3"><div><p className="text-sm font-bold text-emerald-700">تسوق حسب احتياجك</p><h2 className="mt-1 text-2xl font-black">التصنيفات</h2></div><Link href="/products" className="text-sm font-bold text-emerald-700">كل المنتجات ←</Link></div><Suspense fallback={<CategorySkeleton />}><HomeCategories /></Suspense></section>
    <section className="mt-12"><div className="mb-5 flex items-end justify-between"><div><p className="text-sm font-bold text-emerald-700">اختيارات الصيدلية</p><h2 className="mt-1 text-2xl font-black">أحدث المنتجات</h2></div><Link href="/products" className="text-sm font-bold text-emerald-700">عرض الكل ←</Link></div><Suspense fallback={<ProductSkeleton />}><HomeProducts /></Suspense></section>
  </main><StoreFooter />
  </>;
}
