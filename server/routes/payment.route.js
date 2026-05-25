import express from "express";
import { isAuthenticatedUser, isAdmin } from "../middleware/auth.middleware.js";
import {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePaymentStatus,
  retryPayment,
  getPaymentStats,
  deletePayment,
} from "../controllers/payment.controller.js";

const router = express.Router();

// Admin routes
router.get("/", isAuthenticatedUser, isAdmin, getAllPayments);
router.get("/stats", isAuthenticatedUser, isAdmin, getPaymentStats);
router.get("/:id", isAuthenticatedUser, isAdmin, getPaymentById);
router.post("/create", isAuthenticatedUser, isAdmin, createPayment);
router.put("/:id", isAuthenticatedUser, isAdmin, updatePaymentStatus);
router.put("/:id/retry", isAuthenticatedUser, isAdmin, retryPayment);
router.delete("/:id", isAuthenticatedUser, isAdmin, deletePayment);

export default router;
