import express from 'express';
import { isAuthenticatedUser, isAdmin } from '../middleware/auth.middleware.js';
import {
  getAllShops,
  getShopById,
  createShop,
  updateShop,
  deleteShop,
  updateShopBalance,
} from '../controllers/shops.controller.js';

const router = express.Router();

// Public routes (if needed)
router.get('/', getAllShops);
router.get('/:id', getShopById);

// Admin routes
router.post('/', isAuthenticatedUser, isAdmin, createShop);
router.put('/:id', isAuthenticatedUser, isAdmin, updateShop);
router.delete('/:id', isAuthenticatedUser, isAdmin, deleteShop);
router.put('/:id/balance', isAuthenticatedUser, isAdmin, updateShopBalance);

export default router;
