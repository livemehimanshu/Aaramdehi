import { Router } from 'express';
import { getAnalyticsSummary } from '../controllers/analytics.controller.js';
import { isAuthenticatedUser, isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/summary', isAuthenticatedUser, isAdmin, getAnalyticsSummary);

export default router;