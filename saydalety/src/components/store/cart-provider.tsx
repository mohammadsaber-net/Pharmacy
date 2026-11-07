'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
export type CartItem = { productId:string; slug:string; name:string; price:number; quantity:number; imageUrl:string|null; requiresPrescription:boolean; unitMode:'pack'|'single'; unitName:string; smallUnitName:string; packName:string; unitsPerPack:number; availableStock:number };
type CartContextValue={items:CartItem[];addItem:(item:Omit<CartItem,'quantity'>)=>void;updateQuantity:(id:string,quantity:number,unitMode?:'pack'|'single')=>void;removeItem:(id:string,unitMode?:'pack'|'single')=>void;changeUnitMode:(id:string,fromMode:'pack'|'single',price:number)=>void;clearCart:()=>void};
const CartContext=createContext<CartContextValue|null>(null);const STORAGE_KEY='saydalety-cart-v2';
export function CartProvider({children}:{children:React.ReactNode}){
 const [items,setItems]=useState<CartItem[]>([]);const [ready,setReady]=useState(false);
 // Hydration restores the browser-only cart after the server-rendered initial state.
 // eslint-disable-next-line react-hooks/set-state-in-effect
 useEffect(()=>{let cancelled=false;try{const saved=localStorage.getItem(STORAGE_KEY);if(saved)setItems(JSON.parse(saved) as CartItem[]);}catch{localStorage.removeItem(STORAGE_KEY);}if(!cancelled)setReady(true);return()=>{cancelled=true;};},[]);
 useEffect(()=>{if(ready)localStorage.setItem(STORAGE_KEY,JSON.stringify(items));},[items,ready]);
 const addItem=useCallback((item:Omit<CartItem,'quantity'>)=>setItems(current=>{const found=current.find(e=>e.productId===item.productId&&e.unitMode===item.unitMode);return found?current.map(e=>e.productId===item.productId&&e.unitMode===item.unitMode?{...e,quantity:e.quantity+1}:e):[...current,{...item,quantity:1}];}),[]);
 const updateQuantity=useCallback((id:string,quantity:number,unitMode:'pack'|'single'='pack')=>setItems(current=>quantity<1?current.filter(i=>!(i.productId===id&&i.unitMode===unitMode)):current.map(i=>i.productId===id&&i.unitMode===unitMode?{...i,quantity:Math.min(quantity,999)}:i)),[]);
 const removeItem=useCallback((id:string,unitMode?:'pack'|'single')=>setItems(current=>current.filter(i=>!(i.productId===id&&(!unitMode||i.unitMode===unitMode)))),[]);
 const changeUnitMode=useCallback((id:string,fromMode:'pack'|'single',price:number)=>setItems(current=>{
  const item=current.find(i=>i.productId===id&&i.unitMode===fromMode);if(!item)return current;
  const toMode=fromMode==='pack'?'single':'pack';
  const others=current.filter(i=>!(i.productId===id&&i.unitMode===fromMode));
  const merge=(list:CartItem[],next:CartItem)=>{const found=list.find(i=>i.productId===id&&i.unitMode===next.unitMode);return found?list.map(i=>i.productId===id&&i.unitMode===next.unitMode?{...i,quantity:i.quantity+next.quantity}:i):[...list,next];};
  if(toMode==='single')return merge(others,{...item,unitMode:'single',unitName:item.smallUnitName,price,quantity:item.quantity*item.unitsPerPack});
  const packs=Math.floor(item.quantity/item.unitsPerPack);const remainder=item.quantity%item.unitsPerPack;if(packs<1)return current;
  const withRemainder=remainder?[...others,{...item,quantity:remainder}]:others;
  return merge(withRemainder,{...item,unitMode:'pack',unitName:item.packName,price,quantity:packs});
 }),[]);
 const clearCart=useCallback(()=>setItems([]),[]);const value=useMemo(()=>({items,addItem,updateQuantity,removeItem,changeUnitMode,clearCart}),[items,addItem,updateQuantity,removeItem,changeUnitMode,clearCart]);
 return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart(){const value=useContext(CartContext);if(!value)throw new Error('useCart must be used inside CartProvider');return value;}
