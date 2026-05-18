import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../../supabase/client.js';
import { fail, ok } from '../../utils/response.js';

export const publicRouter = Router();

publicRouter.get('/menus', async (req, res) => {
  const search = String(req.query.search ?? '');
  const category = String(req.query.category ?? '');
  let query = supabase.from('menu_items').select('*').eq('is_active', true).order('name');
  if (search) query = query.ilike('name', `%${search}%`);
  if (category && category !== 'semua') query = query.eq('category', category);
  const result = await query;
  if (result.error) return fail(res, result.error.message, 500);
  return ok(res, result.data);
});

publicRouter.get('/tables/:tableNumber', async (req, res) => {
  const { data, error } = await supabase.from('tables').select('*').eq('table_number', Number(req.params.tableNumber)).single();
  if (error || !data) return fail(res, 'Table not found', 404);
  return ok(res, data);
});

publicRouter.post('/call-waiter', async (req, res) => {
  const parsed = z.object({ table_id: z.string().uuid(), note: z.string().optional() }).safeParse(req.body);
  if (!parsed.success) return fail(res, 'Invalid payload');
  const result = await supabase.from('call_waiter_logs').insert(parsed.data).select('*').single();
  if (result.error) return fail(res, result.error.message, 500);
  return ok(res, result.data, 201);
});
