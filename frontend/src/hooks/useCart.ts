import { create } from 'zustand';
import type { CartItem, MenuItem } from '../types';

type CartState = { items: CartItem[]; add: (menu: MenuItem)=>void; setQty:(id:string,q:number)=>void; setNote:(id:string,n:string)=>void; clear:()=>void };
export const useCart = create<CartState>((set)=>({
  items: [],
  add: (menu) => set((s)=>{ const ex=s.items.find(i=>i.menu.id===menu.id); return { items: ex? s.items.map(i=>i.menu.id===menu.id?{...i,quantity:i.quantity+1}:i): [...s.items,{menu,quantity:1}]}; }),
  setQty: (id,q)=> set((s)=>({items:s.items.map(i=>i.menu.id===id?{...i,quantity:Math.max(1,q)}:i)})),
  setNote: (id,n)=> set((s)=>({items:s.items.map(i=>i.menu.id===id?{...i,note:n}:i)})),
  clear: ()=>set({items:[]})
}));
