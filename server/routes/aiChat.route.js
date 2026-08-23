import express from 'express';
import rateLimit from 'express-rate-limit';
import { handleAIChat } from '../controllers/aiChat.controller.js';

const router = express.Router();
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many assistant requests. Please try again later.' }
});

router.post('/chat-assistant', chatLimiter, handleAIChat);

export default router;
