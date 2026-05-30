import { findById, updateById, db } from '../config/db.js';

const COLLECTION = 'users';

// 1. Update Profile Details
export const updateProfile = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;
        const { name, gender, mobile } = req.body;

        const updatedUser = await updateById(COLLECTION, userId, { name, gender, mobile });
        return res.json({ success: true, user: updatedUser });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Get All Addresses
export const getUserAddresses = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;
        const snapshot = await db.ref(`${COLLECTION}/${userId}/addresses`).once('value');
        const addresses = snapshot.val() ? Object.entries(snapshot.val()).map(([id, data]) => ({ id, ...data })) : [];
        return res.json({ success: true, addresses });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Add New Address with Default Logic
export const addUserAddress = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;
        const newAddress = req.body;
        const addressRef = db.ref(`${COLLECTION}/${userId}/addresses`);

        // If isDefault is true, unset other default addresses
        if (newAddress.isDefault) {
            const snapshot = await addressRef.once('value');
            const existing = snapshot.val();
            if (existing) {
                const updates = {};
                Object.keys(existing).forEach(key => {
                    updates[`${key}/isDefault`] = false;
                });
                await addressRef.update(updates);
            }
        }

        await addressRef.push(newAddress);
        return res.json({ success: true, message: "Address added successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Delete Account (Irreversible)
export const deleteAccount = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;
        
        // Step 1: Delete from Realtime Database
        await db.ref(`${COLLECTION}/${userId}`).remove();
        
        // Step 2: Clear Cookies
        res.clearCookie('accessToken');
        return res.json({ success: true, message: "Account data deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Get My Coupons
export const getMyCoupons = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;
        const snapshot = await db.ref('coupons').once('value');
        const allCoupons = snapshot.val() ? Object.values(snapshot.val()) : [];
        
        // Logic: Filter coupons available for this user or unused
        const userCoupons = allCoupons.filter(c => !c.usedBy || !c.usedBy[userId]);
        return res.json({ success: true, data: userCoupons });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};