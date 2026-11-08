import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { requireAdminResponse } from '@/lib/auth/require-admin';
export const runtime='nodejs';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
  const auth=await requireAdminResponse('payments');if(auth.response)return auth.response;
  const {id}=await params;const [row]=await db.select({receipt:orders.paymentReceipt}).from(orders).where(eq(orders.id,id)).limit(1);
  const match=row?.receipt?.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/);
  if(!match)return NextResponse.json({error:'الإيصال غير موجود.'},{status:404});
  const type=match[1]==='jpeg'?'image/jpeg':`image/${match[1]}`;
  return new NextResponse(Buffer.from(match[2],'base64'),{headers:{'Content-Type':type,'Cache-Control':'private,no-store','Content-Disposition':'inline'}});
}
