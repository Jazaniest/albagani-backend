import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/error.js';
import { notFound } from './middlewares/notFound.js';
import cookieParser from 'cookie-parser';
import { config } from './config/env.js'; // ← Import config!

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
    const app = express();
    app.set('trust proxy', 1); // ← PENTING untuk production!

    app.use((req, res, next) => {
        console.log('📨 Request:', {
            method: req.method,
            path: req.path,
            origin: req.headers.origin,
            cookies: req.cookies,
            auth: req.headers.authorization
        });
        next();
    });

    // CORS Configuration - HARUS SEBELUM HELMET!
    app.use(cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (mobile apps, Postman, etc.)
            if (!origin) return callback(null, true);

            if (config.allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true, // ← PENTING!
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        exposedHeaders: ['Content-Range', 'X-Content-Range'],
        maxAge: 86400 // Cache preflight request for 24 hours
    }));

    // Helmet Configuration
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                // Izinkan sumber daya default dari origin sendiri dan HTTPS
                defaultSrc: ["'self'", "https:"],
                // Izinkan permintaan fetch/XHR/WS ke origin sendiri dan API Anda
                connectSrc: ["'self'", "https://api.albagani.com"],
                // Izinkan script dari origin sendiri, tetapi hindari inline script dan eval
                scriptSrc: ["'self'", "https:"],
                // Izinkan stylesheet dari origin sendiri, inline style, dan HTTPS
                styleSrc: ["'self'", "https:"],
                // Izinkan gambar dari origin sendiri, data URL, dan HTTPS
                imgSrc: ["'self'", "data:", "https:"],
                // Izinkan font dari origin sendiri dan HTTPS
                fontSrc: ["'self'", "https:"],
                // Mencegah objek/flash/plugin
                objectSrc: ["'none'"],
                // Menghindari iframe embedding
                frameAncestors: ["'none'"]
            }
        },
        crossOriginEmbedderPolicy: { policy: "credentialless" },
        crossOriginResourcePolicy: { policy: "same-origin" },
    }));


    app.use(compression());
    app.use(express.json());
    app.use(cookieParser());
    app.use(morgan('dev'));

    // Additional security headers
    app.use((req, res, next) => {
        const origin = req.headers.origin;
        if (origin && config.allowedOrigins.includes(origin)) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Credentials', 'true');
        }
        res.setHeader('X-XSS-Protection', '1; mode=block');

        // Handle preflight
        if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
            return res.sendStatus(204);
        }
        next();
    });

    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    app.use('/api', routes);

    app.use(notFound);
    app.use(errorHandler);

    return app;
}