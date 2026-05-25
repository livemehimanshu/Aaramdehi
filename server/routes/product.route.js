import { Router } from 'express';
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getDashboardStats
} from '../controllers/product.controller.js';

// ✅ FIX: Named import use karein { isAuthenticatedUser, isAdmin }
import { isAuthenticatedUser, isAdmin } from '../middleware/auth.middleware.js';

import { upload } from "../middleware/multer.js";
const productRouter = Router();

/**
 * @routes - PRODUCT API ENDPOINTS (Aaramdehi Project)
 */

// 2. Protected Routes (Sirf Authenticated Admin ke liye) - MUST COME BEFORE public /:id route
// Dashboard stats
productRouter.get('/admin/stats', isAuthenticatedUser, isAdmin, getDashboardStats);

// Add new product
productRouter.post('/create', isAuthenticatedUser, isAdmin, upload.array('images', 10), createProduct);

// Update product
productRouter.put('/:id', isAuthenticatedUser, isAdmin, upload.array('images', 10), updateProduct);

// Delete product
productRouter.delete('/:id', isAuthenticatedUser, isAdmin, deleteProduct);

// 1. Public Routes (Sab dekh sakte hain) - MUST COME AFTER protected routes
productRouter.get('/', getAllProducts);  // Get all products
productRouter.get('/:id', getProductById);  // Get single product

export default productRouter;