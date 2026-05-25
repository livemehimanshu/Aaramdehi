import { Router } from 'express';
import { 
    registerUserController, 
    verifyEmailController, 
    loginController, 
    forgotPasswordController, 
    resetPasswordController,
    getUserDetailsController
} from '../controllers/user.controller.js';
import { isAuthenticatedUser } from '../middleware/auth.middleware.js';
import rateLimit from 'express-rate-limit';

const authRouter = Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        message: "Too many attempts from this IP, please try again after 15 minutes",
        error: true,
        success: false
    },
    standardHeaders: true, 
    legacyHeaders: false,
});

authRouter.post('/register', authLimiter, registerUserController);
authRouter.post('/verify-email', verifyEmailController);
authRouter.post('/verify-otp', verifyEmailController); // Added alias to fix 404
authRouter.post('/login', authLimiter, loginController);
authRouter.post('/forgot-password', authLimiter, forgotPasswordController); 
authRouter.post('/reset-password', authLimiter, resetPasswordController);
authRouter.get('/me', isAuthenticatedUser, getUserDetailsController); // 🛡️ Admin verification endpoint

export default authRouter;