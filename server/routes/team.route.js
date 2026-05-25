import express from "express";
import { isAuthenticatedUser, isAdmin } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.js";
import {
  getAllTeamMembers,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  getTeamStats,
} from "../controllers/team.controller.js";

const router = express.Router();

// Admin routes
router.get("/", isAuthenticatedUser, isAdmin, getAllTeamMembers);
router.get("/stats", isAuthenticatedUser, isAdmin, getTeamStats);
router.get("/:id", isAuthenticatedUser, isAdmin, getTeamMemberById);
router.post("/create", isAuthenticatedUser, isAdmin, upload.single("profileImage"), createTeamMember);
router.put("/:id", isAuthenticatedUser, isAdmin, upload.single("profileImage"), updateTeamMember);
router.delete("/:id", isAuthenticatedUser, isAdmin, deleteTeamMember);

export default router;
