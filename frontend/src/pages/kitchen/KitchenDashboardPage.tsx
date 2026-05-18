import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { supabaseBrowser } from '../../lib/supabase';

export function KitchenDashboardPage() {
  const [token] = useState(localStorage.getItem('token') || '');
  const [orders, setOrders] = useState<any[]>([]);
  const auth = { headers: { Authorization: `Bearer ${token}` } };
  const load = async () => { const r = await api.get('/admin/orders?status=diproses', auth); setOrders(r.data.data ?? []); };
  useEffect(() => { if (token) load(); }, [token]);
  useEffect(() => {
    if (!token || !supabaseBrowser) return;
    const channel = supabaseBrowser.channel('kitchen-orders').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => load()).subscribe();
    return () => { supabaseBrowser.removeChannel(channel); };
  }, [token]);
  const update = async (id:string,status:string)=>{ await api.patch(`/admin/orders/${id}/status`,{status},auth); load(); };
  return <main className='p-4'><h1 className='text-2xl font-bold'>Kitchen Dashboard</h1>{orders.map(o=><div key={o.id} className='my-2 rounded bg-white p-3 shadow'>Meja {o.tables?.table_number} - {o.status}<button className='ml-2 rounded bg-orange-500 px-2 py-1 text-white' onClick={()=>update(o.id,'dimasak')}>Sedang Dimasak</button><button className='ml-2 rounded bg-green-600 px-2 py-1 text-white' onClick={()=>update(o.id,'selesai')}>Selesai</button></div>)}</main>;
}
