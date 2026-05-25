import mongoose from 'mongoose';

const seoSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["GLOBAL", "PRODUCT", "CATEGORY", "PAGE"],
        required: true,
        unique: true,
        sparse: true
    },
    pageTitle: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 60
    },
    metaDescription: {
        type: String,
        required: true,
        minlength: 50,
        maxlength: 160
    },
    keywords: [String],
    
    // For GLOBAL SEO
    siteTitle: String,
    siteDescription: String,
    brandName: {
        type: String,
        default: "Aaramdehi"
    },

    // Open Graph / Social Media
    ogImage: String,
    ogTitle: String,
    ogDescription: String,

    // Structured Data / Schema
    schema: mongoose.Schema.Types.Mixed,

    // Robots Meta
    robotsIndex: {
        type: Boolean,
        default: true
    },
    robotsFollow: {
        type: Boolean,
        default: true
    },

    // Canonical URL
    canonical: String,

    // For tracking
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User" // ✅ User model ka naam 'User' hai
    },

}, {
    timestamps: true
});

const SeoModel = mongoose.model("Seo", seoSchema);

export default SeoModel;
