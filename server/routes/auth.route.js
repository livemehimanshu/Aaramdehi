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
import { authLimiter, passwordResetLimiter, otpLimiter } from '../middleware/rateLimiters.js';
import { validateRequestBody, validateRequest } from '../middleware/requestValidator.js';

const authRouter = Router();

authRouter.route('/register')
    .post(validateRequest, authLimiter, validateRequestBody(['name', 'email', 'password']), registerUserController)
    .all((req, res) => res.status(405).json({ success: false, message: "Method Not Allowed. Use POST for registration." }));

authRouter.route('/login')
    .post(validateRequest, authLimiter, loginController)
    .all((req, res) => res.status(405).json({ success: false, message: "Method Not Allowed. Use POST for login." }));

authRouter.post('/verify-email', otpLimiter, verifyEmailController);
authRouter.post('/verify-otp', otpLimiter, verifyEmailController); 

authRouter.post('/forgot-password', passwordResetLimiter, forgotPasswordController); 
authRouter.post('/reset-password', passwordResetLimiter, resetPasswordController);

authRouter.get('/me', isAuthenticatedUser, getUserDetailsController); // 🛡️ Admin verification endpoint

export default authRouter;