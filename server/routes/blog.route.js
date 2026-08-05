import express from 'express';
import { createBlog, getAllBlogs, getBlogByIdOrSlug, updateBlog, deleteBlog } from '../controllers/blog.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const blogRouter = express.Router();

// Public Routes
blogRouter.get('/', getAllBlogs);
blogRouter.get('/:identifier', getBlogByIdOrSlug);

// Admin Protected Routes
blogRouter.post('/create', verifyToken, isAdmin, createBlog);
blogRouter.put('/:id', verifyToken, isAdmin, updateBlog);
blogRouter.delete('/:id', verifyToken, isAdmin, deleteBlog);

export default blogRouter;
