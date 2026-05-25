import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

/**
 * @description Generates a highly secure Access Token for User Authentication
 * @param {string} userId - The MongoDB User ID
 * @returns {string} - Signed JWT Token
 */
const generatedAccessToken = async (userId) => {
    try {
        // 1. Check if Secret Key exists
        if (!process.env.SECRET_KEY_ACCESS_TOKEN) {
            throw new Error("Access Token Secret Key is missing in .env");
        }

        // 2. Token Payload (Sirf zaruri info rakhein, sensitive data nahi)
        const payload = {
            id: userId
        };

        // 3. Signing the token
        // Security: '5h' (5 hours) is standard. Bahut bada duration mat rakhna.
        const token = jwt.sign(
            payload, 
            process.env.SECRET_KEY_ACCESS_TOKEN, 
            { 
                expiresIn: '5h',
                algorithm: 'HS256' // Explicitly mentioning the algorithm
            }
        );

        return token;

    } catch (error) {
        console.error("❌ JWT Generation Error:", error.message);
        return null;
    }
};

export default generatedAccessToken;