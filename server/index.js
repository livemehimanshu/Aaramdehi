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
    origin: [
        'https://aaramdehi.vercel.app', 
        'https://www.aaramdehi.co.in', 
        'http://localhost:5173'
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "accessToken"]
};

app.use(cors(corsOptions));

// Pre-flight requests handle karne ke liye
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (corsOptions.origin.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Credentials", "true");
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// --- Middlewares ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(helmet({ crossOriginResourcePolicy: false }));

// --- Routes ---
const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/user", userRouter);
apiRouter.use("/products", productRouter);
apiRouter.use("/seo", seoRouter);
apiRouter.use("/order", orderRouter);
apiRouter.use("/banners", bannerRouter);
apiRouter.use("/categories", categoryRouter);
apiRouter.use("/coupons", couponRouter);
apiRouter.use("/shops", shopsRouter);
apiRouter.use("/appointments", appointmentRouter);
apiRouter.use("/analytics", analyticsRouter);
apiRouter.use("/payments", paymentRouter);
apiRouter.use("/refunds", refundRouter);
apiRouter.use("/settings", settingsRouter);
apiRouter.use("/team", teamRouter);

app.use("/api", apiRouter);
app.use("/", apiRouter);

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