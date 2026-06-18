import multer from 'multer';
import path from 'path';

/**
 * @description Highly Secure Multer Configuration
 */

// 1. Storage Strategy: Memory storage (Direct Cloudinary upload ke liye)
const storage = multer.memoryStorage();

// 2. File Filter: Allow images and 3D model files (.glb/.gltf)
const fileFilter = (req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png|webp|glb|gltf/;
    const allowedMimeTypes = /jpeg|jpg|png|webp|model\/gltf\+binary|model\/gltf\+json|application\/octet-stream/;
    
    // Check Extension
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    
    // Check MimeType
    const mimetype = file.mimetype ? allowedMimeTypes.test(file.mimetype.toLowerCase()) : false;

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error("Error: Only image files and 3D models (.glb, .gltf) are allowed."));
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