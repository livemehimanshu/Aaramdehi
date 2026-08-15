// server/index.js

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'node:dns';

dns.setDefaultResultOrder('ipv4first');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import express from 'express';
import fs from 'fs';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from "morgan";
import helmet from "helmet";
import http from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';
import securityHeaders from './middleware/securityHeaders.js';

// Payment Credentials Listener Import
import { initPaymentGatewaySync } from './config/paymentConfig.js';

import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import productRouter from './routes/product.route.js';
import seoRouter from './routes/seo.route.js';
import bannerRouter from './routes/banner.route.js';
import categoryRouter from './routes/category.route.js';
import couponRouter from './routes/coupon.route.js';
import appointmentRouter from './routes/appointment.route.js';
import analyticsRouter from './routes/analytics.route.js';
import paymentRouter from './routes/payment.route.js';
import refundRouter from './routes/refund.route.js';
import settingsRouter from './routes/settings.route.js';
import teamRouter from './routes/team.route.js';
import orderRouter from './routes/order.route.js';
import shopsRouter from './routes/shops.route.js';
import roomRouter from './routes/room.route.js';
import newsletterRouter from './routes/newsletter.route.js';
import behavioralTrackingRouter from './routes/behavioralTrackingRoutes.js';
import blogRouter from './routes/blog.route.js';
import { findAll } from './config/db.js';
import { buildSitemapXml } from './utils/sitemap.js';
import { buildMerchantFeedXml } from './utils/merchantFeed.js';

const app = express();

app.set('trust proxy', 1);

// ==========================================
// 1. SEO FIX: Force WWW & HTTPS 301 Redirects
// ==========================================
app.use((req, res, next) => {
    const host = req.headers.host;
    // Check if domain is non-www in production
    if (process.env.NODE_ENV === 'production' && host === 'aaramdehi.co.in') {
        return res.redirect(301, `https://www.aaramdehi.co.in${req.url}`);
    }
    next();
});

const allowedCorsOrigins = [
    'https://www.aaramdehi.co.in',
    'https://aaramdehi.co.in',
    'https://aaramdehi.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const normalizedOrigin = origin.replace(/\/$/, '');
        const isAllowed = allowedCorsOrigins.includes(normalizedOrigin)
            || normalizedOrigin.endsWith('.aaramdehi.co.in')
            || normalizedOrigin.endsWith('.aaramdehi.vercel.app');
        callback(null, isAllowed);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization", "accessToken", "accesstoken"]
};

app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(securityHeaders);
app.use(helmet({ crossOriginResourcePolicy: false }));

const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/products", productRouter);
apiRouter.use("/blogs", blogRouter);
apiRouter.use("/banners", bannerRouter);
apiRouter.use("/categories", categoryRouter);

apiRouter.use("/user", userRouter);
apiRouter.use("/seo", seoRouter);
apiRouter.use("/orders", orderRouter);
apiRouter.use("/coupons", couponRouter);
apiRouter.use("/shops", shopsRouter);
apiRouter.use("/appointments", appointmentRouter);

// behavioralTrackingRouter ko PEHLE mount kiya gaya hai, fir analyticsRouter ko
apiRouter.use("/analytics", behavioralTrackingRouter);
apiRouter.use("/analytics", analyticsRouter);

apiRouter.use("/payments", paymentRouter);
apiRouter.use("/refunds", refundRouter);
apiRouter.use("/settings", settingsRouter);
apiRouter.use("/rooms", roomRouter);
apiRouter.use('/newsletter', newsletterRouter);
apiRouter.use("/team", teamRouter);

app.use("/api", apiRouter);
app.use("/products", productRouter);
app.use("/settings", settingsRouter);

// ==========================================
// 4. Static Asset Serving & SPA Fallback
// If a `public` folder exists, serve it as static assets and
// return `index.html` for SPA routes (but avoid rewriting API or asset requests).
// ==========================================
const staticDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(staticDir)) {
    app.use(express.static(staticDir, { maxAge: '1d' }));

    app.use((req, res, next) => {
        const urlPath = req.path || '';
        // Do not rewrite API or asset requests
        if (urlPath.startsWith('/api') || urlPath.startsWith('/products') || urlPath.startsWith('/assets') || urlPath.startsWith('/static')) return next();

        const indexFile = path.join(staticDir, 'index.html');
        if (fs.existsSync(indexFile)) {
            return res.sendFile(indexFile);
        }
        return next();
    });
}

app.get('/health', (req, res) => {
    return res.status(200).json({
        success: true,
        status: 'ok',
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
    });
});

app.get('/ping', (req, res) => {
    return res.status(200).json({ success: true, message: 'pong' });
});

const safeFindAll = async (collectionName) => {
    try {
        return await findAll(collectionName);
    } catch (error) {
        console.warn(`Sitemap fallback: unable to read ${collectionName}:`, error?.message || error);
        return [];
    }
};

// Dynamic Sitemap Endpoint (Serve XML at Root URL for Search Engines)
app.get('/api/sitemap', async (req, res) => {
    try {
        const apiBase = process.env.FRONTEND_URL || "https://www.aaramdehi.co.in";
        const [products, categories, blogs] = await Promise.all([
            safeFindAll('products'),
            safeFindAll('categories'),
            safeFindAll('blogs')
        ]);
        const xml = buildSitemapXml({ baseUrl: apiBase, products, categories, blogs });

        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        console.error("Sitemap generation error:", error);
        const fallbackXml = buildSitemapXml({
            baseUrl: process.env.FRONTEND_URL || "https://www.aaramdehi.co.in",
            products: [],
            categories: [],
            blogs: []
        });
        res.header('Content-Type', 'application/xml');
        res.status(200).send(fallbackXml);
    }
});

app.get('/api/google-merchant-feed', async (req, res) => {
    try {
        const apiBase = process.env.FRONTEND_URL || "https://www.aaramdehi.co.in";
        const products = await findAll('products');
        const xml = buildMerchantFeedXml({ baseUrl: apiBase, products });

        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        console.error("Merchant feed generation error:", error);
        res.status(500).end();
    }
});

// ==========================================
// 2. SEO FIX: 301 Redirects for Known Broken / 404 URLs
// ==========================================

// Automatic Dynamic Redirect for any .htm URL to its clean counterpart
app.get('/:slug.htm', async (req, res) => {
    const rawSlug = req.params.slug;
    const cleanSlug = rawSlug;

    try {
        const { resolveProductByIdentifier } = await import('./controllers/product.controller.js');
        const result = await resolveProductByIdentifier(cleanSlug);
        if (result?.product?.slug) {
            return res.redirect(301, `https://www.aaramdehi.co.in/${result.product.slug}`);
        }
    } catch (err) {
        console.warn('Legacy slug redirect resolver failed:', err?.message || err);
    }

    return res.redirect(301, `https://www.aaramdehi.co.in/${cleanSlug}`);
});

// Specific Redirects (If needed for explicit mapping)
app.get('/cotton-dori-cushion.htm', (req, res) => {
    return res.redirect(301, 'https://www.aaramdehi.co.in/cotton-dori-cushion');
});

app.get('/anti-slip-door-mat.htm', (req, res) => {
    return res.redirect(301, 'https://www.aaramdehi.co.in/anti-slip-door-mat');
});

app.get('/satin-cushions.htm', (req, res) => {
    return res.redirect(301, 'https://www.aaramdehi.co.in/satin-cushions');
});

app.get('/24x24-inch-handicraft-cushion.htm', (req, res) => {
    return res.redirect(301, 'https://www.aaramdehi.co.in/24x24-inch-handicraft-cushion');
});

app.get('/designer-door-mat.htm', (req, res) => {
    return res.redirect(301, 'https://www.aaramdehi.co.in/designer-door-mat');
});

app.get('/compressed-fiber-pillow.htm', (req, res) => {
    return res.redirect(301, 'https://www.aaramdehi.co.in/compressed-fiber-pillow');
});

app.get('/cotton-pillows.htm', (req, res) => {
    return res.redirect(301, 'https://www.aaramdehi.co.in/cotton-pillows');
});

app.get('/plain-white-fiber-bolster.htm', (req, res) => {
    return res.redirect(301, 'https://www.aaramdehi.co.in/plain-white-fiber-bolster');
});

app.get("/", (req, res) => res.json({ message: "Server is Active" }));

// ==========================================
// 3. SEO FIX: Clean 404 Response
// ==========================================
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
    console.error("❌ [Backend Error]:", {
        message: err.message,
        stack: err.stack,
        path: req.path
    });

    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            success: false,
            message: 'Invalid JSON payload. Please send valid JSON in the request body.',
        });
    }
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

const PORT = process.env.PORT || 8000;

const keepAliveIntervalMinutes = Number(process.env.KEEP_ALIVE_INTERVAL_MINUTES ?? 11);
const keepAliveUrl = process.env.KEEP_ALIVE_URL || `http://127.0.0.1:${PORT}/health`;
const keepAliveIntervalMs = Math.max(1, keepAliveIntervalMinutes) * 60 * 1000;

const makeRequest = (url) => {
    return new Promise((resolve, reject) => {
        try {
            const parsed = new URL(url);
            const lib = parsed.protocol === 'https:' ? https : http;
            const req = lib.request(parsed, { method: 'GET', timeout: 10000 }, (res) => {
                const { statusCode } = res;
                res.resume();
                if (statusCode >= 200 && statusCode < 300) {
                    return resolve({ ok: true, statusCode });
                }
                return resolve({ ok: false, statusCode });
            });

            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy(new Error('Keep-alive request timed out'));
            });
            req.end();
        } catch (error) {
            reject(error);
        }
    });
};

const runPeriodicLightTasks = async () => {
    try {
        console.log('🧹 Running periodic light maintenance tasks');
    } catch (error) {
        console.error('⚠️ Periodic task failed:', error);
    }
};

const pingHealthEndpoint = async () => {
    try {
        const result = await makeRequest(keepAliveUrl);
        if (!result.ok) {
            console.warn(`⚠️ Keep-alive ping returned ${result.statusCode} for ${keepAliveUrl}`);
        } else {
            console.log(`✅ Keep-alive ping successful: ${keepAliveUrl}`);
        }
    } catch (error) {
        console.error(`❌ Keep-alive ping failed for ${keepAliveUrl}:`, error.message || error);
    }
};

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    
    // Initialize Dynamic Payment Gateways Listener on Server Startup
    try {
        initPaymentGatewaySync();
        console.log('⚡ Dynamic Payment Gateway listener initialized');
    } catch (err) {
        console.error('❌ Failed to initialize Payment Gateway sync:', err.message);
    }

    console.log(`🔁 Keep-alive ping target: ${keepAliveUrl}`);
    console.log(`⏱️ Keep-alive interval: ${keepAliveIntervalMinutes} minute(s)`);

    setInterval(async () => {
        await pingHealthEndpoint();
        await runPeriodicLightTasks();
    }, keepAliveIntervalMs);
});

export default app;