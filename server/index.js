import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'node:dns';

dns.setDefaultResultOrder('ipv4first');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config(); 
dotenv.config({ path: path.resolve(__dirname, '.env') });

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import morgan from "morgan";
import helmet from "helmet";
import { findAll } from './config/db.js';

import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import productRouter from './routes/product.route.js';
import seoRouter from './routes/seo.route.js';
import bannerRouter from './routes/banner.route.js';
import categoryRouter from './routes/category.routes.js';
import couponRouter from './routes/coupon.route.js';
import appointmentRouter from './routes/appointment.route.js';
import analyticsRouter from './routes/analytics.route.js';
import paymentRouter from './routes/payment.route.js';
import refundRouter from './routes/refund.route.js';
import settingsRouter from './routes/settings.route.js';
import teamRouter from './routes/team.route.js';
import orderRouter from './routes/order.route.js';
import shopsRouter from './routes/shops.route.js';

const app = express();

const adminLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max: 100000, 
    message: { success: false, message: "Too many requests.", error: true },
    standardHeaders: true,
    legacyHeaders: false,
});

const corsOptions = {
    origin: '*', // Vercel par strict origin ke bajaye '*' se test karein
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "accessToken"]
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // ✅ Crucial for 405 error

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(helmet({ crossOriginResourcePolicy: false }));

// --- API Routes (Prefix hata diya hai taaki Vercel rewrite ke saath conflict na ho) ---
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/products", adminLimiter, productRouter);
app.use("/seo", seoRouter);
app.use("/order", orderRouter);
app.use("/banners", adminLimiter, bannerRouter);
app.use("/categories", adminLimiter, categoryRouter);
app.use("/coupons", adminLimiter, couponRouter);
app.use("/shops", shopsRouter);
app.use("/appointments", appointmentRouter);
app.use("/analytics", analyticsRouter);
app.use("/payments", adminLimiter, paymentRouter);
app.use("/refunds", adminLimiter, refundRouter);
app.use("/settings", settingsRouter);
app.use("/team", teamRouter);

// Sync route - /api prefix hata diya hai
app.post("/admin/sync-ai-search", adminLimiter, async (req, res) => {
    try {
        console.log("🔄 Syncing...");
        const syncedCount = await syncAIProductsToPython();
        res.json({ success: true, message: `Synced ${syncedCount} products.` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get("/", (req, res) => res.json({ message: "Active" }));

// Helper function yahan include karein... (syncAIProductsToPython logic)

app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
});

export default app;