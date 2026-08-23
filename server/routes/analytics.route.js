import { Router } from 'express';
import { getAnalyticsSummary, getAdminAnalytics } from '../controllers/analytics.controller.js';
import { isAuthenticatedUser, isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/summary', isAuthenticatedUser, isAdmin, getAnalyticsSummary);
router.get('/admin', isAuthenticatedUser, isAdmin, getAdminAnalytics);

export default router;