import { NextResponse } from 'next/server';
import { db } from '@/db';
import { storeSettings } from '@/db/schema';
export const runtime='nodejs';
export async function GET(){
  const [settings]=await db.select({deliveryEnabled:storeSettings.deliveryEnabled,instaPayNumber:storeSettings.instaPayNumber,deliveryFee:storeSettings.deliveryFee}).from(storeSettings).limit(1);
  return NextResponse.json(settings||{deliveryEnabled:false,instaPayNumber:'',deliveryFee:'0.00'},{headers:{'Cache-Control':'no-store'}});
}
