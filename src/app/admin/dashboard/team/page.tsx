import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth/session';
import { TeamManager } from '@/components/admin/team-manager';
export default async function TeamPage(){const admin=await getCurrentAdmin();
    if(!admin)redirect('/admin/login');
    // if(admin.role!=='owner')redirect('/admin/dashboard');return
     <section className="space-y-5"><div><h1 className="text-2xl font-black">إدارة المستخدمين والصلاحيات</h1><p className="mt-1 text-sm text-slate-500">أضف أدمنز وحدد صلاحية كل حساب بشكل مستقل. حساب المالك يمتلك جميع الصلاحيات.</p></div><TeamManager/></section>}
