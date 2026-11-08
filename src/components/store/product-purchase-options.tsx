'use client';
import { useMemo, useState } from 'react';
import { AddToCartButton } from './add-to-cart';
import { formatEGP } from '@/lib/money';

type Props = { productId:string; slug:string; name:string; price:number; imageUrl:string|null; requiresPrescription:boolean; unitsPerPack:number; unitName:string; availableStock:number };
export function ProductPurchaseOptions(p:Props) {
  const [mode,setMode]=useState<'single'|'pack'>('single');
  const packSize=Math.max(1,p.unitsPerPack);
  const available=mode==='single'?p.availableStock>0:p.availableStock>=packSize;
  const price=mode==='single'?p.price/packSize:p.price;
  const label=mode==='single'?p.unitName:'علبة';
  const item=useMemo(()=>({productId:p.productId,slug:p.slug,name:p.name,price,imageUrl:p.imageUrl,requiresPrescription:p.requiresPrescription,unitMode:mode,unitName:label,smallUnitName:p.unitName,packName:'علبة',unitsPerPack:packSize,availableStock:p.availableStock}),[p,mode,price,label,packSize]);
  return <div className="mt-7 space-y-3">
    {packSize>1&&<div className="rounded-2xl bg-slate-50 p-3"><p className="mb-2 text-sm font-bold text-slate-700">اختر وحدة الشراء</p><div className="grid grid-cols-2 gap-2"><button type="button" onClick={()=>setMode('single')} aria-pressed={mode==='single'} className={`rounded-xl border px-3 py-3 text-sm font-bold ${mode==='single'?'border-emerald-700 bg-emerald-50 text-emerald-900':'border-slate-200 bg-white text-slate-600'}`}>{p.unitName} واحدة</button><button type="button" onClick={()=>setMode('pack')} aria-pressed={mode==='pack'} className={`rounded-xl border px-3 py-3 text-sm font-bold ${mode==='pack'?'border-emerald-700 bg-emerald-50 text-emerald-900':'border-slate-200 bg-white text-slate-600'}`}>علبة كاملة ({packSize} {p.unitName})</button></div></div>}
    <div className="flex items-center justify-between"><span className="text-sm text-slate-500">سعر {label}</span><strong className="text-xl text-emerald-800">{formatEGP(price)}</strong></div>
    <AddToCartButton disabled={!available||p.requiresPrescription} item={{...item,unitMode:mode}} />
  </div>;
}
