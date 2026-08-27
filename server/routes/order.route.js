import { Router } from 'express';
import { createOrder, getMyOrders, getFrequentlyBoughtTogether, getOrderById, getAllOrders, updateOrderStatus, getOrdersByShopId, trackGuestOrder } from '../controllers/order.controller.js';
import { isAuthenticatedUser, isAdmin, optionalAuthenticatedUser } from '../middleware/auth.middleware.js';
import { paymentLimiter } from '../middleware/rateLimiters.js';

const orderRouter = Router();

// Recommendations logic
orderRouter.get('/recommendations/:productId', getFrequentlyBoughtTogether);

// Other routes
orderRouter.post('/', optionalAuthenticatedUser, paymentLimiter, createOrder);
orderRouter.post('/guest-track', paymentLimiter, trackGuestOrder);
orderRouter.get('/', isAuthenticatedUser, isAdmin, getAllOrders);
orderRouter.get('/my-orders', isAuthenticatedUser, getMyOrders); 
orderRouter.get('/shop/:shopId', isAuthenticatedUser, isAdmin, getOrdersByShopId);
orderRouter.get('/:id', isAuthenticatedUser, getOrderById); // Standard REST path
orderRouter.patch('/:id/status', isAuthenticatedUser, isAdmin, updateOrderStatus);

export default orderRouter;