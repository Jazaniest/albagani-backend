import { Router } from 'express';
import { login, logout, me } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import rateLimit from 'express-rate-limit';



const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false
});

const r = Router();
r.post('/login', loginLimiter, login);
r.post('/logout', logout);
r.get('/me', requireAuth, me);

export default r;