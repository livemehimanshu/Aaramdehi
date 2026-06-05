import { findAll, findById, create, updateById, deleteById, findByQuery } from "../config/db.js";
import { uploadImageCloudinary } from "../utils/uploadImageCloudinary.js";
import slugify from 'slugify';

const COLLECTION = 'rooms';

// Get all rooms
export const getAllRooms = async (req, res) => {
    try {
        const rooms = await findAll(COLLECTION);
        return res.json({ success: true, data: rooms });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Create a new room
export const createRoom = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ success: false, message: "Request body is empty. Ensure you are sending FormData and Multer is configured." });
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
        // Robust file check (buffer for memory storage, path for disk storage)
        const fileToUpload = req.file?.buffer || req.file?.path;

        if (fileToUpload) {
            const uploadResult = await uploadImageCloudinary(fileToUpload, "rooms");
            if (uploadResult && uploadResult.success) {
                imageUrl = uploadResult.url;
            }
        }

        const roomData = {
            name: name.trim(),
            slug,
            categorySlug,
            description: description || "",
            image: imageUrl,
            isActive: true,
            createdAt: new Date().toISOString()
        };

        const newRoom = await create(COLLECTION, roomData);
        return res.status(201).json({ success: true, data: newRoom });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get Room Details by Slug
export const getRoomBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const rooms = (await findAll(COLLECTION)) || [];
        const room = rooms.find(r => String(r.slug) === String(slug));
        
        if (!room) return res.status(404).json({ success: false, message: "Room not found" });
        return res.json({ success: true, data: room });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Update Room Details
export const updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.body) return res.status(400).json({ success: false, message: "No update data provided" });

        const { name, categorySlug, description, isActive } = req.body;
        const updateData = {};

        if (name) {
            updateData.name = name.trim();
            updateData.slug = slugify(name, { lower: true, strict: true });
        }
        if (categorySlug) updateData.categorySlug = categorySlug;
        if (description !== undefined) updateData.description = description;
        if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;

        const fileToUpload = req.file?.buffer || req.file?.path;
        if (fileToUpload) {
            const uploadResult = await uploadImageCloudinary(fileToUpload, "rooms");
            if (uploadResult?.success) {
                updateData.image = uploadResult.url;
            }
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
        await deleteById(COLLECTION, id);
        return res.json({ success: true, message: "Room deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};