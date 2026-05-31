import { Router } from 'express';
import { createOrder, getMyOrders, getFrequentlyBoughtTogether, getOrderById, getAllOrders, updateOrderStatus, getOrdersByShopId } from '../controllers/order.controller.js';
import { isAuthenticatedUser } from '../middleware/auth.middleware.js';

const orderRouter = Router();

// Recommendations logic
orderRouter.get('/recommendations/:productId', getFrequentlyBoughtTogether);
orderRouter.get('/details/:id', isAuthenticatedUser, getOrderById); // ✅ New Details Route

// Other routes
orderRouter.post('/', isAuthenticatedUser, createOrder);
orderRouter.get('/', isAuthenticatedUser, getAllOrders);
orderRouter.get('/my-orders', isAuthenticatedUser, getMyOrders);
orderRouter.get('/shop/:shopId', getOrdersByShopId);
orderRouter.get('/:id', isAuthenticatedUser, getOrderById);
orderRouter.patch('/:id/status', isAuthenticatedUser, updateOrderStatus);

export default orderRouter;