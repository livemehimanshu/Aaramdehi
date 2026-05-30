import { Router } from 'express';
import { createOrder, getMyOrders, getFrequentlyBoughtTogether } from '../controllers/order.controller.js';
import { isAuthenticatedUser } from '../middleware/auth.middleware.js';

const orderRouter = Router();

// Recommendations logic
orderRouter.get('/recommendations/:productId', getFrequentlyBoughtTogether);

// Other routes
orderRouter.post('/create', isAuthenticatedUser, createOrder);
orderRouter.get('/my-orders', isAuthenticatedUser, getMyOrders);

export default orderRouter;