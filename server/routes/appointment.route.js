import express from "express";
import { isAuthenticatedUser, isAdmin } from "../middleware/auth.middleware.js";
import {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  cancelAppointment,
  confirmAppointment,
  getAppointmentStats,
} from "../controllers/appointment.controller.js";

const router = express.Router();

// Public routes
router.post("/create", createAppointment);

// Admin routes
router.get("/", isAuthenticatedUser, isAdmin, getAllAppointments);
router.get("/stats", isAuthenticatedUser, isAdmin, getAppointmentStats);
router.get("/:id", isAuthenticatedUser, isAdmin, getAppointmentById);
router.put("/:id", isAuthenticatedUser, isAdmin, updateAppointment);
router.put("/:id/confirm", isAuthenticatedUser, isAdmin, confirmAppointment);
router.put("/:id/cancel", isAuthenticatedUser, isAdmin, cancelAppointment);
router.delete("/:id", isAuthenticatedUser, isAdmin, deleteAppointment);

export default router;
