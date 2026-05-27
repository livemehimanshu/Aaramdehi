import express from 'express';
import {
  getAllCategories,
  getActiveCategories,
  createCategory,
  updateCategoryController, // Corrected import name
  deleteCategory,
} from '../controllers/category.controller.js';
import { isAuthenticatedUser, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getAllCategories);
router.get('/active', getActiveCategories); // For frontend display
router.post('/create', isAuthenticatedUser, isAdmin, createCategory); // ✅ Fixed undefined authMiddleware
router.put('/:id', isAuthenticatedUser, isAdmin, updateCategoryController); 
router.delete('/:id', isAuthenticatedUser, isAdmin, deleteCategory);

export default router;