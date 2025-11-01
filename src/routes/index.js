import { Router } from 'express';
import auth from './auth.routes.js';
import products from './products.routes.js';

const r = Router();
r.get('/health', (_req, res) => res.json({ ok: true }));
r.use('/auth', auth);
r.use('/products', products);

export default r;