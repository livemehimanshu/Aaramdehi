import multer from 'multer';
import path from 'path';

/**
 * @description Highly Secure Multer Configuration
 */

// 1. Storage Strategy: Memory storage (Direct Cloudinary upload ke liye)
const storage = multer.memoryStorage();

// 2. File Filter: Check if the file is actually an image
const fileFilter = (req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png|webp/;
    
    // Check Extension
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    
    // Check MimeType
    const mimetype = allowedFileTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error("Error: Only Images (JPEG, JPG, PNG, WEBP) are allowed!"));
    }
};

// 3. Multer Instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit (Aaramdehi project ke liye thoda badha diya hai)
        files: 10 // Multi-image support for products
    }
});

// ✅ FIX: Default export ki jagah Named Export use karein
export { upload };