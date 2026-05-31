import express from "express";
import { isAuthenticatedUser, isAdmin } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.js";
import {
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  getActiveBanners,
} from "../controllers/banner.controller.js";

const router = express.Router();

// Public routes
router.get("/active", getActiveBanners);

// Admin routes
router.get("/", isAuthenticatedUser, isAdmin, getAllBanners);
router.get("/:id", isAuthenticatedUser, isAdmin, getBannerById);
router.post("/create", isAuthenticatedUser, isAdmin, upload.single("image"), createBanner);
router.put("/:id", isAuthenticatedUser, isAdmin, upload.single("image"), updateBanner);
router.delete("/:id", isAuthenticatedUser, isAdmin, deleteBanner);
router.delete("/delete/:id", isAuthenticatedUser, isAdmin, deleteBanner); // ✅ Fix: Added alias to match frontend request

export default router;
