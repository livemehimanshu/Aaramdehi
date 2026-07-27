import express from 'express';
import * as behavioralController from '../controllers/behavioralTrackingController.js';
import { isAuthenticatedUser, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// ==================== USER / CLIENT TRACKING ROUTES ====================

// Frontend uses /api/analytics/create-session, /api/analytics/track-behavior, etc.
// These are accessible to guest visitors as well as authenticated users
router.post('/create-session', behavioralController.createSession);

// Track user behavior (clicks, hover, zoom)
router.post('/track-behavior', behavioralController.trackBehavior);

// Update session status
router.post('/update-session-status', behavioralController.updateSessionStatus);


// ==================== ADMIN RETARGETING RULES CRUD ====================

// Create retargeting rule
router.post('/admin/retargeting-rules', isAuthenticatedUser, isAdmin, behavioralController.createRule);

// Get all rules (Controller exports 'getAllRules')
router.get('/admin/retargeting-rules', isAuthenticatedUser, isAdmin, behavioralController.getAllRules);

// Get single rule
router.get('/admin/retargeting-rules/:ruleId', isAuthenticatedUser, isAdmin, behavioralController.getRuleById);

// Update rule
router.put('/admin/retargeting-rules/:ruleId', isAuthenticatedUser, isAdmin, behavioralController.updateRule);

// Delete rule
router.delete('/admin/retargeting-rules/:ruleId', isAuthenticatedUser, isAdmin, behavioralController.deleteRule);


// ==================== ADMIN ANALYTICS & DASHBOARD ====================

// Fetch user behavior logs by userId
router.get('/user-behavior/:userId', isAuthenticatedUser, isAdmin, behavioralController.getUserBehavior);

// High-intent sessions (for admin dashboard)
router.get('/high-intent-sessions', isAuthenticatedUser, isAdmin, behavioralController.getHighIntentSessions);

// Conversion metrics & KPIs (for admin dashboard)
router.get('/conversion-metrics', isAuthenticatedUser, isAdmin, behavioralController.getConversionMetrics);

// All interactions log
router.get('/all-interactions', isAuthenticatedUser, isAdmin, behavioralController.getAllInteractions);

export default router;