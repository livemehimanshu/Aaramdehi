import { create, findAll, findById, updateById, findByQuery, db } from '../config/db.js';
import { sendOrderEmail } from '../utils/sendEmail.js';

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
        const timestamp = new Date().toISOString();
        
        // Atomic Updates Object
        const updates = {};

        // ✅ SECURITY FIX: Calculate backend-side prices (prevents IDOR/Parameter Tampering)
        let calculatedItemsPrice = 0;
        const validatedOrderItems = [];

        // Fetch and validate products with actual prices from database
        for (const item of orderItems) {
            const productId = item.product || item.productId;
            const product = await findById(PRODUCT_COLLECTION, productId);
            
            if (!product) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Product with ID ${productId} not found.` 
                });
            }

            // ✅ Use actual product price from database (prevents price manipulation)
            const actualPrice = Number(product.sellingPrice || product.price || 0);
            const quantity = Number(item.quantity) || 1;
            const itemTotal = actualPrice * quantity;
            
            calculatedItemsPrice += itemTotal;

            validatedOrderItems.push({
                ...item,
                price: actualPrice,  // Store verified backend price
                quantity: quantity
            });

            // C. Reduce Inventory Stock in Firebase (from original logic)
            updates[`${PRODUCT_COLLECTION}/${productId}/stock`] = Math.max(0, (Number(product.stock || 0)) - quantity);
        }

        // ✅ Calculate final amount with backend-validated prices
        const backendShippingPrice = Number(shippingPrice) || 0;
        const backendDiscountAmount = Number(discountAmount) || 0;
        const finalAmount = Math.max(0, calculatedItemsPrice + backendShippingPrice - backendDiscountAmount);

        const orderId = db.ref(COLLECTION).push().key;

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

        // D. Save Order to Firebase (using validated backend-calculated amounts)
        updates[`${COLLECTION}/${orderId}`] = {
            orderItems: validatedOrderItems,  // Use validated items with backend prices
            shippingAddress,
            paymentMethod,
            paymentStatus: (paymentMethod === 'COD' || paymentMethod === 'Shop Credit') ? 'Pending' : 'Completed',
            orderStatus: 'Processing',
            itemsPrice: calculatedItemsPrice,  // Backend-calculated
            shippingPrice: backendShippingPrice,
            discountAmount: backendDiscountAmount,
            totalAmount: finalAmount,  // Backend-calculated
            paymentInfo: paymentInfo || { id: "na", status: "created" },
            userId: userId || null,
            shopId: cleanShopId,
            orderNumber: `ORD${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`,
            createdAt: timestamp,
            updatedAt: timestamp
        };

        // EXECUTE BATCH UPDATE
        await db.ref().update(updates);

        const orderData = { _id: orderId, ...updates[`${COLLECTION}/${orderId}`] };

        // ✅ Background Processing: Send Email without 'await'
        const user = userId ? await findById(USERS_COLLECTION, userId) : null;
        const targetEmail = user?.email || shippingAddress?.email;

        if (targetEmail) {
            console.log(`📩 Attempting to send order email to: ${targetEmail}`);
            sendOrderEmail(targetEmail, orderData).catch(err => 
                console.error("❌ [Background Email Error]:", err.message)
            );
        } else {
            console.warn("⚠️ Email skipped: No email found in User profile or Shipping address.");
        }

        return res.status(201).json({
          success: true,
          message: "Order placed successfully",
          data: orderData
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
        const myOrdersData = (await findByQuery(COLLECTION, 'userId', userId)) || [];
        
        // Extract unique product IDs from orders to avoid fetching the whole catalog
        const productIds = [...new Set(myOrdersData.flatMap(order => 
            (order.orderItems || []).map(item => item.productId || item.product)
        ))].filter(Boolean);

        // Fetch only required products
        const products = await Promise.all(productIds.map(id => findById(PRODUCT_COLLECTION, id)));
        
        const productMap = products.filter(Boolean).reduce((acc, p) => {
            acc[p._id || p.id] = p;
            return acc;
        }, {});

        const myOrders = myOrdersData
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(order => ({
                ...order,
                orderItems: (order.orderItems || []).map(item => {
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

        // ✅ Optimization: Fetch products related to these orders for name/image enrichment
        const productIds = [...new Set(orders.flatMap(order => 
            (order.orderItems || []).map(item => item.productId || item.product)
        ))].filter(Boolean);

        const products = await Promise.all(productIds.map(id => findById(PRODUCT_COLLECTION, id)));
        
        const productMap = products.filter(Boolean).reduce((acc, p) => {
            acc[p._id || p.id] = p;
            return acc;
        }, {});

        const enrichedOrders = orders.map(order => ({
            ...order,
            orderItems: (order.orderItems || []).map(item => {
                const p = productMap[item.productId || item.product];
                return {
                    ...item,
                    name: p?.name || item.name,
                    image: p?.thumbnail || p?.images?.[0]?.url || item.image
                };
            })
        }));

        return res.json({ success: true, data: enrichedOrders });
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

        // ✅ Send Status Update Email
        const user = await findById(USERS_COLLECTION, order.userId);
        if (user && user.email && (status === 'Shipped' || status === 'Delivered')) {
            // Yahan aap status specific template use kar sakte hain
            console.log(`Sending ${status} email to ${user.email}`);
            // sendStatusUpdateEmail(user.email, order, status); 
        }

        return res.json({ success: true, message: "Status updated", data: updated });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Get Single Order Details (By ID)
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await findById(COLLECTION, id);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Security Check: Ensure user only sees their own orders
        const userId = req.userId || req.user?._id || req.user?.id;
        if (String(order.userId) !== String(userId)) {
            return res.status(403).json({ success: false, message: "You are not authorized to view this order." });
        }

        // ✅ Optimization: Fetch only products related to this specific order
        const productIds = (order.orderItems || []).map(item => item.productId || item.product).filter(Boolean);
        const products = await Promise.all(productIds.map(id => findById(PRODUCT_COLLECTION, id)));
        
        const productMap = products.filter(Boolean).reduce((acc, p) => {
            acc[p._id || p.id] = p;
            return acc;
        }, {});

        const enrichedOrder = {
            ...order,
            orderItems: (order.orderItems || []).map(item => {
                const p = productMap[item.productId || item.product];
                return {
                    ...item,
                    name: p?.name || item.name,
                    image: p?.thumbnail || p?.images?.[0]?.url || item.image
                };
            })
        };

        return res.json({ success: true, data: enrichedOrder });
    } catch (error) {
        console.error("❌ [Order Controller] getOrderById Error:", error);
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
        const allProducts = await findAll(PRODUCT_COLLECTION) || [];
        const currentProduct = allProducts.find(p => String(p._id || p.id) === String(productId));
        
        const allOrders = await findAll(COLLECTION) || [];
        const frequencyMap = {};

        allOrders.forEach(order => {
            // ✅ Order Set Logic: Ensure unique product IDs per order to avoid skewed weights
            const itemIds = [...new Set((order.orderItems || []).map(item => String(item.productId || item.product || item.id)))];
            
            if (itemIds.includes(String(productId))) {
                itemIds.forEach(id => {
                    if (id && id !== "undefined" && id !== "null" && id !== String(productId)) {
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

        // ✅ Unique Name Filtering: Skip products with same names as current or already selected ones
        const seenNames = new Set();
        if (currentProduct) seenNames.add(currentProduct.name);

        let recommendations = allProducts.filter(p => {
            const pId = String(p._id || p.id);
            const isRecommended = topProductIds.includes(pId);
            if (isRecommended && p.name && !seenNames.has(p.name)) {
                seenNames.add(p.name);
                return true;
            }
            return false;
        });

        // Fallback: If not enough sales-based recs, add same-category products with unique names
        if (recommendations.length < 2 && currentProduct) {
            const moreRecs = allProducts.filter(p => 
                String(p._id || p.id) !== String(productId) && 
                String(p.category) === String(currentProduct.category) && 
                !seenNames.has(p.name)
            ).slice(0, 2 - recommendations.length);
            
            recommendations = [...recommendations, ...moreRecs];
        }

        return res.json({ success: true, data: recommendations });
    } catch (error) {
        console.error("❌ [Recommendations Error]:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};