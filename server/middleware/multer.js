import multer from 'multer';
import path from 'path';

/**
 * @description Highly Secure Multer Configuration (Supports Images, 3D Models, and Video Banners)
 */

// 1. Storage Strategy: Memory storage (Direct Cloudinary upload ke liye)
const storage = multer.memoryStorage();

// 2. File Filter: Allow images, 3D models (.glb/.gltf), and Videos (.mp4/.webm/.mov/etc.)
const fileFilter = (req, file, cb) => {
    // Check Extension
    const allowedFileTypes = /jpeg|jpg|png|webp|glb|gltf|mp4|webm|mkv|avi|mov/;
    
    // Check MimeType
    const allowedMimeTypes = /jpeg|jpg|png|webp|model\/gltf\+binary|model\/gltf\+json|application\/octet-stream|video\/mp4|video\/webm|video\/x-matroska|video\/quicktime|video\/x-msvideo/;
    
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype ? allowedMimeTypes.test(file.mimetype.toLowerCase()) : false;

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error("Error: Only image files, 3D models (.glb, .gltf), and video files (.mp4, .webm, .mov, etc.) are allowed."));
    }
};

// 3. Multer Instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit (Video banner uploads ke liye adjust kiya hai)
        files: 100 // Support many product images and variant image uploads
    }
});

// ✅ Named Export
export { upload };