import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { storeSettings } from '@/db/schema';
import { requireAdminResponse } from '@/lib/auth/require-admin';
export const runtime='nodejs';
export async function GET(){const auth=await requireAdminResponse('settings');if(auth.response)return auth.response;const [row]=await db.select().from(storeSettings).limit(1);return NextResponse.json(row||{deliveryEnabled:false,instaPayNumber:'',deliveryFee:'0.00'});}
export async function PATCH(req:Request){const auth=await requireAdminResponse('settings');if(auth.response)return auth.response;const parsed=z.object({deliveryEnabled:z.boolean(),instaPayNumber:z.string().trim().max(80),deliveryFee:z.coerce.number().min(0).max(100000)}).safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:'راجع بيانات إعدادات التوصيل والدفع.'},{status:400});const value=parsed.data;await db.insert(storeSettings).values({id:1,deliveryEnabled:value.deliveryEnabled,instaPayNumber:value.instaPayNumber,deliveryFee:value.deliveryFee.toFixed(2),updatedAt:new Date()}).onConflictDoUpdate({target:storeSettings.id,set:{deliveryEnabled:value.deliveryEnabled,instaPayNumber:value.instaPayNumber,deliveryFee:value.deliveryFee.toFixed(2),updatedAt:new Date()}});return NextResponse.json({ok:true});}
