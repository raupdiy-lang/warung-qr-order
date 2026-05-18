import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { supabase } from '../../supabase/client.js';
import { env } from '../../config/env.js';
import { fail, ok } from '../../utils/response.js';

const schema = z.object({ email: z.string().email(), password: z.string().min(6) });
export const authRouter = Router();

authRouter.post('/login', async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.errors[0]?.message ?? 'Invalid body');

  const { data, error } = await supabase.from('users').select('*').eq('email', parsed.data.email).single();
  if (error || !data) return fail(res, 'Email/password salah', 401);
  const passOk = await bcrypt.compare(parsed.data.password, data.password_hash);
  if (!passOk || !['admin', 'kitchen'].includes(data.role)) return fail(res, 'Email/password salah', 401);

  const token = jwt.sign({ id: data.id, role: data.role }, env.JWT_SECRET, { expiresIn: '8h' });
  return ok(res, { token, user: { id: data.id, email: data.email, role: data.role } });
});
