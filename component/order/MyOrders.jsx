import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, XCircle, Clock, Search, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { auth } from '../../src/api/firebase.js';
import { onAuthStateChanged } from 'firebase/auth'; // Assuming Firebase auth is used for user ID
import { api } from '../../src/api/authAndAdminApi'; // ✅ Use the same instance as other components

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null); // Firebase user object
    const [searchTerm, setSearchTerm] = useState('');

    const safeParseJSON = (rawValue) => {
        if (typeof rawValue !== 'string' || !rawValue.trim() || rawValue === 'undefined' || rawValue === 'null') {
            return null;
        }
        try {
            return JSON.parse(rawValue);
        } catch (err) {
            console.warn('Invalid JSON stored in localStorage for userData:', err, rawValue);
            return null;
        }
    };

    useEffect(() => {
        // 1. Pehle LocalStorage se session check karein (Custom Backend Login)
        const savedUserData = safeParseJSON(localStorage.getItem("userData"));
        const savedToken = localStorage.getItem("accessToken") || localStorage.getItem("token");

        if (savedUserData && savedToken) {
            setUser(savedUserData);
        }

        // 2. Firebase Auth state check karein (Social Login ke liye)
        const unsubscribe = auth ? onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
            } else if (!localStorage.getItem("accessToken") && !localStorage.getItem("token")) {
                setUser(null);
                setLoading(false);
                setError("Please log in to view your orders.");
            }
        }) : () => {};

        return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
    }, []);
    useEffect(() => {
        const fetchMyOrders = async () => {
            if (!user) return; // Don't fetch if user is not logged in

            try {
                setLoading(true);
                setError(null);
                
                // Base URL already includes /api, so use the backend route path directly
                const res = await api.get('/orders/my-orders');
                const response = res.data;
                
                if (response.success) {
                    setOrders(response.data || []);
                } else {
                    setError(response.message || "Failed to fetch orders.");
                }
            } catch (err) {
                console.error("Error fetching user orders:", err);
                setError(err.response?.data?.message || `Network Error: ${err.message}. Please check if the backend is running.`);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchMyOrders();
        }
    }, [user]); // Re-fetch when user object changes (i.e., on login/logout)

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Processing': return <Clock size={16} className="text-yellow-500" />;
            case 'Shipped': return <Truck size={16} className="text-blue-500" />;
            case 'Delivered': return <CheckCircle size={16} className="text-emerald-500" />;
            case 'Cancelled': return <XCircle size={16} className="text-red-500" />;
            default: return <Package size={16} className="text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Processing': return 'bg-yellow-500/10 text-yellow-500';
            case 'Shipped': return 'bg-blue-500/10 text-blue-500';
            case 'Delivered': return 'bg-emerald-500/10 text-emerald-500';
            case 'Cancelled': return 'bg-red-500/10 text-red-500';
            default: return 'bg-gray-500/10 text-gray-500';
        }
    };

    const filteredOrders = orders.filter(order =>
        order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderItems.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-96 bg-white rounded-[30px] shadow-sm border border-gray-100">
                <Loader2 className="animate-spin text-blue-900" size={40} />
                <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-gray-400">Fetching your orders...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-12 text-center text-rose-500 flex flex-col items-center gap-6 bg-white rounded-[30px] shadow-sm border border-gray-100">
                <AlertCircle size={48} />
                <p className="font-black text-xl tracking-tighter uppercase">{error}</p>
                {!user && (
                    <Link to="/login" className="bg-blue-900 text-white px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all">
                        Login Now
                    </Link>
                )}
                {user && ( // Allow retry if user is logged in but fetch failed
                    <button onClick={() => setUser(user)} className="bg-gray-900 px-10 py-4 rounded-xl text-white font-black text-xs uppercase tracking-widest hover:bg-blue-900 transition-all flex items-center gap-2">
                        <RefreshCw size={16} /> Retry Fetching
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white p-6 md:p-10 rounded-[30px] shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-blue-900 uppercase tracking-tight">Your Order History</h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Track and manage your recent purchases</p>
                </div>
                
                <div className="relative group w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-900 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Order ID or Product..."
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:outline-none focus:bg-white focus:border-blue-900 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="text-center py-20 bg-gray-50/50 rounded-[30px] border border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Package size={32} className="text-gray-300" />
                    </div>
                    <p className="text-lg font-black text-gray-800 uppercase tracking-tighter">No orders found</p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Looks like you haven't placed any orders yet.</p>
                    <Link to="/products" className="mt-8 inline-block bg-blue-900 text-white px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-hidden">
                        <table className="min-w-full">
                            <thead>
                                <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                                    <th className="pb-6 px-4">Order Details</th>
                                    <th className="pb-6 px-4">Items</th>
                                    <th className="pb-6 px-4 text-center">Amount</th>
                                    <th className="pb-6 px-4 text-center">Status</th>
                                    <th className="pb-6 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredOrders.map(order => (
                                    <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="py-6 px-4">
                                            <p className="text-sm font-black text-blue-900 uppercase">#{order.orderNumber}</p>
                                            <p className="text-[10px] font-bold text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                        </td>
                                        <td className="py-6 px-4">
                                            {order.orderItems.map(item => (
                                                <p key={item.productId} className="text-xs font-bold text-gray-700 truncate max-w-[240px] mb-1 last:mb-0">{item.name} <span className="text-gray-400 ml-1">×{item.quantity}</span></p>
                                            ))}
                                        </td>
                                        <td className="py-6 px-4 text-center text-sm font-black text-gray-900">₹{order.totalAmount.toLocaleString()}</td>
                                        <td className="py-6 px-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(order.orderStatus)}`}>
                                                {getStatusIcon(order.orderStatus)} {order.orderStatus}
                                            </span>
                                        </td>
                                        <td className="py-6 px-4 text-right">
                                            <Link to={`/order-details/${order._id || order.id}`} className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b-2 border-blue-900/10 hover:border-blue-900 transition-all pb-1">View Details</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden space-y-6">
                        {filteredOrders.map(order => (
                            <div key={order._id} className="bg-white border border-gray-100 rounded-[25px] p-6 shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-sm font-black text-blue-900 uppercase tracking-tight">Order #{order.orderNumber}</h3>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusColor(order.orderStatus)}`}>
                                        {getStatusIcon(order.orderStatus)} {order.orderStatus}
                                    </span>
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <div className="space-y-4 py-4 border-y border-gray-50">
                                    {order.orderItems.map(item => (
                                        <div key={item.productId} className="flex items-center gap-4">
                                            <img src={item.image || 'https://placehold.co/100x100?text=Item'} alt={item.name} className="w-12 h-12 object-contain bg-gray-50 rounded-xl border border-gray-100" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-bold text-gray-800 truncate">{item.name}</p>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="text-xs font-black text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center pt-4 mb-4">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Paid Amount</p>
                                    <p className="text-xl font-black text-blue-900 tracking-tighter">₹{order.totalAmount.toLocaleString()}</p>
                                </div>
                                <Link to={`/order-details/${order._id || order.id}`} className="block w-full text-center py-3 bg-gray-50 rounded-xl font-black text-[10px] text-blue-900 uppercase tracking-[0.2em] hover:bg-blue-900 hover:text-white transition-all">View Details</Link>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default MyOrders;