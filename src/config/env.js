import 'dotenv/config';

export const config = {
    env: process.env.NODE_ENV || 'production',
    port: Number(process.env.PORT) || 3000,
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    },
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Auto true di production
        sameSite: 'none', // ← PENTING untuk cross-origin!
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
        name: 'access_token'
    },
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
        'https://albagani.com',
        'https://www.albagani.com',
        'https://api.albagani.com',
        'http://localhost:5173',
        'http://localhost:3000'
    ]
};