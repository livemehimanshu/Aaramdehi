import jwt from 'jsonwebtoken';
import { updateById } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const generatedRefreshToken = async (userId) => {
    try {
        if (!process.env.SECRET_KEY_REFRESH_TOKEN) {
            throw new Error("Refresh Token Secret Key is missing in .env");
        }

        const payload = {
            id: userId,
        };

        const token = jwt.sign(
            payload,
            process.env.SECRET_KEY_REFRESH_TOKEN,
            {
                expiresIn: '7d',
                algorithm: 'HS256'
            }
        );

        await updateById('users', userId, {
            refresh_token: token
        });

        return token;

    } catch (error) {
        console.error("❌ Refresh Token Generation Error:", error.message);
        return null;
    }
};

export default generatedRefreshToken;
