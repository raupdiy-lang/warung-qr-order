import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin } from '../../middleware/auth.js';
import { supabase } from '../../supabase/client.js';
import { fail, ok } from '../../utils/response.js';

export const adminRouter = Router();
adminRouter.use(requireAdmin);

adminRouter.get('/orders', async (req, res) => {
  const status = String(req.query.status ?? '');
  let query = supabase.from('orders').select('*, tables(table_number), order_items(*, menu_items(name))').order('created_at', { ascending: false });
  if (status && status !== 'semua') query = query.eq('status', status);
  const result = await query;
  if (result.error) return fail(res, result.error.message, 500);
  return ok(res, result.data);
});

adminRouter.patch('/orders/:id/status', async (req, res) => {
  const parsed = z.object({ status: z.enum(['menunggu', 'diproses', 'dimasak', 'selesai']), estimated_minutes: z.number().optional() }).safeParse(req.body);
  if (!parsed.success) return fail(res, 'Status tidak valid');
  const result = await supabase.from('orders').update(parsed.data).eq('id', req.params.id).select('*').single();
  if (result.error) return fail(res, result.error.message, 500);
  return ok(res, result.data);
});

adminRouter.get('/reports/sales', async (req, res) => {
  const range = String(req.query.range ?? 'daily');
  const sinceDays = range === 'monthly' ? 30 : range === 'weekly' ? 7 : 1;
  const since = new Date(Date.now() - sinceDays * 86400000).toISOString();
  const result = await supabase.from('order_items').select('price, quantity, orders!inner(created_at,status)').gte('orders.created_at', since).eq('orders.status', 'selesai');
  if (result.error) return fail(res, result.error.message, 500);
  const total = (result.data ?? []).reduce((a: number, b: any) => a + Number(b.price) * b.quantity, 0);
  return ok(res, { range, total, count_items: result.data?.length ?? 0 });
});
