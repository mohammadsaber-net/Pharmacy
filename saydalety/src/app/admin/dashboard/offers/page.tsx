import type { Metadata } from 'next';
import OffersManager from '@/components/admin/offers-manager';
export const metadata:Metadata={title:'إدارة العروض'};
export default function OffersAdminPage(){return <section className="space-y-5"><div><h1 className="text-2xl font-black">إدارة العروض</h1><p className="mt-1 text-sm text-slate-500">أنشئ عروض المنتجات والمجموعات وتحكم في عرض اليوم.</p></div><OffersManager/></section>}
