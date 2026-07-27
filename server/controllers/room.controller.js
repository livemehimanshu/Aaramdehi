import { findAll, findById, create, updateById, deleteById, findByQuery } from "../config/db.js";
import { uploadImageCloudinary, deleteImageCloudinary, extractCloudinaryPublicIdFromUrl, buildCloudinaryFolderPath } from "../utils/uploadImageCloudinary.js";
import slugify from 'slugify';
import sharp from 'sharp'; // ✅ WebP conversion ke liye

const COLLECTION = 'rooms';

const getUploadedFile = (req, fieldName) => {
    if (req.files?.[fieldName]?.[0]) return req.files[fieldName][0];
    if (req.file?.fieldname === fieldName) return req.file;
    return null;
};

const uploadRoomAsset = async (file, itemName, assetType = 'image') => {
    if (!file) return { url: '', publicId: '' };

    const fileBuffer = file.buffer || file.path;
    if (!fileBuffer) throw new Error(`${assetType} file content is missing`);

    const folderPath = buildCloudinaryFolderPath('Aaramdehi_Uploads/rooms', itemName || assetType);
    const webpBuffer = await sharp(fileBuffer)
        .webp({ quality: 80 })
        .toBuffer();

    const uploadResult = await uploadImageCloudinary(webpBuffer, folderPath, { noTransformation: true });
    if (uploadResult && !uploadResult.success) {
        throw new Error(uploadResult.message || `${assetType} upload failed`);
    }

    return {
        url: uploadResult.url,
        publicId: uploadResult.public_id
    };
};

const deleteRoomAsset = async (assetUrl, assetPublicId) => {
    const publicId = assetPublicId || extractCloudinaryPublicIdFromUrl(assetUrl);
    if (!publicId) return;

    try {
        await deleteImageCloudinary(publicId, { resource_type: 'auto' });
    } catch (error) {
        console.error('❌ Room Asset Delete Error:', error.message);
    }
};

// Get all rooms
export const getAllRooms = async (req, res) => {
    try {
        const rooms = await findAll(COLLECTION);
        return res.json({ success: true, data: rooms || [] });
    } catch (error) {
        console.error("❌ getAllRooms Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Create a new room
export const createRoom = async (req, res) => {
    try {
        const hasFiles = Boolean(req.file || req.files?.image?.length || req.files?.icon?.length);
        if (!req.body || (Object.keys(req.body).length === 0 && !hasFiles)) {
            return res.status(400).json({ 
                success: false, 
                message: "Request body or image is empty. Ensure you are sending FormData and Multer is configured." 
            });
        }

        const { name, categorySlug, description } = req.body;
        if (!name || !categorySlug) {
            return res.status(400).json({ success: false, message: "Name and Category Link are required" });
        }

        // Generate and Validate Unique Slug
        const rawSlug = slugify(name, { lower: true, strict: true });
        let slug = rawSlug;
        const existingRooms = await findByQuery(COLLECTION, 'slug', slug);
        if (existingRooms && existingRooms.length > 0) {
            slug = `${rawSlug}-${Date.now()}`;
        }

        let imageUrl = "";
        let imagePublicId = "";
        let iconUrl = "";
        let iconPublicId = "";

        const imageFile = getUploadedFile(req, 'image');
        const iconFile = getUploadedFile(req, 'icon');

        if (imageFile) {
            const uploadedImage = await uploadRoomAsset(imageFile, name.trim(), 'image');
            imageUrl = uploadedImage.url;
            imagePublicId = uploadedImage.publicId;
        }

        if (iconFile) {
            const uploadedIcon = await uploadRoomAsset(iconFile, name.trim(), 'icon');
            iconUrl = uploadedIcon.url;
            iconPublicId = uploadedIcon.publicId;
        }

        const roomData = {
            name: name.trim(),
            slug,
            categorySlug,
            description: description || "",
            image: imageUrl,
            imagePublicId,
            icon: iconUrl,
            iconPublicId,
            isActive: true,
            createdAt: new Date().toISOString(),
            createdBy: req.userId || req.user?._id || req.user?.id || null
        };

        const newRoom = await create(COLLECTION, roomData);
        return res.status(201).json({ success: true, message: "Room created successfully", data: newRoom });
    } catch (error) {
        console.error("❌ createRoom Controller Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get Room Details by Slug
export const getRoomBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const rooms = (await findAll(COLLECTION)) || [];
        const room = rooms.find(r => String(r.slug) === String(slug));
        
        if (!room) return res.json({ success: false, message: "Room metadata not found, falling back to category listing" });
        return res.json({ success: true, data: room });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Update Room Details
export const updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const hasFiles = Boolean(req.file || req.files?.image?.length || req.files?.icon?.length);
        if (!req.body || (Object.keys(req.body).length === 0 && !hasFiles)) {
            return res.status(400).json({ success: false, message: "No update data provided" });
        }

        const existingRoom = await findById(COLLECTION, id);
        if (!existingRoom) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }

        const { name, categorySlug, description, isActive } = req.body;
        const updateData = {};

        if (name) {
            updateData.name = name.trim();
            updateData.slug = slugify(name, { lower: true, strict: true });
        }
        if (categorySlug) updateData.categorySlug = categorySlug;
        if (description !== undefined) updateData.description = description;
        if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;

        const imageFile = getUploadedFile(req, 'image');
        const iconFile = getUploadedFile(req, 'icon');

        if (imageFile) {
            const uploadedImage = await uploadRoomAsset(imageFile, name ? name.trim() : existingRoom.name, 'image');
            updateData.image = uploadedImage.url;
            updateData.imagePublicId = uploadedImage.publicId;
            await deleteRoomAsset(existingRoom.image, existingRoom.imagePublicId);
        }

        if (iconFile) {
            const uploadedIcon = await uploadRoomAsset(iconFile, name ? name.trim() : existingRoom.name, 'icon');
            updateData.icon = uploadedIcon.url;
            updateData.iconPublicId = uploadedIcon.publicId;
            await deleteRoomAsset(existingRoom.icon, existingRoom.iconPublicId);
        }

        const updated = await updateById(COLLECTION, id, updateData);
        return res.json({ success: true, message: "Room updated successfully", data: updated });
    } catch (error) {
        console.error("❌ updateRoom Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Room
export const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const room = await findById(COLLECTION, id);

        if (!room) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }

        await deleteRoomAsset(room.image, room.imagePublicId);
        await deleteRoomAsset(room.icon, room.iconPublicId);
        await deleteById(COLLECTION, id);
        return res.json({ success: true, message: "Room deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};