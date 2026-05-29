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

// ... (Baaki saare imports wahi rakhein)
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

// --- CORS & Options (SAHI TARIKA) ---
const corsOptions = {
    origin: '*',
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "accessToken"]
};

app.use(cors(corsOptions));

// ✅ CRASH NAHI HOGA: Wildcard '*' ka use routing mein nahi, balki middleware mein karein
app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
        res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, accessToken");
        return res.sendStatus(200);
    }
    next();
});

// --- Middlewares ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(helmet({ crossOriginResourcePolicy: false }));

// --- Routes ---
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/products", productRouter);
app.use("/seo", seoRouter);
app.use("/order", orderRouter);
app.use("/banners", bannerRouter);
app.use("/categories", categoryRouter);
app.use("/coupons", couponRouter);
app.use("/shops", shopsRouter);
app.use("/appointments", appointmentRouter);
app.use("/analytics", analyticsRouter);
app.use("/payments", paymentRouter);
app.use("/refunds", refundRouter);
app.use("/settings", settingsRouter);
app.use("/team", teamRouter);

// Sync route
app.post("/admin/sync-ai-search", async (req, res) => {
    // ... logic wahi rakhein
    res.json({ success: true, message: "Synced" });
});

app.get("/", (req, res) => res.json({ message: "Active" }));

app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
});
const PORT = process.env.PORT || 8000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
export default app;