import express from "express";
import multer from "multer";
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
  generateAutoBlog,
  getAiBlogQueue,
  createAiBlogQueueItem,
  deleteAiBlogQueueItem,
  getAiBlogLogs,
  bulkCreateAiBlogQueue,
} from "../controllers/settings.controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024 } });

// Public route - expose only public settings (no auth)
router.get("/public", getPublicSettings);

// Admin routes
router.get("/", isAuthenticatedUser, isAdmin, getAllSettings);
router.get("/category/:category", isAuthenticatedUser, isAdmin, getSettingsByCategory);
router.get("/ai-blog/logs", isAuthenticatedUser, isAdmin, getAiBlogLogs);
router.get("/:key", isAuthenticatedUser, isAdmin, getSettingByKey);
router.post("/create", isAuthenticatedUser, isAdmin, createSetting);
router.put("/:key", isAuthenticatedUser, isAdmin, updateSetting);
router.put("/:key/reset", isAuthenticatedUser, isAdmin, resetSetting);
router.post("/bulk/update", isAuthenticatedUser, isAdmin, bulkUpdateSettings);
router.post("/ai-blog/generate", isAuthenticatedUser, isAdmin, generateAutoBlog);
router.get("/ai-blog/queue", isAuthenticatedUser, isAdmin, getAiBlogQueue);
router.post("/ai-blog/queue", isAuthenticatedUser, isAdmin, createAiBlogQueueItem);
router.post("/ai-blog/queue/bulk", isAuthenticatedUser, isAdmin, upload.single('file'), bulkCreateAiBlogQueue);
router.delete("/ai-blog/queue/:id", isAuthenticatedUser, isAdmin, deleteAiBlogQueueItem);
router.delete("/:key", isAuthenticatedUser, isAdmin, deleteSetting);

export default router;
