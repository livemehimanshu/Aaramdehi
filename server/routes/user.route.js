import { Router } from 'express';
import { 
    uploadAvatarController, 
    updateUserDetailsController, // ✅ Import the new controller
    getUserDetailsController,
    changePasswordController,
    updateProfile,
    getUserAddresses,
    addUserAddress,
    getMyCoupons,
    deleteAccount
} from '../controllers/user.controller.js'; // loginController is not used here

// ✅ Fix: Named import use kiya hai kyunki auth.middleware.js mein 'export const' hai
import { isAuthenticatedUser } from '../middleware/auth.middleware.js';

import { upload } from "../middleware/multer.js";
import { authLimiter } from '../middleware/rateLimiters.js';

const userRouter = Router();

/**
 * @routes - Aaramdehi User Routes
 */

// --- 2. Private Routes (Sirf logged-in users ke liye) ---

// Avatar Image Upload (Multer + Cloudinary)
// ✅ Fix: 'auth' ki jagah 'isAuthenticatedUser' use kiya gaya hai
userRouter.put('/upload-avatar', isAuthenticatedUser, upload.single('avatar'), uploadAvatarController);

// 🛡️ AdminRoute के लिए: यूजर डिटेल्स और रोल वेरीफाई करें
userRouter.get('/details', isAuthenticatedUser, getUserDetailsController);

// ✅ Update User Profile Details (Name, Email, Mobile)
userRouter.put('/update-profile', isAuthenticatedUser, updateProfile);

// ✅ Address & Coupon Routes
userRouter.get('/addresses', isAuthenticatedUser, getUserAddresses);
userRouter.post('/address/add', isAuthenticatedUser, addUserAddress);
userRouter.get('/my-coupons', isAuthenticatedUser, getMyCoupons);
userRouter.delete('/delete-account', isAuthenticatedUser, deleteAccount);

// ✅ Change Password Route
userRouter.put('/change-password', authLimiter, isAuthenticatedUser, changePasswordController);

// User Logout
// ✅ Allow logout without strict auth check to clear cookies even if JWT is expired
userRouter.get('/logout', (req, res) => {
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