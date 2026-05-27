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
import categoryRouter from './routes/category.routes.js'; // ✅ Use version with root '/' handler
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
    max: 100000, // ✅ Increased to handle larger traffic bursts
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

    const mappedProducts = productsList
        .filter(p => p && typeof p === 'object') // ✅ Filter out nulls or invalid entries
        .map((p) => {
            // Ensure all fields are defined to prevent JSON nulls
            return {
                id: String(p._id || p.id || ""),
                title: String(p.name || p.title || p.productName || "Untitled Product"),
                category: String(typeof p.category === 'string' ? p.category : (p.category?.name || p.category?.label || "General")),
                sellingPrice: parseFloat(p.sellingPrice || p.price || p.mrp || 0),
                thumbnail: String(p.thumbnail || (p.images && p.images[0]?.url) || ""),
                is_essential: Boolean(p.is_essential || p.essential || false)
            };
        })
        .filter(p => p.id && p.title !== "Untitled Product"); // ✅ Final safety check

    if (mappedProducts.length === 0) {
        console.warn("⚠️ No valid products found in Firebase to sync.");
        return 0;
    }

    try {
        const pythonUrl = process.env.PYTHON_SEARCH_URL || 'http://127.0.0.1:8001/api/sync-catalog';
        const pythonResponse = await fetch(pythonUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ products: mappedProducts }), // Wrapped in object for Python Pydantic consistency
            // Prevent hanging the server if Python service is slow
            signal: AbortSignal.timeout(5000) 
        });

        if (!pythonResponse.ok) {
            const errorBody = await pythonResponse.text();
            console.warn(`⚠️ AI Search Sync failed with status ${pythonResponse.status}: ${errorBody}`);
            return 0;
        }

        return mappedProducts.length;
    } catch (err) {
        // Log error but don't throw, allowing the caller (Order process) to continue
        console.error("❌ AI Search Engine Offline or Unreachable:", err.message);
        return 0;
    }
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

/**
 * ✅ Production/Vercel Readiness
 * app.listen should not run on Vercel as it manages the runtime.
 * Startup sync is moved to a manual admin trigger to avoid serverless timeouts.
 */
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(PORT, async () => {
        console.log(`🚀 Local Server: http://localhost:${PORT}`);
        try {
            setTimeout(async () => {
                const syncedCount = await syncAIProductsToPython();
                console.log(`✅ Local startup sync: ${syncedCount} products indexed.`);
            }, 2000);
        } catch (err) {
            console.warn(`⚠️ Startup sync failed: ${err.message}`);
        }
    });
}

export default app; // Required for Vercel Node.js runtime