import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getCurrentAdmin } from '@/lib/auth/session';
import AdminLogout from '@/components/admin/logout';
import { DeliveryRequestAlerts } from '@/components/admin/delivery-request-alerts';

export const metadata: Metadata = {
  title: { default: 'لوحة الإدارة | صيدليتي', template: '%s | إدارة صيدليتي' },
  robots: { index: false, follow: false, nocache: true },
};

const navigation = [
  { href: '/admin/dashboard', label: 'الرئيسية', icon: '⌂' },
  { href: '/admin/dashboard/products', label: 'المنتجات', icon: '▦', permission: 'products' },
  { href: '/admin/dashboard/offers', label: 'العروض', icon: '％', permission: 'offers' },
  { href: '/admin/dashboard/categories', label: 'التصنيفات', icon: '◇', permission: 'categories' },
  { href: '/admin/dashboard/orders', label: 'الطلبات', icon: '▤', permission: 'orders' },
  { href: '/admin/dashboard/inventory', label: 'المخزون', icon: '▥', permission: 'inventory' },
  { href: '/admin/dashboard/requests', label: 'طلبات المنتجات', icon: '＋', permission: 'requests' },
  { href: '/admin/dashboard/messages', label: 'رسائل العملاء', icon: '✉', permission: 'messages' },
  { href: '/admin/dashboard/payments', label: 'المدفوعات', icon: 'ج', permission: 'payments' },
  { href: '/admin/dashboard/settings', label: 'إعدادات المتجر', icon: '⚙', permission: 'settings' },
  { href: '/admin/dashboard/team', label: 'المستخدمون والصلاحيات', icon: '♙', ownerOnly: true },
];

export default async function AdminDashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');

  const visibleNavigation = navigation.filter((item) => (!('ownerOnly' in item) || !item.ownerOnly || admin.role === 'owner') && (!('permission' in item) || admin.role === 'owner' || admin.permissions.includes(item.permission!)));

  return (
    <div className="admin-app" dir="rtl">
      <aside className="admin-sidebar">
        <Link href="/admin/dashboard" className="admin-brand">
          <span className="admin-brand-mark">ص</span>
          <span><strong>صيدليتي</strong><small>لوحة إدارة الصيدلية</small></span>
        </Link>
        <div className="admin-nav-label">القائمة الرئيسية</div>
        <nav className="admin-nav" aria-label="القائمة الرئيسية">
          {visibleNavigation.map((item) => (
            <Link href={item.href} key={item.href} className="admin-nav-link">
              <span className="admin-nav-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-footer"><span className="admin-status-dot" /><span>النظام يعمل</span></div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-title"><span className="admin-topbar-eyebrow">مساحة العمل</span><strong>إدارة صيدليتي</strong></div>
          <div className="admin-user">
            <span className="admin-avatar">{admin.fullName.trim().charAt(0) || 'م'}</span>
            <span className="admin-user-details"><strong>{admin.fullName}</strong><small>{admin.role === 'owner' ? 'مالك النظام' : 'أدمن'}</small></span>
            <AdminLogout />
          </div>
        </header>
        <div className="bg-white">

        <nav className="admin-mobile-nav" aria-label="التنقل السريع">
          {visibleNavigation.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}
        </nav>
        </div>
        <DeliveryRequestAlerts />
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
