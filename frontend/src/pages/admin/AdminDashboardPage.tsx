import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { supabaseBrowser } from '../../lib/supabase';

export function AdminDashboardPage() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [email, setEmail] = useState('admin@local.id'); const [password, setPassword] = useState('admin123');
  const [orders, setOrders] = useState<any[]>([]); const [menus, setMenus] = useState<any[]>([]); const [tables, setTables] = useState<any[]>([]); const [report, setReport] = useState<any>(null);

  const auth = { headers: { Authorization: `Bearer ${token}` } };
  const load = async () => {
    const [o, m, t, r] = await Promise.all([
      api.get('/admin/orders', auth), api.get('/management/menus', auth), api.get('/management/tables', auth), api.get('/admin/reports/sales?range=daily', auth)
    ]);
    setOrders(o.data.data ?? []); setMenus(m.data.data ?? []); setTables(t.data.data ?? []); setReport(r.data.data);
  };
  useEffect(() => { if (token) load(); }, [token]);
  useEffect(() => {
    if (!token || !supabaseBrowser) return;
    const channel = supabaseBrowser.channel('admin-orders').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => load()).subscribe();
    return () => { supabaseBrowser.removeChannel(channel); };
  }, [token]);

  const login = async () => { const r = await api.post('/auth/login', { email, password }); localStorage.setItem('token', r.data.data.token); setToken(r.data.data.token); };
  const changeStatus = async (id:string,status:string)=>{ await api.patch(`/admin/orders/${id}/status`,{status},auth); load(); };

  if (!token) return <main className='p-4 max-w-md mx-auto space-y-2'><h1 className='text-2xl font-bold'>Login Admin</h1><input className='border p-2 w-full' value={email} onChange={e=>setEmail(e.target.value)}/><input className='border p-2 w-full' type='password' value={password} onChange={e=>setPassword(e.target.value)}/><button className='bg-blue-600 text-white px-4 py-2 rounded' onClick={login}>Login</button></main>;

  return <main className='p-4 space-y-6'><h1 className='text-2xl font-bold'>Admin Dashboard</h1><div className='rounded bg-white p-3 shadow'>Laporan harian: <b>Rp{Number(report?.total ?? 0).toLocaleString('id-ID')}</b></div>
    <section className='rounded bg-white p-3 shadow'><h2 className='font-semibold'>Semua Pesanan</h2>{orders.map(o=><div className='border-b py-2' key={o.id}>Meja {o.tables?.table_number} - {o.status} <button className='ml-2 text-sm text-blue-700' onClick={()=>changeStatus(o.id,'dimasak')}>Sedang Dimasak</button> <button className='ml-2 text-sm text-green-700' onClick={()=>changeStatus(o.id,'selesai')}>Selesai</button></div>)}</section>
    <section className='rounded bg-white p-3 shadow'><h2 className='font-semibold'>Menu ({menus.length})</h2></section>
    <section className='rounded bg-white p-3 shadow'><h2 className='font-semibold'>Meja ({tables.length})</h2></section>
  </main>;
}
