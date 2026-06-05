import express from 'express';
import { getAllRooms, createRoom, getRoomBySlug, updateRoom, deleteRoom } from '../controllers/room.controller.js';
import { isAuthenticatedUser, isAdmin } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/multer.js';

const router = express.Router();

// Public
router.get('/', getAllRooms);
router.get('/:slug', getRoomBySlug);

// Admin
router.post('/create', isAuthenticatedUser, isAdmin, upload.single('image'), createRoom);
router.put('/:id', isAuthenticatedUser, isAdmin, upload.single('image'), updateRoom);
router.delete('/:id', isAuthenticatedUser, isAdmin, deleteRoom);

export default router;