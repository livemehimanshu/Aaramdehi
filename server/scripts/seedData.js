import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import CategoryModel from '../models/category.model.js';
import ProductModel from '../models/product.model.js';

const seedData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get or create categories
        let categories = await CategoryModel.find({});
        
        if (categories.length === 0) {
            categories = await CategoryModel.insertMany([
                {
                    name: 'Bedroom',
                    slug: 'bedroom',
                    isActive: true
                },
                {
                    name: 'Living Room',
                    slug: 'living-room',
                    isActive: true
                },
                {
                    name: 'Kitchen',
                    slug: 'kitchen',
                    isActive: true
                },
                {
                    name: 'Lighting',
                    slug: 'lighting',
                    isActive: true
                },
                {
                    name: 'Decor',
                    slug: 'decor',
                    isActive: true
                }
            ]);
            console.log(`✅ Created ${categories.length} categories`);
        } else {
            console.log(`✅ Found ${categories.length} existing categories`);
        }

        // Create Products
        const existingProducts = await ProductModel.countDocuments({});
        
        if (existingProducts === 0) {
            const products = await ProductModel.insertMany([
                {
                    name: 'Wooden Bed Frame',
                    description: 'Beautiful wooden bed frame for your bedroom',
                    category: categories[0]._id,
                    price: 15000,
                    discountPrice: 12000,
                    stock: 50,
                    image: 'https://via.placeholder.com/400x300?text=Wooden+Bed',
                    status: 'Active'
                },
                {
                    name: 'Sofa Set',
                    description: 'Comfortable 3-seater sofa for living room',
                    category: categories[1]._id,
                    price: 25000,
                    discountPrice: 20000,
                    stock: 30,
                    image: 'https://via.placeholder.com/400x300?text=Sofa+Set',
                    status: 'Active'
                },
                {
                    name: 'Dining Table',
                    description: 'Wooden dining table for 6 people',
                    category: categories[2]._id,
                    price: 18000,
                    discountPrice: 15000,
                    stock: 20,
                    image: 'https://via.placeholder.com/400x300?text=Dining+Table',
                    status: 'Active'
                },
                {
                    name: 'LED Chandelier',
                    description: 'Modern LED chandelier for room lighting',
                    category: categories[3]._id,
                    price: 5000,
                    discountPrice: 3999,
                    stock: 100,
                    image: 'https://via.placeholder.com/400x300?text=LED+Chandelier',
                    status: 'Active'
                },
                {
                    name: 'Decorative Wall Art',
                    description: 'Modern decorative wall art set',
                    category: categories[4]._id,
                    price: 2000,
                    discountPrice: 1500,
                    stock: 80,
                    image: 'https://via.placeholder.com/400x300?text=Wall+Art',
                    status: 'Active'
                },
                {
                    name: 'Cotton Pillow',
                    description: 'Soft cotton pillow for bedroom',
                    category: categories[0]._id,
                    price: 800,
                    discountPrice: 599,
                    stock: 200,
                    image: 'https://via.placeholder.com/400x300?text=Cotton+Pillow',
                    status: 'Active'
                },
                {
                    name: 'Coffee Table',
                    description: 'Modern coffee table for living room',
                    category: categories[1]._id,
                    price: 8000,
                    discountPrice: 6500,
                    stock: 40,
                    image: 'https://via.placeholder.com/400x300?text=Coffee+Table',
                    status: 'Active'
                },
                {
                    name: 'Floor Lamp',
                    description: 'Elegant floor lamp with adjustable head',
                    category: categories[3]._id,
                    price: 3500,
                    discountPrice: 2799,
                    stock: 60,
                    image: 'https://via.placeholder.com/400x300?text=Floor+Lamp',
                    status: 'Active'
                }
            ]);
            console.log(`✅ Created ${products.length} products`);
        } else {
            console.log(`✅ Found ${existingProducts} existing products`);
        }

        console.log('✅ Seed data completed successfully!');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

seedData();
