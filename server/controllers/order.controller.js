import { create, findAll, findById, updateById, findByQuery, db } from '../config/db.js';

const COLLECTION = 'orders';
const USERS_COLLECTION = 'users';
const PRODUCT_COLLECTION = 'products';
const COUPON_COLLECTION = 'coupons';
const SHOP_COLLECTION = 'shops';

// 1. Create New Order
export const createOrder = async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            totalAmount,
            itemsPrice,
            shippingPrice,
            discountAmount,
            couponCode,
            shopId,
            paymentInfo
        } = req.body;

        if (!orderItems?.length || !shippingAddress || !totalAmount) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required order fields: items, address, or total amount." 
            });
        }

        const userId = req.userId || req.user?._id || req.user?.id;
        const cleanShopId = shopId ? String(shopId._id || shopId.id || shopId) : null;
        const finalAmount = Number(totalAmount) || Number(req.body.totalPrice) || 0;
        const orderId = db.ref(COLLECTION).push().key; // Pre-generate ID for atomic update
        const timestamp = new Date().toISOString();
        
        // Atomic Updates Object
        const updates = {};

        // A. Handle Coupon Usage Update in Firebase
        if (couponCode) {
            const coupons = await findByQuery(COUPON_COLLECTION, 'code', String(couponCode).toUpperCase());
            const coupon = coupons?.[0];
            
            if (coupon) {
                let usedBy = coupon.usedBy || [];
                if (!Array.isArray(usedBy)) usedBy = Object.values(usedBy);
                const userUsageIndex = usedBy.findIndex(u => String(u.userId) === String(userId));
                
                if (userUsageIndex !== -1) usedBy[userUsageIndex].usageCount += 1;
                else usedBy.push({ userId, usageCount: 1 });

                updates[`${COUPON_COLLECTION}/${coupon._id}/usedCount`] = (Number(coupon.usedCount) || 0) + 1;
                updates[`${COUPON_COLLECTION}/${coupon._id}/usedBy`] = usedBy;
            }
        }

        // B. Handle Shop Balance (Khata System Integration)
        if (cleanShopId && (paymentMethod === 'Shop Credit' || paymentMethod === 'Khata')) {
            const shop = await findById(SHOP_COLLECTION, cleanShopId);
            if (shop) {
                updates[`${SHOP_COLLECTION}/${cleanShopId}/outstandingBalance`] = (Number(shop.outstandingBalance || 0)) + finalAmount;
            }
        }

        // C. Reduce Inventory Stock in Firebase
        for (const item of orderItems) {
            const productId = item.product || item.productId;
            const product = await findById(PRODUCT_COLLECTION, productId);
            if (product) {
                updates[`${PRODUCT_COLLECTION}/${productId}/stock`] = Math.max(0, (Number(product.stock || 0)) - Number(item.quantity));
            }
        }

        // D. Save Order to Firebase
        updates[`${COLLECTION}/${orderId}`] = {
            orderItems,
            shippingAddress,
            paymentMethod,
            paymentStatus: (paymentMethod === 'COD' || paymentMethod === 'Shop Credit') ? 'Pending' : 'Completed',
            orderStatus: 'Processing',
            itemsPrice: Number(itemsPrice) || 0,
            shippingPrice: Number(shippingPrice) || 0,
            discountAmount: Number(discountAmount) || 0,
            totalAmount: finalAmount,
            paymentInfo: paymentInfo || { id: "na", status: "created" },
            userId: userId || null,
            shopId: cleanShopId,
            orderNumber: `ORD${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`,
            createdAt: timestamp,
            updatedAt: timestamp
        };

        // EXECUTE BATCH UPDATE
        await db.ref().update(updates);

        return res.status(201).json({
          success: true,
          message: "Order placed successfully",
          data: { _id: orderId, ...updates[`${COLLECTION}/${orderId}`] }
        });

    } catch (error) {
        console.error("❌ [Order Controller] Create Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Get Logged-In User Orders
export const getMyOrders = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id || req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated." });
        }

        // ✅ Optimization: Fetch ONLY orders belonging to this user
        const myOrdersData = await findByQuery(COLLECTION, 'userId', userId);
        const allProducts = await findAll(PRODUCT_COLLECTION);
        
        // Create a product lookup map for O(1) access
        const productMap = allProducts.reduce((acc, p) => {
            acc[p._id] = p;
            return acc;
        }, {});

        const myOrders = myOrdersData
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(order => ({
                ...order,
                orderItems: order.orderItems.map(item => {
                    const p = productMap[item.productId || item.product];
                    return {
                        ...item,
                        name: p?.name || item.name,
                        image: p?.thumbnail || p?.images?.[0]?.url || item.image
                    };
                })
            }));

        return res.json({ success: true, data: myOrders });
    } catch (error) {
        console.error("❌ [Order Controller] getMyOrders Error:", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to fetch user orders." });
    }
};

// 3. Get All Orders (Admin View)
export const getAllOrders = async (req, res) => {
    try {
        const orders = await findAll(COLLECTION);
        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return res.json({ success: true, data: orders });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Update Order Status (Admin)
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await findById(COLLECTION, id);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        const updateData = { orderStatus: status };
        if (status === 'Delivered') {
            updateData.deliveredAt = new Date().toISOString();
            updateData.paymentStatus = 'Completed';
        }

        const updated = await updateById(COLLECTION, id, updateData);

        return res.json({ success: true, message: "Status updated", data: updated });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Get Shop Specific Orders (For Khata Tracking)
export const getOrdersByShopId = async (req, res) => {
    try {
        const { shopId } = req.params;
        if (!shopId) return res.status(400).json({ success: false, message: "Shop ID is required" });

        const allOrders = await findAll(COLLECTION);
        
        // Robust filtering for potential ID type mismatches
        const shopOrders = allOrders.filter(o => o.shopId && String(o.shopId) === String(shopId));
        
        return res.json({ success: true, data: shopOrders });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 6. Get Frequently Bought Together Recommendations
export const getFrequentlyBoughtTogether = async (req, res) => {
    try {
        const { productId } = req.params;
        // सभी ऑर्डर्स फेच करें
        const allOrders = await findAll(COLLECTION);
        
        const frequencyMap = {};

        allOrders.forEach(order => {
            const itemIds = order.orderItems?.map(item => String(item.productId || item.product)) || [];
            
            // अगर इस ऑर्डर में टारगेट प्रोडक्ट मौजूद है
            if (itemIds.includes(String(productId))) {
                itemIds.forEach(id => {
                    // खुद को छोड़कर बाकी प्रोडक्ट्स का काउंट बढ़ाएं
                    if (id !== String(productId)) {
                        frequencyMap[id] = (frequencyMap[id] || 0) + 1;
                    }
                });
            }
        });

        // फ्रीक्वेंसी के आधार पर सॉर्ट करें और टॉप 3 प्रोडक्ट्स निकालें
        const topProductIds = Object.entries(frequencyMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(entry => entry[0]);

        if (topProductIds.length === 0) {
            return res.json({ success: true, data: [] });
        }

        // इन IDs के लिए प्रोडक्ट डिटेल्स फेच करें
        const allProducts = await findAll(PRODUCT_COLLECTION);
        const recommendations = allProducts.filter(p => 
            topProductIds.includes(String(p._id || p.id))
        );

        return res.json({ success: true, data: recommendations });
    } catch (error) {
        console.error("❌ [Recommendations Error]:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};