import express from 'express';
import { createBlog, uploadBlogImage, getAllBlogs, getBlogByIdOrSlug, updateBlog, deleteBlog } from '../controllers/blog.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';
import multer from 'multer';

const blogImageUpload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 10 * 1024 * 1024 },
	fileFilter: (req, file, callback) => {
		if (file.mimetype?.startsWith('image/')) {
			return callback(null, true);
		}
		return callback(new Error('Only image files are allowed'));
	}
}).single('image');

const blogRouter = express.Router();

// Public Routes
blogRouter.get('/', getAllBlogs);
blogRouter.get('/:identifier', getBlogByIdOrSlug);

// Admin Protected Routes
blogRouter.post(
	'/upload-image',
	verifyToken,
	isAdmin,
	(req, res, next) => blogImageUpload(req, res, (error) => {
		if (error) {
			return res.status(400).json({ success: false, message: error.message || 'Invalid image upload' });
		}
		return next();
	}),
	uploadBlogImage
);
blogRouter.post('/create', verifyToken, isAdmin, createBlog);
blogRouter.put('/:id', verifyToken, isAdmin, updateBlog);
blogRouter.delete('/:id', verifyToken, isAdmin, deleteBlog);

export default blogRouter;
