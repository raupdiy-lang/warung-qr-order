import { useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api';
import { supabaseBrowser } from '../../lib/supabase';
import { useCart } from '../../hooks/useCart';
import type { MenuItem, TableInfo } from '../../types';

export function CustomerMenuPage() {
  const params = new URLSearchParams(window.location.search);
  const tableNumber = params.get('table');
  const [table, setTable] = useState<TableInfo | null>(null);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('semua');
  const [orders, setOrders] = useState<any[]>([]);
  const { items, add, setQty, setNote, clear } = useCart();

  useEffect(() => { if (tableNumber) api.get(`/public/tables/${tableNumber}`).then(r => setTable(r.data.data)); }, [tableNumber]);
  useEffect(() => { api.get('/public/menus').then(r => setMenus(r.data.data ?? [])); }, []);
  useEffect(() => { if (table?.id) api.get(`/orders/table/${table.id}`).then(r=>setOrders(r.data.data ?? [])); }, [table]);
  useEffect(() => {
    if (!table?.id || !supabaseBrowser) return;
    const channel = supabaseBrowser.channel(`customer-orders-${table.id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `table_id=eq.${table.id}` }, async () => {
      const refreshed = await api.get(`/orders/table/${table.id}`);
      setOrders(refreshed.data.data ?? []);
    }).subscribe();
    return () => { supabaseBrowser.removeChannel(channel); };
  }, [table]);
  const filtered = useMemo(() => menus.filter(m => (category === 'semua' || m.category === category) && m.name.toLowerCase().includes(query.toLowerCase())), [menus, category, query]);

  const checkout = async () => {
    if (!table || items.length === 0) return;
    await api.post('/orders', { table_id: table.id, items: items.map(i => ({ menu_id: i.menu.id, quantity: i.quantity, note: i.note, price: i.menu.price })) });
    clear();
    const refreshed = await api.get(`/orders/table/${table.id}`);
    setOrders(refreshed.data.data ?? []);
  };

  const callWaiter = async () => { if (table) await api.post('/public/call-waiter', { table_id: table.id, note: 'Pelanggan memanggil pelayan' }); };

  return <main className='mx-auto max-w-6xl p-4 space-y-4'>
    <h1 className='text-2xl font-bold'>Menu Meja #{table?.table_number ?? '-'}</h1>
    <div className='flex gap-2'><input className='w-full rounded border p-2' placeholder='Cari menu...' value={query} onChange={e=>setQuery(e.target.value)} /><select className='rounded border p-2' value={category} onChange={e=>setCategory(e.target.value)}><option value='semua'>Semua</option><option value='makanan'>Makanan</option><option value='minuman'>Minuman</option><option value='dessert'>Dessert</option></select></div>
    <section className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>{filtered.map(menu=><article key={menu.id} className='rounded-xl bg-white shadow p-3'><img src={menu.image_url || 'https://picsum.photos/300/200'} className='h-36 w-full rounded object-cover'/><h2 className='mt-2 font-semibold'>{menu.name}</h2><p className='text-sm text-slate-500'>{menu.description}</p><div className='mt-2 flex items-center justify-between'><span className='font-bold'>Rp{Number(menu.price).toLocaleString('id-ID')}</span><button onClick={()=>add(menu)} className='rounded bg-emerald-600 px-3 py-2 text-white'>Tambah</button></div></article>)}</section>
    <section className='rounded bg-white p-3 shadow'><h2 className='font-semibold'>Keranjang</h2>{items.map(i=><div key={i.menu.id} className='py-2 border-b'><div className='flex justify-between'><span>{i.menu.name}</span><input type='number' className='w-16 border rounded' value={i.quantity} onChange={e=>setQty(i.menu.id, Number(e.target.value))}/></div><input className='mt-1 w-full border rounded p-1' placeholder='Catatan (contoh: tidak pedas)' value={i.note ?? ''} onChange={e=>setNote(i.menu.id,e.target.value)}/></div>)}<button onClick={checkout} className='mt-3 rounded bg-blue-600 px-4 py-2 text-white'>Checkout</button> <button onClick={callWaiter} className='mt-3 ml-2 rounded bg-amber-600 px-4 py-2 text-white'>Panggil Pelayan</button></section>
    <section className='rounded bg-white p-3 shadow'><h2 className='font-semibold'>Status Pesanan</h2>{orders.map(o=><div key={o.id} className='border-b py-2'>Order #{o.id.slice(0,6)} - <b>{o.status}</b> - Estimasi {o.estimated_minutes} menit</div>)}</section>
  </main>;
}
