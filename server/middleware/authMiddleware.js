import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model.js';

export const isAuthenticatedUser = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken || req.headers.accesstoken || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Login first to access this resource', success: false });
        }

        const decodedData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        req.user = await UserModel.findById(decodedData.id).select('-password -forgot_password_otp -forgot_password_expiry');
        req.userId = decodedData.id; 
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') return res.status(401).json({ message: 'Invalid Token, please login again', success: false });
        if (error.name === 'TokenExpiredError') return res.status(401).json({ message: 'Session expired, please login again', success: false });
        return res.status(500).json({ message: error.message, success: false });
    }
};