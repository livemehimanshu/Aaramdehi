import { Router } from 'express';
import { subscribeNewsletter, getNewsletterSubscribers, updateNewsletterSubscriber, deleteNewsletterSubscriber, sendNewsletter } from '../controllers/newsletter.controller.js';
import { isAuthenticatedUser, isAdmin } from '../middleware/auth.middleware.js';

const newsletterRouter = Router();

newsletterRouter.post('/subscribe', subscribeNewsletter);
newsletterRouter.get('/subscribers', isAuthenticatedUser, isAdmin, getNewsletterSubscribers);
newsletterRouter.put('/subscribers/:id', isAuthenticatedUser, isAdmin, updateNewsletterSubscriber);
newsletterRouter.delete('/subscribers/:id', isAuthenticatedUser, isAdmin, deleteNewsletterSubscriber);
newsletterRouter.post('/send', isAuthenticatedUser, isAdmin, sendNewsletter);

export default newsletterRouter;
