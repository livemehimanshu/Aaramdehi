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
router.get("/", getAllCategories);
router.get("/get-all", getAllCategories);
router.get("/get-active", getActiveCategories);
router.get("/active", getActiveCategories); // ✅ Added alias for consistency
router.get("/get/:id", getCategoryById);
router.get("/:id", getCategoryById);

// Admin Only Routes (With Image Upload)
// ✅ Fixed: Accepting either 'icon' or 'image' field to avoid Multer parsing failures
router.post("/create", isAuthenticatedUser, isAdmin, upload.fields([{ name: 'icon', maxCount: 1 }, { name: 'image', maxCount: 1 }]), createCategory);
router.put("/:id", isAuthenticatedUser, isAdmin, upload.fields([{ name: 'icon', maxCount: 1 }, { name: 'image', maxCount: 1 }]), updateCategoryController);
router.put("/update/:id", isAuthenticatedUser, isAdmin, upload.fields([{ name: 'icon', maxCount: 1 }, { name: 'image', maxCount: 1 }]), updateCategoryController);
router.delete("/:id", isAuthenticatedUser, isAdmin, deleteCategory);
router.delete("/delete/:id", isAuthenticatedUser, isAdmin, deleteCategory);

export default router;