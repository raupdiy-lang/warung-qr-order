import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { healthRouter } from './routes/health.route.js';
import { publicRouter } from './routes/modules/public.route.js';
import { orderRouter } from './routes/modules/order.route.js';
import { adminRouter } from './routes/modules/admin.route.js';
import { managementRouter } from './routes/modules/management.route.js';
import { authRouter } from './routes/modules/auth.route.js';

export const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use('/uploads', express.static('backend/uploads'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.use('/api/health', healthRouter);
app.use('/api/public', publicRouter);
app.use('/api/orders', orderRouter);
app.use('/api/admin', adminRouter);
app.use('/api/auth', authRouter);
app.use('/api/management', managementRouter);
