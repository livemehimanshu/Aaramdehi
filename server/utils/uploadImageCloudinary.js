import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const buildCloudinaryFolderPath = (baseFolder = 'Aaramdehi_Uploads', itemName = '') => {
    const safeName = String(itemName || '')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    if (!safeName) return baseFolder;
    return `${baseFolder}/${safeName}`.replace(/\/+/g, '/');
};

export const uploadImageCloudinary = async (fileBuffer, folderName = "Aaramdehi_Uploads", options = {}) => {
    try {
        if (!process.env.CLOUDINARY_API_KEY) {
            throw new Error("Cloudinary credentials missing");
        }

        const uploadOptions = {
            folder: folderName,
            resource_type: "auto", // 👈 Automatic Image / Video detection
            ...options
        };

        const { noTransformation, ...cloudinaryOptions } = uploadOptions;

        // ✅ FIX: Image transformation tabhi apply hogi jab explicitly request ki gayi ho aur file video na ho
        if (!Object.prototype.hasOwnProperty.call(uploadOptions, 'transformation') && !noTransformation) {
            // Agar options mein explicitly video specify na kiya ho, tabhi image transformations add hongi
            if (uploadOptions.resource_type !== "video") {
                cloudinaryOptions.transformation = [
                    { width: 800, crop: "limit" },
                    { quality: "auto" },
                    { fetch_format: "auto" }
                ];
            }
        }

        const uploadResponse = await new Promise((resolve, reject) => {
            // ✅ FIX: `uploadOptions` ki bajaye cleaned `cloudinaryOptions` pass kiya gaya hai
            const uploadStream = cloudinary.uploader.upload_stream(
                cloudinaryOptions,
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            uploadStream.end(fileBuffer);
        });

        return {
            success: true,
            url: uploadResponse.secure_url,
            public_id: uploadResponse.public_id,
            resource_type: uploadResponse.resource_type // 👈 Returns "image" or "video"
        };

    } catch (error) {
        console.error("❌ Cloudinary Error:", error.message);
        return { success: false, message: `Cloudinary upload failed: ${error.message}` };
    }
};

export const deleteImageCloudinary = async (publicId, options = {}) => {
    try {
        if (!publicId) {
            return { success: false, message: "No public_id provided for deletion." };
        }

        const deleteOptions = {
            resource_type: "auto",
            invalidate: true,
            ...options
        };

        const destroyResponse = await new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(publicId, deleteOptions, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            });
        });

        return {
            success: true,
            result: destroyResponse
        };
    } catch (error) {
        console.error("❌ Cloudinary delete error:", error.message);
        return { success: false, message: `Cloudinary delete failed: ${error.message}` };
    }
};

export const extractCloudinaryPublicIdFromUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) return null;

    const afterUpload = url.substring(uploadIndex + '/upload/'.length);
    const segments = afterUpload.replace(/\?.*$/, '').split('/').filter(Boolean);
    const versionIndex = segments.findIndex((segment) => /^v\d+$/.test(segment));
    const publicPath = versionIndex >= 0 ? segments.slice(versionIndex + 1) : segments;
    const cleanUrl = publicPath.join('/');
    const publicId = cleanUrl.replace(/\.[^./?]+$/, '');
    return publicId;
};