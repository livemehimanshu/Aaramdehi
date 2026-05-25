import express from 'express';
import { 
    createCategory, 
    getAllCategories, 
    getActiveCategories, 
    getCategoryById, 
    updateCategoryController, 
    deleteCategory 
} from '../controllers/category.controller.js';
import { isAuthenticatedUser, isAdmin } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/multer.js'; // Image handle karne ke liye

const router = express.Router();

// Public Routes
router.get("/get-all", getAllCategories);
router.get("/get-active", getActiveCategories);
router.get("/active", getActiveCategories); // ✅ Added alias for consistency
router.get("/get/:id", getCategoryById);

// Admin Only Routes (With Image Upload)
router.post("/create", isAuthenticatedUser, isAdmin, upload.single("icon"), createCategory);
router.put("/update/:id", isAuthenticatedUser, isAdmin, upload.single("icon"), updateCategoryController);
router.delete("/delete/:id", isAuthenticatedUser, isAdmin, deleteCategory);

export default router;