import express from 'express';
import {
  getAllCategories,
  getActiveCategories,
  createCategory,
  updateCategoryController, // Corrected import name
  deleteCategory,
} from '../controllers/category.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js'; // Assuming you have an auth middleware

const router = express.Router();

router.get('/', getAllCategories);
router.get('/active', getActiveCategories); // For frontend display
router.post('/create', authMiddleware, createCategory);
router.put('/:id', authMiddleware, updateCategoryController); // Corrected usage
router.delete('/:id', authMiddleware, deleteCategory);

export default router;