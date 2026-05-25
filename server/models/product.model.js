import mongoose from 'mongoose';

/**
 * @description Product Schema for Aaramdehi E-commerce
 */
const productSchema = new mongoose.Schema({
    // Basic Info
    name: {
        type: String,
        required: [true, "Product name is required"],
        trim: true,
        minlength: 3
    },
    brand: {
        type: String,
        trim: true,
        default: ""
    },
    description: {
        type: String,
        default: ""
    },
    shortDescription: {
        type: String,
        default: ""
    },

    // Category & Tags
    category: {
        type: String, // Dynamic categories support ke liye Enum hata diya gaya hai
        required: [true, "Category is required"]
    },
    subCategory: {
        type: String,
        default: ""
    },
    tags: [{
        type: String
    }],

    // Pricing
    mrp: {
        type: Number,
        required: [true, "MRP is required"],
        min: 0
    },
    sellingPrice: {
        type: Number,
        required: [true, "Selling price is required"],
        min: 0
    },
    discountPercent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },

    // Stock
    stock: {
        type: Number,
        required: [true, "Stock quantity is required"],
        default: 0,
        min: 0
    },
    sku: {
        type: String,
        unique: true, // ✅ Mongoose automatically creates an index for unique fields
        sparse: true,
        trim: true
    },

    // Images
    images: [{
        url: String,
        alt: String
    }],
    thumbnail: {
        type: String,
        default: ""
    },

    // SEO
    seoTitle: {
        type: String,
        default: ""
    },
    seoDescription: {
        type: String,
        default: ""
    },
    seoKeywords: [{
        type: String
    }],
    slug: {
        type: String,
        unique: true, // ✅ Unique index already created here
        lowercase: true,
        trim: true
    },

    // Specifications
    specifications: {
        material: String,
        dimensions: String,
        weight: String,
        color: String,
        warranty: String,
        features: [String]
    },

    // Ratings & Reviews
    ratings: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },

    // Status
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isNewArrival: {
        type: Boolean,
        default: false
    },

    // Admin & Ownership
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User", // ✅ User model ka naam 'User' hai
        required: true
    },
    lastModifiedBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User" // ✅ User model ka naam 'User' hai
    },

}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

/**
 * 🛠️ MANUAL INDEXES (Only for Non-Unique fields)
 */

// 1. Full-Text Search Index for Search Functionality
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// 2. Compound Index for Optimized Filtering
productSchema.index({ category: 1, isActive: 1 });

// ✅ NOTE: slug: 1 index removed from here to avoid "Duplicate schema index" warning.

const ProductModel = mongoose.model("Product", productSchema);

export default ProductModel;