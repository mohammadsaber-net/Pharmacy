# صيدليتي — Phase 2 + Phase 3

متجر صيدلية عربي RTL مبني باستخدام Next.js App Router وTypeScript وTailwind CSS وDrizzle ORM وNeon PostgreSQL.

## المتطلبات
- Node.js 20.9 أو أحدث
- Neon PostgreSQL

## التشغيل
1. انسخ `.env.example` إلى `.env`.
2. ضع رابط Neon في `DATABASE_URL`.
3. ثبّت الحزم: `npm install`.
4. طبّق المخطط: `npm run db:migrate`.
5. أضف التصنيفات والمنتجات التجريبية: `npm run db:seed`.
6. شغّل: `npm run dev` ثم افتح `http://localhost:3000`.

## وظائف واجهة المتجر
- الصفحة الرئيسية والتصنيفات.
- قائمة المنتجات مع البحث والتصفية حسب التصنيف.
- صفحة تفاصيل المنتج.
- سلة مشتريات محفوظة محليًا في المتصفح.
- إتمام الطلب نقدًا عند الاستلام.
- إنشاء الطلب وتحديث المخزون وحركة المخزون داخل معاملة قاعدة بيانات واحدة.
- التحقق من الكميات والتوفر والسعر من قاعدة البيانات، وليس من بيانات المتصفح.
- منع إتمام الطلب المباشر للمنتجات التي تتطلب وصفة/مراجعة الصيدلي.

## تنبيه حول بيانات Seed
المنتجات الأربعة التي يضيفها `db:seed` بيانات تجريبية بأسماء وأسعار افتراضية لا تمثل مخزونًا أو أسعارًا حقيقية. استبدلها ببيانات الصيدلية المعتمدة قبل النشر، ولا تضف أدوية أو منتجات مقيدة إلا بعد التحقق من المتطلبات القانونية والتنظيمية المصرية.

## ملاحظات تشغيلية
- رسوم التوصيل تُترك صفرًا مبدئيًا وتُؤكد يدويًا مع العميل قبل تجهيز الطلب.
- الدفع الإلكتروني غير مفعّل؛ الطريقة المتاحة هي الدفع نقدًا عند الاستلام.
- صور المنتجات اختيارية حاليًا؛ عند عدم وجود صورة تظهر علامة بديلة.
- إدارة المنتجات ولوحة الإدارة والمصادقة ضمن Phase 4.
- إعداد Cloudinary وWhatsApp ليس مطلوبًا لتشغيل هذه المرحلة.


## Phase 4 — لوحة الإدارة

راجع `PHASE-4-SETUP.md` لإنشاء حساب المدير وتشغيل لوحة التحكم، و`PHASE-4-TESTS.md` لقائمة الاختبارات اليدوية. لا يوجد حساب افتراضي؛ أنشئ الحساب باستخدام متغيرات ADMIN_* ثم احذف كلمة المرور من ملف البيئة.

## Phase 5 — طلبات المنتجات والرسائل والمخزون

- صفحة طلب منتج غير متوفر: `/requests`
- صفحة تواصل العملاء: `/contact`
- إدارة طلبات المنتجات: `/admin/dashboard/requests`
- إدارة رسائل العملاء: `/admin/dashboard/messages`
- إدارة أرصدة وحركات المخزون: `/admin/dashboard/inventory`

لا تتطلب Phase 5 migration جديدة؛ فهي تستخدم الجداول الموجودة في المخطط الحالي. راجع `PHASE-5-TESTS.md` لخطوات الاختبار.

## Phase 6 — الأمان والتصميم وSEO

- تم تحسين لوحة الإدارة بتخطيط جانبي للشاشات الكبيرة وشريط تنقل أفقي للموبايل، مع شاشة دخول بتصميم مستقل.
- أضيفت رؤوس أمان أساسية، و`robots.txt` و`sitemap.xml` وبيانات SEO لصفحات المنتجات.
- أضيفت حماية محاولات تسجيل دخول الإدارة (5 محاولات / 15 دقيقة) باستخدام جدول `admin_login_attempts`.
- استجابات قوائم الإدارة تستخدم `Cache-Control: private, no-store`.
- شغّل `npm run db:migrate` مرة واحدة بعد تحديث النسخة لإضافة جدول محاولات الدخول.
- راجع `PHASE-6-TESTS.md` و`PHASE-6-RELEASE-CHECKLIST.md` قبل النشر.
- اضبط `NEXT_PUBLIC_APP_URL` على عنوان الموقع النهائي، وأضف `AUTH_RATE_LIMIT_SECRET` في بيئة الإنتاج.


### صور المنتجات (Cloudinary)
أضف `CLOUDINARY_CLOUD_NAME` و`CLOUDINARY_API_KEY` و`CLOUDINARY_API_SECRET` إلى `.env` ثم أعد تشغيل المشروع. خطوات الإعداد والاستخدام موجودة في `PHASE-6-SETUP.md`. يدعم رفع JPG/PNG/WEBP/AVIF حتى 5MB من شاشة إدارة المنتجات.

## Phase 6.2 – Storefront and image gallery updates

- Product images are managed as an ordered collection in the existing `product_images` table; no database migration is required.
- Product image uploads accept multiple JPG, PNG, WEBP, or AVIF files (up to 10 images per product, 5 MB per image).
- The admin can retain/remove existing images, add new ones, and choose the primary image.
- Removing an image or hiding a product removes its image record and requests deletion of its Cloudinary asset. If Cloudinary reports a cleanup failure, the API returns a warning for server-log follow-up.
- Product cards use the primary image; product details show a gallery.
- The storefront has a responsive mobile menu, a live cart quantity badge, contact/product-request dialogs, toast notifications, and privacy/terms/policy pages.
- The legal pages are draft copy and must be reviewed for Egyptian legal and pharmacy requirements before production use.
# Pharmacy


## Phase 8 — Delivery, InstaPay, permissions and offer pricing

After deploying this update, apply the new database migration:

```bash
npm run db:migrate
npm run admin:create
```

Run `admin:create` with the existing owner's `ADMIN_EMAIL` and `ADMIN_PASSWORD` values. This promotes that account to the `owner` role. The owner can then create admin accounts and assign granular permissions from **المستخدمون والصلاحيات**.

The owner can enable/disable home delivery, set delivery fees, and configure the InstaPay number from **إعدادات المتجر**. Delivery selections are counted even while delivery is disabled; customers only see the unavailable notice after selecting the delivery option. InstaPay receipts appear under **المدفوعات** for review.

Offer prices are now calculated automatically from the product's current discounted price and the offer percentage, rounded to one decimal place. The optional manual offer-price field has been removed from the admin form.
