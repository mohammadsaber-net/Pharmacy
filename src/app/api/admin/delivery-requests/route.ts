import { NextResponse } from 'next/server';
import { count, desc, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { deliveryRequests } from '@/db/schema';
import { requireAdminResponse } from '@/lib/auth/require-admin';
export const runtime='nodejs';
export async function GET(){const auth=await requireAdminResponse('orders');if(auth.response)return auth.response;const [[total],[pending],latest]=await Promise.all([db.select({value:count()}).from(deliveryRequests),db.select({value:count()}).from(deliveryRequests).where(isNull(deliveryRequests.acknowledgedAt)),db.select().from(deliveryRequests).orderBy(desc(deliveryRequests.createdAt)).limit(30)]);return NextResponse.json({total:Number(total?.value||0),pending:Number(pending?.value||0),latest},{headers:{'Cache-Control':'private,no-store'}});}
export async function PATCH(req:Request){const auth=await requireAdminResponse('orders');if(auth.response)return auth.response;const data=await req.json().catch(()=>null);if(data?.acknowledgeAll!==true)return NextResponse.json({error:'طلب غير صحيح.'},{status:400});await db.update(deliveryRequests).set({acknowledgedAt:new Date()}).where(isNull(deliveryRequests.acknowledgedAt));return NextResponse.json({ok:true});}
