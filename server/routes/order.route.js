import { Router } from 'express';
import { createOrder, getMyOrders, getFrequentlyBoughtTogether, getOrderById, getAllOrders, updateOrderStatus, getOrdersByShopId } from '../controllers/order.controller.js';
import { isAuthenticatedUser } from '../middleware/auth.middleware.js';

const orderRouter = Router();

// Recommendations logic
orderRouter.get('/recommendations/:productId', getFrequentlyBoughtTogether);

// Other routes
orderRouter.post('/', isAuthenticatedUser, createOrder);
orderRouter.get('/', isAuthenticatedUser, getAllOrders);
orderRouter.get('/my-orders', isAuthenticatedUser, getMyOrders); 
orderRouter.get('/shop/:shopId', getOrdersByShopId);
orderRouter.get('/:id', isAuthenticatedUser, getOrderById); // Standard REST path
orderRouter.patch('/:id/status', isAuthenticatedUser, updateOrderStatus);

export default orderRouter;