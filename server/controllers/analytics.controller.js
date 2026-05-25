import { findAll } from "../config/db.js";

export const getAnalyticsSummary = async (req, res) => {
    try {
        // 1. Firebase से डेटा लाएँ
        const orders = await findAll('orders');
        const users = await findAll('users');

        // 2. कुल आँकड़ों की गणना करें
        const totalSalesCount = orders.filter(o => o.orderStatus !== 'Cancelled').length;
        const totalRevenue = orders
            .filter(o => o.orderStatus !== 'Cancelled')
            .reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);
        const totalUsers = users.length;

        // 3. Time Series (Monthly Grouping)
        // पिछले 6 महीनों का डेटा तैयार करें
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        
        // चार्ट के लिए 6 महीने का खाली ढांचा
        const timeSeriesMap = {};
        for (let i = 5; i >= 0; i--) {
            const m = (currentMonth - i + 12) % 12;
            timeSeriesMap[m] = { name: months[m], sales: 0, revenue: 0 };
        }

        // ऑर्डर्स को महीनों में बाँटें
        orders.forEach(order => {
            if (order.createdAt && order.orderStatus !== 'Cancelled') {
                const orderDate = new Date(order.createdAt);
                const m = orderDate.getMonth();
                if (timeSeriesMap[m]) {
                    timeSeriesMap[m].sales += 1;
                    timeSeriesMap[m].revenue += (Number(order.totalAmount) || 0);
                }
            }
        });

        // मैप کو واپس ایرے (Array) میں بدلیں
        const timeSeries = Object.values(timeSeriesMap);

        // Growth Calculation (Current Month vs Prev Month)
        const prevMonth = (currentMonth - 1 + 12) % 12;
        const currentRev = timeSeriesMap[currentMonth].revenue;
        const prevRev = timeSeriesMap[prevMonth]?.revenue || 1; // Avoid divide by zero
        const growth = (((currentRev - prevRev) / prevRev) * 100).toFixed(1);

        return res.json({
            success: true,
            message: "Analytics summary calculated successfully",
            data: {
                totalSales: totalSalesCount,
                totalRevenue: totalRevenue,
                totalUsers: totalUsers,
                growth: growth,
                timeSeries: timeSeries
            }
        });
    } catch (error) {
        console.error("🔥 Analytics Controller Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to generate analytics: " + error.message
        });
    }
};