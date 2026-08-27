import { Router } from 'express';
import { createOrder, getMyOrders, getFrequentlyBoughtTogether, getOrderById, getAllOrders, updateOrderStatus, getOrdersByShopId } from '../controllers/order.controller.js';
import { isAuthenticatedUser, isAdmin, optionalAuthenticatedUser } from '../middleware/auth.middleware.js';

const orderRouter = Router();

// Recommendations logic
orderRouter.get('/recommendations/:productId', getFrequentlyBoughtTogether);

// Other routes
orderRouter.post('/', optionalAuthenticatedUser, createOrder);
orderRouter.get('/', isAuthenticatedUser, isAdmin, getAllOrders);
orderRouter.get('/my-orders', isAuthenticatedUser, getMyOrders); 
orderRouter.get('/shop/:shopId', isAuthenticatedUser, isAdmin, getOrdersByShopId);
orderRouter.get('/:id', isAuthenticatedUser, getOrderById); // Standard REST path
orderRouter.patch('/:id/status', isAuthenticatedUser, isAdmin, updateOrderStatus);

export default orderRouter;