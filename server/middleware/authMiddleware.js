import jwt from 'jsonwebtoken';
import { findById } from '../config/db.js';

export const isAuthenticatedUser = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken || req.headers.accesstoken || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Login first to access this resource', success: false });
        }

        const decodedData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await findById('users', decodedData.id);

        if (!user) {
            return res.status(401).json({ message: 'User not found', success: false });
        }

        const { password, forgot_password_otp, forgot_password_expiry, ...safeUser } = user;
        req.user = safeUser;
        req.userId = decodedData.id;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') return res.status(401).json({ message: 'Invalid Token, please login again', success: false });
        if (error.name === 'TokenExpiredError') return res.status(401).json({ message: 'Session expired, please login again', success: false });
        return res.status(500).json({ message: error.message, success: false });
    }
};