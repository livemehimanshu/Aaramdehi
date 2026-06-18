import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadImageCloudinary = async (fileBuffer, folderName = "Aaramdehi_Uploads", options = {}) => {
    try {
        if (!process.env.CLOUDINARY_API_KEY) {
            throw new Error("Cloudinary credentials missing");
        }

        const uploadOptions = {
            folder: folderName,
            resource_type: "auto",
            ...options
        };

        if (!Object.prototype.hasOwnProperty.call(uploadOptions, 'transformation')) {
            uploadOptions.transformation = [
                { width: 800, crop: "limit" },
                { quality: "auto" },
                { fetch_format: "auto" }
            ];
        }

        const uploadResponse = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                uploadOptions,
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            uploadStream.end(fileBuffer); // Buffer yahan end hota hai
        });

        return {
            success: true,
            url: uploadResponse.secure_url,
            public_id: uploadResponse.public_id
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
    const cleanUrl = afterUpload.replace(/\?.*$/, '');
    const publicId = cleanUrl.replace(/\.[^./?]+$/, '');
    return publicId;
};