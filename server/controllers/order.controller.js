import { create, findAll, findById, updateById, findByQuery } from '../config/db.js';

const COLLECTION = 'orders';
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

        // Basic Validation
        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ success: false, message: "Order items are required" });
        }

        // Safety: Extract Clean Shop ID if object was passed
        const cleanShopId = shopId ? String(shopId._id || shopId.id || shopId) : null;

        const userId = req.userId || req.user?._id || req.user?.id;

        // Calculate actual total for calculation safety
        const finalAmount = Number(totalAmount) || Number(req.body.totalPrice) || 0;

        // A. Handle Coupon Usage Update in Firebase
        if (couponCode) {
            const coupons = await findByQuery(COUPON_COLLECTION, 'code', String(couponCode).trim().toUpperCase());
            const coupon = coupons && coupons.length > 0 ? coupons[0] : null;
            
            if (coupon) {
                const newUsedCount = (Number(coupon.usedCount) || 0) + 1;
                let usedBy = coupon.usedBy || [];
                if (!Array.isArray(usedBy)) usedBy = Object.values(usedBy);

                const userUsageIndex = usedBy.findIndex(u => String(u.userId) === String(userId));
                if (userUsageIndex !== -1) {
                    usedBy[userUsageIndex].usageCount += 1;
                } else {
                    usedBy.push({ userId, usageCount: 1 });
                }

                await updateById(COUPON_COLLECTION, coupon._id, {
                    usedCount: newUsedCount,
                    usedBy: usedBy
                });
            }
        }

        // B. Handle Shop Balance (Khata System Integration)
        if (cleanShopId && (paymentMethod === 'Shop Credit' || paymentMethod === 'Khata')) {
            const shop = await findById(SHOP_COLLECTION, cleanShopId);
            if (shop) {
                const currentBalance = Number(shop.outstandingBalance || 0);
                await updateById(SHOP_COLLECTION, cleanShopId, {
                    outstandingBalance: currentBalance + finalAmount
                });
            }
        }

        // C. Reduce Inventory Stock in Firebase
        for (const item of orderItems) {
            const productId = item.product || item.productId;
            const product = await findById(PRODUCT_COLLECTION, productId);
            if (product) {
                const newStock = Number(product.stock || 0) - Number(item.quantity);
                await updateById(PRODUCT_COLLECTION, product._id, { stock: Math.max(0, newStock) });
            }
        }

        // D. Save Order to Firebase
        const orderData = {
            orderItems,
            shippingAddress,
            paymentMethod,
            paymentStatus: paymentMethod === 'COD' || paymentMethod === 'Shop Credit' ? 'Pending' : 'Completed',
            orderStatus: 'Processing',
            itemsPrice: Number(itemsPrice) || 0,
            shippingPrice: Number(shippingPrice) || 0,
            discountAmount: Number(discountAmount) || 0,
            totalAmount: finalAmount,
            paymentInfo: paymentInfo || { id: "n/a", status: "processing" },
            userId: userId || null,
            shopId: cleanShopId,
            orderNumber: `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
            createdAt: new Date().toISOString()
        };

        const order = await create(COLLECTION, orderData);

        return res.status(201).json({
          success: true,
          message: "Order placed successfully",
          data: order
        });

    } catch (error) {
        console.error("Create Order Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Get Logged-In User Orders
export const getMyOrders = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id || req.user?.id;
        const allOrders = await findAll(COLLECTION);
        const myOrders = allOrders.filter(o => String(o.userId) === String(userId));
        
        myOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return res.json({ success: true, data: myOrders });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
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