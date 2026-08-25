import { Router } from 'express';
import { saveAbandonedCart } from '../controllers/abandonedCart.controller.js';

const router = Router();
router.post('/', saveAbandonedCart);

export default router;
