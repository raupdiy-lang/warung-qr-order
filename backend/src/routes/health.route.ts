import { Router } from 'express';

export const healthRouter = Router();
healthRouter.get('/', (_, res) => res.json({ status: 'ok', service: 'warung-qr-order-api' }));
