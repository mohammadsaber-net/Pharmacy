import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth/session';
import { PaymentsManager } from '@/components/admin/payments-manager';
export default async function PaymentsPage(){const admin=await getCurrentAdmin();if(!admin)redirect('/admin/login');if(admin.role!=='owner'&&!admin.permissions.includes('payments'))redirect('/admin/dashboard');return <section className="space-y-5"><div><h1 className="text-2xl font-black">المدفوعات</h1><p className="mt-1 text-sm text-slate-500">راجع إيصالات InstaPay وأكد التحويلات المستلمة.</p></div><PaymentsManager/></section>}
