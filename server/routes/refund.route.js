import express from "express";
import { isAuthenticatedUser, isAdmin } from "../middleware/auth.middleware.js";
import {
  getAllRefunds,
  getRefundById,
  createRefund,
  approveRefund,
  rejectRefund,
  processRefund,
  completeRefund,
  getRefundStats,
  deleteRefund,
} from "../controllers/refund.controller.js";

const router = express.Router();

// Admin routes
router.get("/", isAuthenticatedUser, isAdmin, getAllRefunds);
router.get("/stats", isAuthenticatedUser, isAdmin, getRefundStats);
router.get("/:id", isAuthenticatedUser, isAdmin, getRefundById);
router.post("/create", isAuthenticatedUser, isAdmin, createRefund);
router.put("/:id/approve", isAuthenticatedUser, isAdmin, approveRefund);
router.put("/:id/reject", isAuthenticatedUser, isAdmin, rejectRefund);
router.put("/:id/process", isAuthenticatedUser, isAdmin, processRefund);
router.put("/:id/complete", isAuthenticatedUser, isAdmin, completeRefund);
router.delete("/:id", isAuthenticatedUser, isAdmin, deleteRefund);

export default router;
