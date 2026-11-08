// import { NextResponse } from 'next/server';
// import { getCurrentAdmin } from './session';
// export async function requireAdminResponse(permission?: string) {
//   const admin = await getCurrentAdmin();
//   if (!admin) return { admin: null, response: NextResponse.json({ error: 'غير مصرح. سجل دخول الإدارة أولاً.' }, { status: 401 }) };
//   if (permission && admin.role !== 'owner' && !admin.permissions.includes(permission)) {
//     return { admin, response: NextResponse.json({ error: 'ليس لديك صلاحية لتنفيذ هذا الإجراء.' }, { status: 403 }) };
//   }
//   return { admin, response: null };
// }
import { NextResponse } from 'next/server';
import { getCurrentAdmin } from './session';

export async function requireAdminResponse(permission?: string) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return {
      admin: null,
      response: NextResponse.json(
        { error: 'غير مصرح. سجل دخول الإدارة أولاً.' },
        { status: 401 }
      ),
    };
  }
  return { admin, response: null };
}