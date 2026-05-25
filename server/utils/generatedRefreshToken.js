import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import UserModel from '../models/user.model.js'; // Model zaruri hai refresh token database mein save karne ke liye
dotenv.config();

/**
 * @description Generates a high-security Refresh Token
 * @param {string} userId - The MongoDB User ID
 * @returns {string} - Signed JWT Refresh Token
 */
const generatedRefreshToken = async (userId) => {
    try {
        // 1. Security Check: Ensure Secret Key exists
        if (!process.env.SECRET_KEY_REFRESH_TOKEN) {
            throw new Error("Refresh Token Secret Key is missing in .env");
        }

        // 2. Minimal Payload for Security
        const payload = {
            id: userId,
        };

        // 3. Generate Token with 7 Days Expiry
        const token = jwt.sign(
            payload, 
            process.env.SECRET_KEY_REFRESH_TOKEN, 
            { 
                expiresIn: '7d',
                algorithm: 'HS256'
            }
        );

        // 4. Database Sync (Security Best Practice)
        // Refresh token ko database mein update karna zaruri hai taaki 
        // zarurat padne par hum session ko revoke (logout) kar sakein.
        await UserModel.updateOne(
            { _id: userId },
            { refresh_token: token }
        );

        return token;

    } catch (error) {
        console.error("❌ Refresh Token Generation Error:", error.message);
        return null;
    }
};

export default generatedRefreshToken;