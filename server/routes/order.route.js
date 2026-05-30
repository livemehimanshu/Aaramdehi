import { Router } from 'express';
import { createOrder, getMyOrders, getFrequentlyBoughtTogether, getOrderById } from '../controllers/order.controller.js';
import { isAuthenticatedUser } from '../middleware/auth.middleware.js';

const orderRouter = Router();

// Recommendations logic
orderRouter.get('/recommendations/:productId', getFrequentlyBoughtTogether);
orderRouter.get('/details/:id', isAuthenticatedUser, getOrderById); // ✅ New Details Route

// Other routes
orderRouter.post('/create', isAuthenticatedUser, createOrder);
orderRouter.get('/my-orders', isAuthenticatedUser, getMyOrders);

export default orderRouter;