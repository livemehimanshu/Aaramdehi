import express from "express";
import { isAuthenticatedUser, isAdmin } from "../middleware/auth.middleware.js";
import {
  getAllSettings,
  getSettingByKey,
  createSetting,
  updateSetting,
  deleteSetting,
  getSettingsByCategory,
  bulkUpdateSettings,
  resetSetting,
  getPublicSettings,
} from "../controllers/settings.controller.js";

const router = express.Router();

// Public route - expose only public settings (no auth)
router.get("/public", getPublicSettings);

// Admin routes
router.get("/", isAuthenticatedUser, isAdmin, getAllSettings);
router.get("/category/:category", isAuthenticatedUser, isAdmin, getSettingsByCategory);
router.get("/:key", isAuthenticatedUser, isAdmin, getSettingByKey);
router.post("/create", isAuthenticatedUser, isAdmin, createSetting);
router.put("/:key", isAuthenticatedUser, isAdmin, updateSetting);
router.put("/:key/reset", isAuthenticatedUser, isAdmin, resetSetting);
router.post("/bulk/update", isAuthenticatedUser, isAdmin, bulkUpdateSettings);
router.delete("/:key", isAuthenticatedUser, isAdmin, deleteSetting);

export default router;
