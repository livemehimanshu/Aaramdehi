import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    IoSearchOutline, 
    IoFilterOutline, 
    IoCalendarOutline,
    IoDownloadOutline,
    IoAlertCircleOutline
} from "react-icons/io5";
import { generateInvoicePDF } from './generateInvoicePDF';
import { api } from '../../../src/utils/authUtils'; // ✅ Import authUtils.api

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // 1. Database से सभी ऑर्डर्स लोड करें
    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get(`/order`, { // ✅ Use authUtils.api
                // Headers are automatically handled
            });

            if (response.data.success) {
                setOrders(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            const msg = error.response?.data?.message || error.message || "Database connection error. Check if backend is running on Port 5000 or 8000.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // 2. ऑर्डर का स्टेटस (Processing, Shipped etc.) अपडेट करें
    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const response = await api.put(`/order/update-status/${orderId}`, // ✅ Use authUtils.api
                { status: newStatus },
                {} // Headers are automatically handled
            );
            
            if (response.status === 200 || response.data.success) {
                // ✅ Local state ko turant update karein taaki database reload ka wait na karna pade
                setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus, paymentStatus: newStatus === "Delivered" ? "Completed" : o.paymentStatus } : o));
                console.log(`✅ Order ${orderId} updated to ${newStatus} in Firebase`);
            }
        } catch (error) {
            console.error("Update failed:", error);
            alert("Failed to update status. Check terminal.");
        }
    };

    // 3. Search और Status के आधार पर फिल्टर करें
    const filteredOrders = orders.filter(order => {
        const orderNum = order.orderNumber || '';
        const userName = order.userId?.name || '';
        const matchesSearch = orderNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             userName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || order.orderStatus === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // 4. Generate & Download Invoice (Printable HTML)
    const handleDownloadInvoice = (order) => {
        console.log("Generating invoice for order:", order);
        try {
            // Safety check for order data
            if (!order) return alert("Order data not found!");
            generateInvoicePDF(order);
        } catch (error) {
            console.error("Invoice generation error:", error);
            alert("Could not generate invoice. Please check console for details.");
        }
    };

    // पेमेंट मेथड को सुंदर दिखाने के लिए
    const formatPaymentMethod = (method) => {
        return method?.toUpperCase() === 'COD' ? "Cash on Delivery" : "Credit/Debit Card";
    };

    // स्टेटस के अनुसार रंग चुनें
    const getStatusStyles = (status) => {
        switch(status) {
            case 'Processing': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'Shipped': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'Delivered': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'Cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Loading Orders from Database...</div>;

    if (error) return (
        <div className="p-8 text-center text-rose-500 flex flex-col items-center gap-2">
            <IoAlertCircleOutline size={40} />
            <p className="font-bold">{error}</p>
            <button onClick={fetchOrders} className="mt-4 bg-gray-800 px-4 py-2 rounded-lg text-white text-xs">
                Retry Fetching
            </button>
        </div>
    );

    return (
        <div className="p-6 bg-gray-950 min-h-screen text-gray-200 font-sans">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-black tracking-tight uppercase">Order Management</h1>
                    <p className="text-xs text-gray-500 font-bold uppercase mt-1">Total {orders.length} orders in Aaramdehi DB</p>
                </div>
            </div>

            {/* Search & Filter UI */}
            <div className="flex flex-wrap gap-4 mb-6">
                <div className="relative flex-1 min-w-[300px]">
                    <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="Search by Order ID or Customer Name..."
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select 
                    className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none cursor-pointer text-gray-300"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Status</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>

            {/* Orders Table */}
            {filteredOrders.length > 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="bg-gray-800/50 border-b border-gray-800">
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Order Details</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Customer</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Amount & Payment</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Update Status</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                        {filteredOrders.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-800/30 transition-colors group">
                                <td className="p-4">
                                    <p className="text-sm font-black text-blue-400 group-hover:text-blue-300 transition-colors">{order.orderNumber}</p>
                                    <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold mt-1">
                                        <IoCalendarOutline /> {new Date(order.createdAt).toLocaleDateString('en-GB')}
                                    </div>
                                </td>
                                <td className="p-4 text-sm font-bold text-gray-300">{order.userId?.name || 'Unknown User'}</td>
                                <td className="p-4">
                                    <p className="text-sm font-black text-white">₹{order.totalAmount.toLocaleString()}</p>
                                    <p className="text-[9px] font-bold text-gray-500 uppercase">{formatPaymentMethod(order.paymentMethod)} - {order.paymentStatus}</p>
                                </td>
                                <td className="p-4">
                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded border ${getStatusStyles(order.orderStatus)}`}>
                                        {order.orderStatus}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <select 
                                        className="bg-gray-800 border border-gray-700 text-[10px] font-black rounded py-1.5 px-2 focus:outline-none cursor-pointer hover:border-blue-500 text-gray-300"
                                        value={order.orderStatus}
                                        onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                                    >
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </td>
                                <td className="p-4 text-right">
                                    <button 
                                        onClick={() => handleDownloadInvoice(order)}
                                        className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all shadow-sm group/btn"
                                        title="Download Invoice"
                                    >
                                        <IoDownloadOutline size={18} className="group-active/btn:scale-90" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            ) : (
                <div className="bg-gray-900 border-2 border-dashed border-gray-800 rounded-2xl p-20 text-center text-gray-500">
                    No orders found matching your search/filter.
                </div>
            )}
        </div>
    );
};

export default Orders;