import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../src/utils/authUtils';
import SEO from '../../header/SEO';
import { IoChevronForwardOutline, IoBagCheckOutline, IoTimeOutline, IoCloseCircleOutline, IoRocketOutline } from "react-icons/io5";
import { Loader2, Package } from 'lucide-react';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = async () => {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        
        if (!token) {
            setError("Please log in to view your orders.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            // api instance automatically Bearer token attach karega (authUtils interceptor)
            const response = await api.get('/order/my-orders');
            
            // Backend response structures: .data (standard) or .orders (common custom)
            if (response.data && response.data.success) {
                setOrders(response.data.data || response.data.orders || []);
            } else if (Array.isArray(response.data)) {
                setOrders(response.data);
            } else {
                setOrders([]);
            }
        } catch (err) {
            console.error("Orders fetch error:", err);
            if (err.response?.status === 401) {
                setError("Please log in to view your orders.");
            } else {
                setError(err.response?.data?.message || "Orders load karne mein dikkat aa rahi hai.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const getStatusStyles = (status) => {
        const s = status?.toLowerCase();
        if (s === 'delivered') return 'bg-green-50 text-green-700 border-green-200';
        if (s === 'shipped') return 'bg-blue-50 text-blue-700 border-blue-200';
        if (s === 'cancelled') return 'bg-red-50 text-red-700 border-red-200';
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'; // Processing/Pending
    };

    return (
        <div className="bg-[#f4f7f9] min-h-screen py-10 mt-16">
            <SEO 
                title="My Orders" 
                description="Track and view your Aaramdehi order history." 
            />

            <div className="container mx-auto px-4 max-w-5xl">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">
                    <Link to="/" className="hover:text-blue-600 transition">Home</Link>
                    <IoChevronForwardOutline size={10} />
                    <span className="text-gray-800">My Orders</span>
                </nav>

                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-black text-blue-900 uppercase tracking-tight">Your Order History</h1>
                    <span className="bg-white px-4 py-1.5 rounded-full border border-gray-200 text-xs font-bold text-gray-500 shadow-sm">
                        Total Orders: {orders.length}
                    </span>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                        <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Fetching your orders...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-100 p-8 rounded-3xl text-center">
                        <p className="text-red-600 font-bold mb-4">{error}</p>
                        {error.includes("log in") ? (
                            <Link 
                                to="/login"
                                className="bg-blue-900 text-white px-10 py-3 rounded-full font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-lg inline-block"
                            >
                                Login Now
                            </Link>
                        ) : (
                            <button 
                                onClick={fetchOrders}
                                className="bg-red-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-red-700 transition"
                            >
                                Retry Now
                            </button>
                        )}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package className="text-gray-300" size={40} />
                        </div>
                        <h2 className="text-xl font-black text-gray-800 mb-2">Abhi tak koi order nahi hai!</h2>
                        <p className="text-gray-500 text-sm mb-8 max-w-xs mx-auto">Aapka order history khali hai. Kuch naya lene ka mann hai?</p>
                        <Link 
                            to="/products" 
                            className="bg-blue-900 text-white px-10 py-3 rounded-full font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-lg"
                        >
                            Shop Now
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order._id || order.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                {/* Order Header */}
                                <div className="bg-gray-50/50 px-6 py-4 flex flex-wrap items-center justify-between border-b border-gray-100 gap-4">
                                    <div className="flex gap-8">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order Placed</p>
                                            <p className="text-xs font-bold text-gray-700">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                                            <p className="text-xs font-black text-blue-900">₹{order.totalAmount?.toLocaleString()}</p>
                                        </div>
                                        <div className="hidden sm:block">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order ID</p>
                                            <p className="text-xs font-medium text-gray-500">#{String(order._id || order.id).slice(-8).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    
                                    <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${getStatusStyles(order.status)}`}>
                                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                        {order.status || 'Processing'}
                                    </div>
                                </div>

                                {/* Order Items Preview */}
                                <div className="p-6">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4 py-3 last:pb-0">
                                            <img 
                                                src={item.image || item.thumbnail || "https://placehold.co/80x80?text=📦"} 
                                                alt={item.name}
                                                className="w-16 h-16 object-contain rounded-xl border border-gray-100 bg-gray-50"
                                            />
                                            <div className="flex-1">
                                                <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</h4>
                                                <p className="text-xs text-gray-500 font-medium">Qty: {item.qty || item.quantity}</p>
                                            </div>
                                            <Link 
                                                to={`/product/${item.productId || item.id}`}
                                                className="text-[11px] font-black text-blue-600 hover:text-blue-900 uppercase tracking-tighter"
                                            >
                                                View Product
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;