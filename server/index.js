import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'node:dns';

// ✅ Fix for local connectivity issues (prevents ERR_CONNECTION_REFUSED)
dns.setDefaultResultOrder('ipv4first');

// --- .env configuration ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sabse pehle standard load karein
dotenv.config(); 
// Phir server folder ke andar wali file ko force karein (local development ke liye)
dotenv.config({ path: path.resolve(__dirname, '.env') });

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import morgan from "morgan";
import helmet from "helmet";
import { findAll } from './config/db.js'; // Import Firebase helper

// --- Route Imports ---
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

const app = express();

// 🛡️ Security: Admin-Specific Rate Limiter
// Brute force attacks on admin panels ko rokne ke liye
const adminLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max: 50000, // Further increased for development environment
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
        error: true
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// --- Middlewares ---
// CORS Configuration - Accept both 5173 and 5174 in development
const corsOptions = {
    origin: function(origin, callback) {
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:5174',
            'https://aaramdehi.co.in',
            process.env.FRONTEND_URL // Vercel Dashboard mein ise bhi set karein
        ].filter(Boolean);
        
        // ✅ Improved normalization to handle trailing slashes and casing
        const normalize = (url) => url ? url.replace(/\/$/, "").toLowerCase() : null;
        const normalizedOrigin = normalize(origin);
        const normalizedAllowed = allowedOrigins.map(normalize);

        if (!origin || normalizedAllowed.includes(normalizedOrigin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "accessToken"]
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' })); // Increased limit for image uploads
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: {
        directives: {
            "default-src": ["'self'"],
            "script-src": ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com"],
            "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            "img-src": ["'self'", "data:", "https://res.cloudinary.com", "https://images.unsplash.com", "https://*.fbcdn.net", "https://images.pexels.com"],
            "font-src": ["'self'", "https://fonts.gstatic.com"],
            "connect-src": ["'self'", "http://localhost:8000", "https://aaramdehi-91f82-default-rtdb.firebaseio.com/"]
        }
    }
}));

// --- API Routes ---
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// Apply Admin Limiter to management routes
app.use("/api/products", adminLimiter, productRouter);
app.use("/api/seo", seoRouter);
app.use("/api/order", orderRouter); // Match exactly with frontend calls

app.use("/api/banners", adminLimiter, bannerRouter);
app.use("/api/categories", adminLimiter, categoryRouter);
app.use("/api/coupons", adminLimiter, couponRouter);
app.use("/api/shops", shopsRouter); // Khata Book (Shops)
app.use("/api/appointments", appointmentRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/payments", adminLimiter, paymentRouter);
app.use("/api/refunds", adminLimiter, refundRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/team", teamRouter);

// Health Check
app.get("/", (req, res) => {
    res.json({ message: "Aaramdehi Server is running!", status: "Active" });
});

async function syncAIProductsToPython() {
    const products = await findAll('products');
    const productsList = Array.isArray(products) ? products : Object.values(products || {});

    if (!productsList || productsList.length === 0) {
        throw new Error("No products found in Firebase to sync.");
    }

    const mappedProducts = productsList.map((p, index) => {
        const categoryValue = typeof p?.category === 'object'
            ? (p.category?.name || p.category?.label || "General")
            : (p?.category || "General");
        const sellingPrice = Number(p?.sellingPrice ?? p?.price ?? p?.mrp ?? 0);

        return {
            id: String(p?._id ?? p?.id ?? p?.key ?? `product_${index}`),
            title: p?.name || p?.title || p?.productName || p?.label || "Untitled Product",
            category: categoryValue || "General",
            sellingPrice: Number.isFinite(sellingPrice) ? sellingPrice : 0,
            thumbnail: p?.thumbnail || p?.image || (Array.isArray(p?.images) ? (p.images[0]?.url || p.images[0]) : "") || "",
            is_essential: Boolean(p?.is_essential ?? p?.essential ?? false),
            description: p?.description || p?.desc || "",
        };
    });

    const pythonUrl = process.env.PYTHON_SEARCH_URL || 'http://127.0.0.1:8001/api/sync-catalog';
    const pythonResponse = await fetch(pythonUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mappedProducts)
    });

    if (!pythonResponse.ok) {
        const errorBody = await pythonResponse.text();
        throw new Error(`AI Search Sync Failed: ${pythonResponse.status} ${pythonResponse.statusText} - ${errorBody}`);
    }

    return mappedProducts.length;
}

// ✅ Helper: Sync catalog with Python AI Search
app.post("/api/admin/sync-ai-search", adminLimiter, async (req, res) => {
    try {
        console.log("🔄 Syncing Firebase products with AI Search Engine...");
        const syncedCount = await syncAIProductsToPython();
        res.json({ success: true, message: `AI Search Catalog synced successfully from Firebase! ${syncedCount} products indexed.` });
    } catch (err) {
        console.error("❌ AI Search sync error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    if (process.env.NODE_ENV === 'production') {
        console.error(`[Error]: ${err.message}`, err.stack);
    }
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === 'development' ? err.stack : null,
    });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, async () => {
    console.log(`🚀 Server live at: http://localhost:${PORT}`);
    console.log(`🔥 Connected to Firebase Realtime Database`);

    try {
        const syncedCount = await syncAIProductsToPython();
        console.log(`✅ Startup sync completed: ${syncedCount} products indexed to Python AI Search.`);
    } catch (startupErr) {
        console.warn(`⚠️ Startup AI sync failed: ${startupErr.message}`);
    }
});