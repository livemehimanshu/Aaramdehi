import { findAll } from "../config/db.js";

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