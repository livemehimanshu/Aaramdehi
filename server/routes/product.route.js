import { Router } from 'express';
import {
    getAllProducts,
    getProductById,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
    getDashboardStats,
    analyzeRoom,
    addProductReview,
    deleteProductReview
} from '../controllers/product.controller.js';

// ✅ Protected Middleware
import { isAuthenticatedUser, isAdmin } from '../middleware/auth.middleware.js';

import { upload } from "../middleware/multer.js";
const productRouter = Router();

/**
 * @routes - PRODUCT API ENDPOINTS (Aaramdehi Project)
 */

// 2. Protected Routes (Sirf Authenticated Admin ke liye) - MUST COME BEFORE public /:id route
// Dashboard stats
productRouter.get('/admin/stats', isAuthenticatedUser, isAdmin, getDashboardStats);

// ✅ FIX: upload.fields() ki jagah upload.any() use kiya hai
// Isse 'images', 'model3d', aur dynamic 'color_images_0', 'color_images_1' sabhi accept ho jayenge without 500 Error
productRouter.post('/create', isAuthenticatedUser, isAdmin, upload.any(), createProduct);

// Update product
productRouter.put('/:id', isAuthenticatedUser, isAdmin, upload.any(), updateProduct);

// Delete product
productRouter.delete('/:id', isAuthenticatedUser, isAdmin, deleteProduct);

// 1. Public Routes (Sab dekh sakte hain) - MUST COME AFTER protected routes
productRouter.post('/analyze-room', analyzeRoom);
productRouter.post('/:id/review', isAuthenticatedUser, upload.single('photo'), addProductReview);
productRouter.delete('/:id/review/:reviewId', isAuthenticatedUser, isAdmin, deleteProductReview);
productRouter.get('/', getAllProducts);  // Get all products
productRouter.get('/slug/:slug', getProductBySlug); // Debug slug-to-product lookup
productRouter.get('/:id', getProductById);  // Get single product

export default productRouter;