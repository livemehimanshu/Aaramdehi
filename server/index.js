import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'node:dns';

dns.setDefaultResultOrder('ipv4first');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Robust Env Loading: Pehle server folder dekho, fir root folder
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import express from 'express';
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
import { findAll } from './config/db.js';

// ... (Baaki saare imports wahi rakhein)
import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import productRouter from './routes/product.route.js';
import seoRouter from './routes/seo.route.js';
import bannerRouter from './routes/banner.route.js';
import categoryRouter from './routes/category.route.js'; // Ensure we use the correct route file
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

const app = express();

// ✅ Trust Proxy: Vite/Vercel proxy ke peeche rate-limiting sahi chalne ke liye
app.set('trust proxy', 1);

// --- CORS & Options (SAHI TARIKA) ---
const allowedCorsOrigins = [
    'https://www.aaramdehi.co.in',
    'https://aaramdehi.co.in',
    'https://aaramdehi.vercel.app',
    'https://aaramdehi-backend.onrender.com',
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
// --- Middlewares ---
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(securityHeaders);
app.use(helmet({ crossOriginResourcePolicy: false }));

// --- Routes ---
const apiRouter = express.Router();

// ✅ Public Routes (Pehle rakhein taaki auth middleware inhe block na kare)
apiRouter.use("/auth", authRouter);
apiRouter.use("/products", productRouter);
apiRouter.use("/banners", bannerRouter);
apiRouter.use("/categories", categoryRouter);

// ✅ Protected/User Routes
apiRouter.use("/user", userRouter);
apiRouter.use("/seo", seoRouter);
apiRouter.use("/orders", orderRouter);
apiRouter.use("/coupons", couponRouter);
apiRouter.use("/shops", shopsRouter);
apiRouter.use("/appointments", appointmentRouter);
apiRouter.use("/analytics", analyticsRouter);
apiRouter.use("/analytics", behavioralTrackingRouter); // Behavioral tracking under /api/analytics/
apiRouter.use("/payments", paymentRouter);
apiRouter.use("/refunds", refundRouter);
apiRouter.use("/settings", settingsRouter);
apiRouter.use("/rooms", roomRouter);
apiRouter.use('/newsletter', newsletterRouter);
apiRouter.use("/team", teamRouter);

app.use("/api", apiRouter);
app.use("/products", productRouter); // Allow legacy direct product access
app.use("/settings", settingsRouter); // Allow legacy direct settings access

// Sync route
apiRouter.post("/admin/sync-ai-search", async (req, res) => {
    // ... logic wahi rakhein
    res.json({ success: true, message: "Synced" });
});

// ✅ Lightweight health route for Render uptime checks
//    No DB call, no auth, bas fast response. Render ya koi external monitor is endpoint ko ping karega.
app.get('/health', (req, res) => {
    return res.status(200).json({
        success: true,
        status: 'ok',
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
    });
});

// Simple ping route for internal or external validation
app.get('/ping', (req, res) => {
    return res.status(200).json({ success: true, message: 'pong' });
});

// Root route, optional but useful for quick manual check
app.get("/", (req, res) => res.json({ message: "Server is Active" }));

/**
 * ✅ Final Catch-all for 404s (Express compatible syntax)
 */
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
    // ✅ Full error logging taaki 500 error ka exact line pata chale
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
        // Development mein error detail dikhane ke liye (Optional)
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
});
const PORT = process.env.PORT || 8000;

// Keep-alive interval configuration
const keepAliveIntervalMinutes = Number(process.env.KEEP_ALIVE_INTERVAL_MINUTES ?? 11);
const keepAliveUrl = process.env.KEEP_ALIVE_URL || `http://127.0.0.1:${PORT}/health`;
const keepAliveIntervalMs = Math.max(1, keepAliveIntervalMinutes) * 60 * 1000;

// Internal HTTP client for self-ping. Simple aur lightweight.
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
        // Example template: clean up expired carts/sessions, remove stale uploads, rotate logs, etc.
        // NOTE: Ye task DB intensive nahi hona chahiye; yahan light background jobs add karein.
        console.log('🧹 Running periodic light maintenance tasks');
        // await cleanupExpiredCarts();
        // await cleanupExpiredSessions();
        // await rotateDailyLogs();
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
    console.log(`🔁 Keep-alive ping target: ${keepAliveUrl}`);
    console.log(`⏱️ Keep-alive interval: ${keepAliveIntervalMinutes} minute(s)`);

    // Self-ping loop starts after server boot.
    // Render ke free tier mein 15 minute inactivity timeout hota hai,
    // isliye 10-12 minute ka interval use karein.
    setInterval(async () => {
        await pingHealthEndpoint();
        await runPeriodicLightTasks();
    }, keepAliveIntervalMs);
});
export default app;