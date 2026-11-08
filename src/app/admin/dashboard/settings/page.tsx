import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth/session';
import { StoreSettingsManager } from '@/components/admin/store-settings-manager';
export default async function SettingsPage(){
    const admin=await getCurrentAdmin();
    if(!admin)redirect('/admin/login');
    // if(admin.role!=='owner'&&!admin.permissions.includes('settings'))
    //     redirect('/admin/dashboard');
    return <section className="space-y-5"><div><h1 className="text-2xl font-black">إعدادات التوصيل والدفع</h1><p className="mt-1 text-sm text-slate-500">تحكم في إتاحة التوصيل ورسومه ورقم InstaPay.</p></div><StoreSettingsManager/></section>}
