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
} from "../controllers/settings.controller.js";

const router = express.Router();

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
