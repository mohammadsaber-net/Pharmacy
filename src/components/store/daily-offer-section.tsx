
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgePercent,
  CalendarDays,
  Gift,
  Sparkles,
  Tag,
} from "lucide-react";

type DailyOfferProduct = {
  productId: string;
  name: string;
  slug: string;
  priceLabel: string;
  discountLabel: string;
};

type DailyOfferSectionProps =
  | { status: "error" }
  | { status: "empty" }
  | {
      status: "offer";
      title: string;
      description?: string | null;
      products: DailyOfferProduct[];
    };

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 25,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

export function DailyOfferSection(props: DailyOfferSectionProps) {
  // حالة الخطأ
  if (props.status === "error") {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-10 `rounded-[2rem]` bg-slate-50 p-8 text-center sm:p-12"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200 text-slate-500">
          <Gift size={30} />
        </div>

        <h2 className="mt-5 text-xl font-black text-slate-800">
          تعذر تحميل العروض حاليًا
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          حاول تحديث الصفحة مرة أخرى.
        </p>

        <Link
          href="/offers"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
        >
          تصفح العروض
          <ArrowLeft size={17} />
        </Link>
      </motion.section>
    );
  }

  // حالة عدم وجود عروض
  if (props.status === "empty") {
    return (
      <motion.section
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative mt-10 overflow-hidden `rounded-[2rem]` `bg-gradient-to-bl` from-emerald-50 via-white to-amber-50 px-6 py-10 text-center sm:px-10 sm:py-14"
      >
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-amber-200/30 blur-3xl" />

        <motion.div
          initial={{ scale: 0.6, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 180, delay: 0.2 }}
          className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-emerald-700 shadow-lg shadow-emerald-900/5"
        >
          <Gift size={36} strokeWidth={1.7} />
        </motion.div>

        <div className="relative mt-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-xs font-bold text-emerald-800">
            <Sparkles size={15} />
            عروض صيدليتي
          </span>

          <h2 className="mt-4 text-2xl font-black text-slate-900 sm:text-3xl">
            لا توجد عروض اليوم
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-600 sm:text-base">
            نعمل دائمًا على توفير أفضل العروض والخصومات.
            تصفح صفحة العروض لمعرفة الخصومات المتاحة.
          </p>

          <Link
            href="/offers"
            className="mt-7 inline-flex items-center gap-3 rounded-2xl bg-emerald-700 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition hover:-translate-y-1 hover:bg-emerald-800"
          >
            اكتشف جميع العروض
            <ArrowLeft size={18} />
          </Link>
        </div>
      </motion.section>
    );
  }

  // حالة وجود عرض بدون منتجات
  if (!props.products.length) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-10 `rounded-[2rem]` `bg-gradient-to-l` from-emerald-50 to-white p-8 text-center"
      >
        <Gift className="mx-auto text-emerald-700" size={38} />

        <h2 className="mt-4 text-xl font-black text-slate-900">
          {props.title}
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          لا توجد منتجات متاحة ضمن هذا العرض حاليًا.
        </p>

        <Link
          href="/offers"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white"
        >
          جميع العروض
          <ArrowLeft size={17} />
        </Link>
      </motion.section>
    );
  }

  // حالة وجود عرض ومنتجات
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: "easeOut" }}
      className="relative mt-10 overflow-hidden `rounded-[2rem]` `bg-gradient-to-br` from-gray-100 via-white to-gray-100 p-3 shadow-xl shadow-emerald-950/10 sm:p-6 lg:p-8"
    >
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-teal-300/10 blur-3xl" />

      <div className="relative">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
        >
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-xs font-bold text-emerald-950">
              <Sparkles size={15} />
              اختيار الصيدلية اليوم
            </div>

            <h2 className="mt-2 text-2xl font-black leading-tight text-emerald-900 sm:text-3xl lg:text-4xl">
              {props.title}
            </h2>

            {props.description && (
              <p className="mt-2 max-w-xl text-sm leading-7 text-emerald-100/80 sm:text-base">
                {props.description}
              </p>
            )}
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="flex w-fit shrink-0 items-center gap-2 rounded-2xl bg-amber-400 px-3 py-1.5 font-black text-emerald-950 shadow-lg shadow-black/10">
              <BadgePercent size={22} />
              عرض اليوم
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {props.products.map((item:any) => (
            <motion.div
              key={item.productId}
              variants={itemVariants}
              whileHover={{ y: -6, scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href={`/products/${item.slug}`}
                className="group block h-full overflow-hidden rounded-2xl bg-white p-3 shadow-lg shadow-black/5 transition hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-100">
                    <Tag size={23} />
                  </div>

                  <span className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-600">
                    {item.discountLabel}
                  </span>
                </div>

                <h3 className="mt-3 line-clamp-2 min-h-12 text-base font-black leading-6 text-slate-900 transition group-hover:text-emerald-700">
                  {item.name}
                </h3>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      سعر العرض
                    </p>

                    <p className="mt-1 text-lg font-black text-emerald-700">
                      {item.priceLabel}
                    </p>
                  </div>

                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-700 group-hover:text-white">
                    <ArrowLeft size={19} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row"
        >
          <p className="flex items-center gap-2 text-xs text-emerald-100/70">
            <CalendarDays size={16} />
            عروض مميزة من صيدليتي
          </p>

          <Link
            href="/offers"
            className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-emerald-900 transition hover:-translate-y-0.5 hover:bg-emerald-50 sm:w-auto"
          >
            تصفح جميع العروض
            <ArrowLeft size={18} />
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
}
