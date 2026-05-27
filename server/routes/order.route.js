import { Router } from 'express';
import { createOrder, getAllOrders, updateOrderStatus, getOrdersByShopId, getMyOrders } from '../controllers/order.controller.js';
import { isAuthenticatedUser, isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes (if any)
// router.get('/public-orders', getPublicOrders);
router.get('/my-orders', isAuthenticatedUser, getMyOrders); // ✅ New route for logged-in user's orders

// Admin routes
router.get('/', isAuthenticatedUser, isAdmin, getAllOrders);
router.post('/create', isAuthenticatedUser, createOrder);
router.get('/admin/all', isAuthenticatedUser, isAdmin, getAllOrders);
router.get('/shop/:shopId', isAuthenticatedUser, isAdmin, getOrdersByShopId); // ✅ Get orders by shop
router.put('/update-status/:id', isAuthenticatedUser, isAdmin, updateOrderStatus);
export default router;