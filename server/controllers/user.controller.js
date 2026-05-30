import { findById, updateById, db, findByQuery, create } from '../config/db.js';
import bcrypt from 'bcryptjs';
import generatedOtp from '../utils/generatedOtp.js';
import sendEmail from '../config/sendEmail.js';
import verifyEmailTemplate from '../utils/verifyEmailTemplate.js';
import generatedAccessToken from '../utils/generatedAccessToken.js';
import generatedRefreshToken from '../utils/generatedRefreshToken.js';
import forgotPasswordTemplate from '../utils/forgotPasswordTemplate.js';
import { uploadImageCloudinary } from "../utils/uploadImageCloudinary.js";

const COLLECTION = 'users';

// --- AUTH CONTROLLERS ---

export const registerUserController = async (req, res) => {
    try {
        const { name, email, password, mobile } = req.body;
        if (!name || !email || !password) return res.status(400).json({ success: false, message: "Provide name, email, password" });

        const existingUser = await findByQuery(COLLECTION, 'email', email.toLowerCase());
        if (existingUser.length > 0) return res.status(400).json({ success: false, message: "Email already registered" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const otp = generatedOtp();
        
        const userData = {
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            mobile: mobile || "",
            role: "USER",
            isVerified: false,
            forgot_password_otp: otp,
            forgot_password_expiry: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString()
        };

        const userId = await create(COLLECTION, userData);
        
        await sendEmail({
            sendTo: email,
            subject: "Verify your email - Aaramdehi",
            html: verifyEmailTemplate({ name, url: otp })
        });

        return res.status(201).json({ success: true, message: "User registered. Please verify OTP." });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const verifyEmailController = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const users = await findByQuery(COLLECTION, 'email', email.toLowerCase());
        const user = users?.[0];

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        if (user.forgot_password_otp !== otp) return res.status(400).json({ success: false, message: "Invalid OTP" });

        const expiry = new Date(user.forgot_password_expiry);
        if (expiry < new Date()) return res.status(400).json({ success: false, message: "OTP expired" });

        await updateById(COLLECTION, user._id, { 
            isVerified: true, 
            forgot_password_otp: null, 
            forgot_password_expiry: null 
        });

        const accessToken = await generatedAccessToken(user._id);
        const refreshToken = await generatedRefreshToken(user._id);

        if (!accessToken || !refreshToken) {
            throw new Error("Token generation failed. Check server environment variables.");
        }

        return res.json({ 
            success: true, 
            message: "Email verified", 
            accessToken, 
            user: { _id: user._id, name: user.name, email: user.email, role: user.role } 
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Please provide both email and password." });
        }

        const users = await findByQuery(COLLECTION, 'email', email.toLowerCase());
        const user = users?.[0];

        if (!user) return res.status(400).json({ success: false, message: "Invalid credentials" });

        // ✅ Bcrypt Safety: Check if password exists in the database record
        if (!user.password) {
            console.error(`❌ [Login Controller Error]: User ${user.email} found but has no password field in DB.`);
            return res.status(500).json({ success: false, message: "Account setup error. Please contact support." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

        if (!user.isVerified) {
            const otp = generatedOtp();
            await updateById(COLLECTION, user._id, { 
                forgot_password_otp: otp, 
                forgot_password_expiry: new Date(Date.now() + 10 * 60 * 1000).toISOString() 
            });
            await sendEmail({
                sendTo: user.email,
                subject: "Verify your email - Aaramdehi",
                html: verifyEmailTemplate({ name: user.name, url: otp })
            });
            console.log(`🛡️ [Verification Needed]: ${email} | New OTP sent. Returning 403.`);
            return res.status(403).json({ success: false, needsVerification: true, message: "Please verify your email" });
        }

        const accessToken = await generatedAccessToken(user._id);
        const refreshToken = await generatedRefreshToken(user._id);

        // ✅ Token Validation: Ensure tokens were generated successfully
        if (!accessToken || !refreshToken) {
            console.error("❌ [Login Controller Error]: JWT generation failed. Check server .env file.");
            return res.status(500).json({ success: false, message: "Authentication service unavailable." });
        }

        return res.json({ 
            success: true, 
            accessToken, 
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } 
        });
    } catch (error) {
        console.error("❌ [Login Controller Error]:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const forgotPasswordController = async (req, res) => {
    try {
        const { email } = req.body;
        const users = await findByQuery(COLLECTION, 'email', email.toLowerCase());
        const user = users?.[0];

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const otp = generatedOtp();
        await updateById(COLLECTION, user._id, { 
            forgot_password_otp: otp, 
            forgot_password_expiry: new Date(Date.now() + 10 * 60 * 1000).toISOString() 
        });

        await sendEmail({
            sendTo: email,
            subject: "Reset your password - Aaramdehi",
            html: forgotPasswordTemplate({ name: user.name, otp })
        });

        return res.json({ success: true, message: "OTP sent to email" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const resetPasswordController = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const users = await findByQuery(COLLECTION, 'email', email.toLowerCase());
        const user = users?.[0];

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        if (user.forgot_password_otp !== otp) return res.status(400).json({ success: false, message: "Invalid OTP" });

        const expiry = new Date(user.forgot_password_expiry);
        if (expiry < new Date()) return res.status(400).json({ success: false, message: "OTP expired" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await updateById(COLLECTION, user._id, { 
            password: hashedPassword, 
            forgot_password_otp: null, 
            forgot_password_expiry: null 
        });

        return res.json({ success: true, message: "Password reset successful" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getUserDetailsController = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id || req.user?.id;
        const user = await findById(COLLECTION, userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const { password, forgot_password_otp, forgot_password_expiry, ...rest } = user;
        return res.json({ success: true, user: rest });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const uploadAvatarController = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;
        if (!req.file) return res.status(400).json({ success: false, message: "Please upload an image" });

        const result = await uploadImageCloudinary(req.file.buffer, "avatars");
        if (!result.success) return res.status(500).json({ success: false, message: "Upload failed" });

        const updatedUser = await updateById(COLLECTION, userId, { avatar: result.url });
        return res.json({ success: true, avatar: result.url, user: updatedUser });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateUserDetailsController = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;
        const { name, mobile, gender } = req.body;
        const updatedUser = await updateById(COLLECTION, userId, { name, mobile, gender });
        return res.json({ success: true, user: updatedUser });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const changePasswordController = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;
        const { currentPassword, newPassword } = req.body;

        const user = await findById(COLLECTION, userId);
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: "Incorrect current password" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await updateById(COLLECTION, userId, { password: hashedPassword });
        return res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 1. Update Profile Details
export const updateProfile = async (req, res) => {
    try {
        // ✅ सुरक्षा: सुनिश्चित करें कि टोकन से आई ID ही इस्तेमाल हो रही है
        const userId = req.userId || req.user?._id || req.user?.id;
        if (!userId) return res.status(401).json({ success: false, message: "Unauthenticated" });

        const { name, gender, mobile } = req.body;
        const updateData = { name, gender, mobile }; // Sanitized data

        const updatedUser = await updateById(COLLECTION, userId, updateData);
        return res.json({ success: true, user: updatedUser });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Get All Addresses
export const getUserAddresses = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;
        const snapshot = await db.ref(`${COLLECTION}/${userId}/addresses`).once('value');
        const addresses = snapshot.val() ? Object.entries(snapshot.val()).map(([id, data]) => ({ id, ...data })) : [];
        return res.json({ success: true, addresses });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Add New Address with Default Logic
export const addUserAddress = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id || req.user?.id;
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        // ✅ सुरक्षा: केवल ज़रूरी फील्ड्स ही स्वीकार करें (NoSQL Injection बचाव)
        const { name, mobile, pincode, locality, detail, type, isDefault } = req.body;
        const sanitizedAddress = { name, mobile, pincode, locality, detail, type, isDefault: !!isDefault };

        const addressRef = db.ref(`${COLLECTION}/${userId}/addresses`);

        // If isDefault is true, unset other default addresses
        if (sanitizedAddress.isDefault) {
            const snapshot = await addressRef.once('value');
            const existing = snapshot.val();
            if (existing) {
                const updates = {};
                Object.keys(existing).forEach(key => {
                    updates[`${key}/isDefault`] = false;
                });
                await addressRef.update(updates);
            }
        }

        await addressRef.push(sanitizedAddress);
        return res.json({ success: true, message: "Address added successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Delete Account (Irreversible)
export const deleteAccount = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;
        
        // Step 1: Delete from Realtime Database
        await db.ref(`${COLLECTION}/${userId}`).remove();
        
        // Step 2: Clear Cookies
        res.clearCookie('accessToken');
        return res.json({ success: true, message: "Account data deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Get My Coupons
export const getMyCoupons = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;
        const snapshot = await db.ref('coupons').once('value');
        const allCoupons = snapshot.val() ? Object.values(snapshot.val()) : [];
        
        // Logic: Filter coupons available for this user or unused
        const userCoupons = allCoupons.filter(c => !c.usedBy || !c.usedBy[userId]);
        return res.json({ success: true, data: userCoupons });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};