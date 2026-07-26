import { Router } from 'express';
import { subscribeNewsletter, getNewsletterSubscribers, sendNewsletter } from '../controllers/newsletter.controller.js';
import { isAuthenticatedUser, isAdmin } from '../middleware/auth.middleware.js';

const newsletterRouter = Router();

newsletterRouter.post('/subscribe', subscribeNewsletter);
newsletterRouter.get('/subscribers', isAuthenticatedUser, isAdmin, getNewsletterSubscribers);
newsletterRouter.post('/send', isAuthenticatedUser, isAdmin, sendNewsletter);

export default newsletterRouter;
