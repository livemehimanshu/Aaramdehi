import { findAll, firestore } from "../config/db.js";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const toDate = (value) => {
    if (!value) return null;
    if (typeof value.toDate === 'function') return value.toDate();
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const getItemProductId = (item) => String(item?.productId || item?.product || '').trim();

const getProductLabel = (product, productId) => product?.name || product?.title || product?.productName || productId;

export const getAnalyticsSummary = async (req, res) => {
    try {
        const orders = await findAll('orders');
        const users = await findAll('users');
        const products = await findAll('products');

        const validOrders = orders.filter(o => o.orderStatus !== 'Cancelled');
        
        const stats = {
            totalOrders: orders.length,
            totalRevenue: validOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0),
            totalUsers: users.length,
            totalProducts: products.length,
            pendingOrders: orders.filter(o => o.orderStatus === 'Processing' || o.orderStatus === 'Pending').length,
            deliveredOrders: orders.filter(o => o.orderStatus === 'Delivered').length
        };

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const now = new Date();
        const timeSeriesMap = {};

        // Initialize last 6 months with year keys for robust grouping
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const mIdx = d.getMonth();
            const year = d.getFullYear();
            const key = `${months[mIdx]} ${year}`;
            timeSeriesMap[key] = { name: key, sales: 0, revenue: 0, monthIndex: mIdx };
        }

        validOrders.forEach(order => {
            const date = new Date(order.createdAt);
            const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
            if (timeSeriesMap[key]) {
                timeSeriesMap[key].sales += 1;
                timeSeriesMap[key].revenue += (Number(order.totalAmount) || 0);
            }
        });

        // Calculate Growth (Current Month Revenue vs Previous Month)
        const currentMonthKey = `${months[now.getMonth()]} ${now.getFullYear()}`;
        const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonthKey = `${months[prevDate.getMonth()]} ${prevDate.getFullYear()}`;
        
        const currentRev = timeSeriesMap[currentMonthKey]?.revenue || 0;
        const prevRev = timeSeriesMap[prevMonthKey]?.revenue || 0;
        const growth = prevRev === 0 ? (currentRev > 0 ? 100 : 0) : (((currentRev - prevRev) / prevRev) * 100).toFixed(1);

        return res.json({
            success: true,
            data: {
                ...stats,
                growth,
                timeSeries: Object.values(timeSeriesMap)
            }
        });
    } catch (error) {
        console.error("❌ [Analytics Controller] Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAdminAnalytics = async (req, res) => {
    try {
        const now = new Date();
        const startDate = new Date(now.getTime() - (7 * DAY_IN_MS));
        const [orders, products] = await Promise.all([
            findAll('orders'),
            findAll('products')
        ]);

        let events = [];
        try {
            const eventSnapshot = await firestore.collection('analytics_events')
                .where('timestamp', '>=', startDate)
                .get();
            events = eventSnapshot.docs.map((doc) => doc.data());
        } catch (error) {
            // Orders remain useful when Firestore is unavailable or not indexed yet.
            console.warn('[Admin Analytics] Firestore events unavailable:', error.message);
        }

        const validOrders = orders.filter((order) => order.orderStatus !== 'Cancelled');
        const recentOrders = validOrders.filter((order) => (toDate(order.createdAt) || new Date(0)) >= startDate);
        const totalRevenue = validOrders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);
        const views = events.filter((event) => event.eventType === 'product_view' || event.eventType === 'view').length;
        const carts = events.filter((event) => event.eventType === 'cart_add' || event.eventType === 'cart').length;
        const checkouts = events.filter((event) => event.eventType === 'checkout_success' || event.eventType === 'checkout').length;

        const productMap = new Map(products.map((product) => [String(product._id), product]));
        const trending = new Map();
        const addTrend = (productId, field, amount = 1) => {
            if (!productId) return;
            const entry = trending.get(productId) || { productId, views: 0, purchases: 0 };
            entry[field] += amount;
            trending.set(productId, entry);
        };

        events.forEach((event) => {
            const productId = String(event.productId || '').trim();
            if (event.eventType === 'product_view' || event.eventType === 'view') addTrend(productId, 'views');
        });
        recentOrders.forEach((order) => {
            (order.orderItems || []).forEach((item) => addTrend(getItemProductId(item), 'purchases', Number(item.quantity) || 1));
        });

        const weeklySales = Array.from({ length: 7 }, (_, index) => {
            const date = new Date(startDate.getTime() + (index * DAY_IN_MS));
            return { date: date.toISOString().slice(0, 10), orders: 0, revenue: 0 };
        });
        recentOrders.forEach((order) => {
            const date = toDate(order.createdAt);
            const day = date ? Math.floor((date.getTime() - startDate.getTime()) / DAY_IN_MS) : -1;
            if (day >= 0 && day < weeklySales.length) {
                weeklySales[day].orders += 1;
                weeklySales[day].revenue += Number(order.totalAmount) || 0;
            }
        });

        const topTrendingProducts = [...trending.values()]
            .sort((a, b) => (b.views + b.purchases) - (a.views + a.purchases))
            .slice(0, 10)
            .map((item) => ({ ...item, name: getProductLabel(productMap.get(item.productId), item.productId) }));

        return res.json({
            success: true,
            data: {
                period: { start: startDate.toISOString(), end: now.toISOString() },
                totalRevenue,
                totalOrders: validOrders.length,
                averageOrderValue: validOrders.length ? totalRevenue / validOrders.length : 0,
                funnel: {
                    views,
                    carts,
                    checkouts,
                    conversionRate: views ? (checkouts / views) * 100 : 0
                },
                topTrendingProducts,
                weeklySales
            }
        });
    } catch (error) {
        console.error("[Admin Analytics] Error:", error);
        return res.status(500).json({ success: false, message: "Unable to load analytics right now." });
    }
};