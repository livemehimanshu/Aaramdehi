import mongoose from "mongoose";

const connectDB = async () => {
    try {
        // Force 127.0.0.1 if using localhost to avoid DNS issues in some Node versions
        let url = process.env.MONGODB_URI;
        if (url.includes('localhost')) {
            url = url.replace('localhost', '127.0.0.1');
        }
        
        console.log("🔗 Database Connection Attempt...");

        await mongoose.connect(url, {
            serverSelectionTimeoutMS: 5000,
        });

        console.log("✅ Connected to MongoDB Successfully!");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
        process.exit(1);
    }
};

export default connectDB;