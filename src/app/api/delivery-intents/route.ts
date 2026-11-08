import { NextResponse } from 'next/server';
import { db } from '@/db';
import { deliveryRequests, storeSettings } from '@/db/schema';
export const runtime='nodejs';
export async function POST(){
  const [settings]=await db.select({deliveryEnabled:storeSettings.deliveryEnabled}).from(storeSettings).limit(1);
  await db.insert(deliveryRequests).values({wasEnabled:settings?.deliveryEnabled??false});
  return NextResponse.json({deliveryEnabled:settings?.deliveryEnabled??false});
}
