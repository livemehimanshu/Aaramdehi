import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import UserModel from '../models/user.model.js';

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const adminExists = await UserModel.findOne({ email: 'admin@aaramdehi.com' });
        
        if (adminExists) {
            console.log('❌ Admin already exists');
            process.exit(0);
        }

        // Hash password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash('Admin@12345', salt);

        // Create admin user
        const admin = new UserModel({
            name: 'Admin User',
            email: 'admin@aaramdehi.com',
            mobile: 9876543210,
            password: hashedPassword,
            role: 'ADMIN',
            status: 'Active',
            verify_email: true
        });

        await admin.save();
        console.log('✅ Admin created successfully!');
        console.log('📧 Email: admin@aaramdehi.com');
        console.log('🔐 Password: Admin@12345');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createAdmin();
