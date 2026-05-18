import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../../supabase/client.js';
import { fail, ok } from '../../utils/response.js';

export const orderRouter = Router();

const itemSchema = z.object({ menu_id: z.string().uuid(), quantity: z.number().int().min(1), note: z.string().optional(), price: z.number().positive() });
const createSchema = z.object({ table_id: z.string().uuid(), notes: z.string().optional(), items: z.array(itemSchema).min(1) });

orderRouter.post('/', async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 'Payload checkout tidak valid');
  const { table_id, notes, items } = parsed.data;

  const orderRes = await supabase.from('orders').insert({ table_id, notes, status: 'menunggu', estimated_minutes: 20 }).select('*').single();
  if (orderRes.error || !orderRes.data) return fail(res, orderRes.error?.message ?? 'Gagal membuat pesanan', 500);

  const payload = items.map((i) => ({ order_id: orderRes.data.id, menu_id: i.menu_id, quantity: i.quantity, note: i.note ?? null, price: i.price }));
  const itemRes = await supabase.from('order_items').insert(payload);
  if (itemRes.error) return fail(res, itemRes.error.message, 500);
  return ok(res, orderRes.data, 201);
});

orderRouter.get('/table/:tableId', async (req, res) => {
  const result = await supabase.from('orders').select('*, order_items(*, menu_items(name,image_url))').eq('table_id', req.params.tableId).order('created_at', { ascending: false });
  if (result.error) return fail(res, result.error.message, 500);
  return ok(res, result.data);
});
