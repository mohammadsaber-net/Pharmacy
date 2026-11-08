import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { requireAdminResponse } from '@/lib/auth/require-admin';
export const runtime='nodejs';
export async function GET(){const auth=await requireAdminResponse('payments');if(auth.response)return auth.response;const rows=await db.select({id:orders.id,orderNumber:orders.orderNumber,customerName:orders.customerName,phone:orders.phone,total:orders.total,paymentStatus:orders.paymentStatus,hasReceipt:orders.paymentReceipt,createdAt:orders.createdAt,deliveryType:orders.deliveryType}).from(orders).where(eq(orders.paymentMethod,'instapay')).orderBy(desc(orders.createdAt)).limit(100).then(rows=>rows.map(({hasReceipt,...row})=>({...row,hasReceipt:Boolean(hasReceipt)})));return NextResponse.json(rows,{headers:{'Cache-Control':'private,no-store'}});}
export async function PATCH(req:Request){const auth=await requireAdminResponse('payments');if(auth.response)return auth.response;const parsed=z.object({orderId:z.string().uuid(),paid:z.boolean()}).safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:'بيانات الدفع غير صحيحة.'},{status:400});const result=await db.update(orders).set({paymentStatus:parsed.data.paid?'paid':'unpaid',updatedAt:new Date()}).where(eq(orders.id,parsed.data.orderId)).returning({id:orders.id});return result.length?NextResponse.json({ok:true}):NextResponse.json({error:'الطلب غير موجود.'},{status:404});}
