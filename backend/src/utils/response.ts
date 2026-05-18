import type { Response } from 'express';

export const ok = (res: Response, data: unknown, status = 200) => res.status(status).json({ data });
export const fail = (res: Response, message: string, status = 400) => res.status(status).json({ message });
