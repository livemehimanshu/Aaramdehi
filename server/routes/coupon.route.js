import express from "express";
import { isAuthenticatedUser, isAdmin } from "../middleware/auth.middleware.js";
import {
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from "../controllers/coupon.controller.js";

const router = express.Router();

// Public routes
router.post("/validate", validateCoupon);

// Admin routes
router.get("/", isAuthenticatedUser, isAdmin, getAllCoupons);
router.get("/:id", isAuthenticatedUser, isAdmin, getCouponById);
router.post("/create", isAuthenticatedUser, isAdmin, createCoupon);
router.put("/:id", isAuthenticatedUser, isAdmin, updateCoupon);
router.delete("/:id", isAuthenticatedUser, isAdmin, deleteCoupon);

export default router;
