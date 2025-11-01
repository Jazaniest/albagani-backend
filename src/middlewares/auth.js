import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export function signToken(payload) {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch {
    return null;
  }
}

/**
 * Ambil JWT dari cookie atau Authorization header.
 */
function extractToken(req) {
  const cookieToken = req.cookies?.[config.cookie.name];
  if (cookieToken) return cookieToken;
  const auth = req.headers.authorization;
  if (!auth) return null;
  const [type, token] = auth.split(' ');
  if (type?.toLowerCase() !== 'bearer') return null;
  return token ?? null;
}

export function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ message: 'Invalid or expired token' });

  req.user = decoded; // { id, email, roles, iat, exp }
  next();
}

export function requireRole(...allowed) {
  return (req, res, next) => {
    const roles = req.user?.roles ?? [];
    const ok = roles.some(r => allowed.includes(r));
    if (!ok) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}
