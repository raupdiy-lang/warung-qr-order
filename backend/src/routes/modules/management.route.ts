import { Router } from 'express';
import multer from 'multer';
import QRCode from 'qrcode';
import { z } from 'zod';
import { requireAdmin } from '../../middleware/auth.js';
import { env } from '../../config/env.js';
import { supabase } from '../../supabase/client.js';
import { fail, ok } from '../../utils/response.js';

const upload = multer({ dest: 'backend/uploads' });
export const managementRouter = Router();
managementRouter.use(requireAdmin);

managementRouter.get('/menus', async (_, res) => ok(res, (await supabase.from('menu_items').select('*').order('name')).data));
managementRouter.post('/menus', async (req, res) => {
  const parsed = z.object({ name: z.string().min(2), category: z.enum(['makanan', 'minuman', 'dessert']), price: z.number().positive(), description: z.string().optional(), image_url: z.string().url().optional() }).safeParse(req.body);
  if (!parsed.success) return fail(res, 'Payload menu tidak valid');
  const result = await supabase.from('menu_items').insert(parsed.data).select('*').single();
  if (result.error) return fail(res, result.error.message, 500);
  return ok(res, result.data, 201);
});
managementRouter.put('/menus/:id', async (req, res) => ok(res, (await supabase.from('menu_items').update(req.body).eq('id', req.params.id).select('*').single()).data));
managementRouter.delete('/menus/:id', async (req, res) => { await supabase.from('menu_items').delete().eq('id', req.params.id); return res.status(204).send(); });

managementRouter.post('/menus/upload', upload.single('photo'), async (req, res) => {
  if (!req.file) return fail(res, 'File wajib diisi');
  const publicUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  return ok(res, { image_url: publicUrl }, 201);
});

managementRouter.get('/tables', async (_, res) => ok(res, (await supabase.from('tables').select('*').order('table_number')).data));
managementRouter.post('/tables', async (req, res) => {
  const parsed = z.object({ table_number: z.number().int().min(1) }).safeParse(req.body);
  if (!parsed.success) return fail(res, 'Nomor meja tidak valid');
  const table = await supabase.from('tables').insert(parsed.data).select('*').single();
  if (table.error || !table.data) return fail(res, table.error?.message ?? 'Gagal tambah meja', 500);
  const qrUrl = `${env.APP_BASE_URL}/menu?table=${parsed.data.table_number}`;
  const qrCode = await QRCode.toDataURL(qrUrl);
  await supabase.from('tables').update({ qr_url: qrCode }).eq('id', table.data.id);
  return ok(res, { ...table.data, qr_url: qrCode }, 201);
});
managementRouter.delete('/tables/:id', async (req, res) => { await supabase.from('tables').delete().eq('id', req.params.id); res.status(204).send(); });
