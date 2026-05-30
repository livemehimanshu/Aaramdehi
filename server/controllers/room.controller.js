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
        const { name, categorySlug, description } = req.body;
        if (!name || !categorySlug) {
            return res.status(400).json({ success: false, message: "Name and Category Link are required" });
        }

        let imageUrl = "";
        if (req.file) {
            const uploadResult = await uploadImageCloudinary(req.file.buffer, "rooms");
            if (uploadResult.success) imageUrl = uploadResult.url;
        }

        const roomData = {
            name,
            slug: slugify(name, { lower: true }),
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
        const rooms = await findAll(COLLECTION);
        const room = rooms.find(r => r.slug === slug);
        
        if (!room) return res.status(404).json({ success: false, message: "Room not found" });
        return res.json({ success: true, data: room });
    } catch (error) {
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