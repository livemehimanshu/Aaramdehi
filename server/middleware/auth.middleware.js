import jwt from 'jsonwebtoken';
import { findById } from '../config/db.js';

// 1. Authenticated User Middleware
export const isAuthenticatedUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = (authHeader && authHeader.startsWith('Bearer ')) 
                      ? authHeader.split(' ')[1] 
                      : req.cookies?.accessToken;

        if (!token) {
            return res.status(401).json({
                message: "Access Denied. Please Login.",
                success: false
            });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);

        const userId = decoded?.id || decoded?._id; 
        if (!userId) {
            return res.status(401).json({ message: "Invalid token payload", success: false });
        }

        const user = await findById('users', userId);
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        req.user = user;
        req.userId = userId;

        next(); 

    } catch (error) {
        console.error("Auth Error:", error.message);
        return res.status(401).json({
            message: error.name === 'TokenExpiredError' ? "Session Expired" : "Unauthorized",
            success: false,
            error: error.message
        });
    }
};

// 2. Admin Check Middleware (Isse SyntaxError solve ho jayega)
export const isAdmin = async (req, res, next) => {
    try {
        // req.user humein 'isAuthenticatedUser' se milta hai
        if (!req.user || req.user.role !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "Access Denied: Admin privileges required."
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error in Admin Middleware",
            error: error.message
        });
    }
};