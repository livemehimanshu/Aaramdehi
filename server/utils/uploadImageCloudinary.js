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