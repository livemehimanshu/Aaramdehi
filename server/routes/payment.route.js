import express from "express";
import rateLimit from "express-rate-limit";
import { isAuthenticatedUser, isAdmin, optionalAuthenticatedUser } from "../middleware/auth.middleware.js";
import {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePaymentStatus,
  retryPayment,
  getPaymentStats,
  deletePayment,
  getGatewayConfig,
  updateGatewayConfig,
  createRazorpayOrder,
  verifyRazorpayPayment,
  createCashfreeOrder,
  razorpayWebhook,
  cashfreeWebhook,
} from "../controllers/payment.controller.js";

const router = express.Router();

// Rate limiter for payment creation endpoints
const createOrderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  message: {
    success: false,
    message: "Too many payment requests from this IP, please try again later.",
  },
});

// ==========================================
// WEBHOOK ROUTES (Must process raw body for verification)
// ==========================================
router.post(
  "/razorpay/webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

router.post(
  "/cashfree/webhook",
  express.raw({ type: "application/json" }),
  cashfreeWebhook
);

// ==========================================
// DYNAMIC GATEWAY ROUTES
// ==========================================

// Admin Route: Gateway Keys/Credentials save karne ke liye
router.post(
  "/admin/gateway-config",
  isAuthenticatedUser,
  isAdmin,
  updateGatewayConfig
);

router.get(
  "/admin/gateway-config",
  isAuthenticatedUser,
  isAdmin,
  getGatewayConfig
);

// Client/User Routes: Order create karne ke liye
router.post(
  "/razorpay/create-order",
  optionalAuthenticatedUser,
  createOrderLimiter,
  createRazorpayOrder
);

router.post(
  "/razorpay/verify",
  optionalAuthenticatedUser,
  verifyRazorpayPayment
);

router.post(
  "/cashfree/create-order",
  optionalAuthenticatedUser,
  createOrderLimiter,
  createCashfreeOrder
);

// ==========================================
// PAYMENT MANAGEMENT ROUTES
// ==========================================

// Admin routes
router.get("/", isAuthenticatedUser, isAdmin, getAllPayments);
router.get("/stats", isAuthenticatedUser, isAdmin, getPaymentStats);
router.get("/:id", isAuthenticatedUser, isAdmin, getPaymentById);
router.post("/create", isAuthenticatedUser, isAdmin, createPayment);
router.put("/:id", isAuthenticatedUser, isAdmin, updatePaymentStatus);
router.put("/:id/retry", isAuthenticatedUser, isAdmin, retryPayment);
router.delete("/:id", isAuthenticatedUser, isAdmin, deletePayment);

export default router;