import { Router } from 'express';
import { 
    uploadAvatarController, 
} from '../controllers/user.controller.js'; // loginController is not used here
import { getUserDetailsController } from '../controllers/user.controller.js'; // नया कंट्रोलर इम्पोर्ट करें

// ✅ Fix: Named import use kiya hai kyunki auth.middleware.js mein 'export const' hai
import { isAuthenticatedUser } from '../middleware/auth.middleware.js';

import { upload } from "../middleware/multer.js";
import rateLimit from 'express-rate-limit';

const userRouter = Router();

/**
 * 🛡️ Security: Rate Limiter
 * Zyada requests ko block karne ke liye (Brute force protection)
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        message: "Too many attempts from this IP, please try again after 15 minutes",
        error: true,
        success: false
    },
    standardHeaders: true, 
    legacyHeaders: false,
});

/**
 * @routes - Aaramdehi User Routes
 */

// --- 2. Private Routes (Sirf logged-in users ke liye) ---

// Avatar Image Upload (Multer + Cloudinary)
// ✅ Fix: 'auth' ki jagah 'isAuthenticatedUser' use kiya gaya hai
userRouter.put('/upload-avatar', isAuthenticatedUser, upload.single('avatar'), uploadAvatarController);

// 🛡️ AdminRoute के लिए: यूजर डिटेल्स और रोल वेरीफाई करें
userRouter.get('/details', isAuthenticatedUser, getUserDetailsController);

// User Logout
userRouter.get('/logout', isAuthenticatedUser, (req, res) => {
    try {
        // Cookies clear kar rahe hain
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None'
        });
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None'
        });

        return res.status(200).json({ 
            message: "Logged out successfully", 
            success: true,
            error: false 
        });
    } catch (error) {
        return res.status(500).json({ 
            message: error.message, 
            error: true, 
            success: false 
        });
    }
});

export default userRouter;