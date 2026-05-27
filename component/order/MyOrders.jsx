import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, XCircle, Clock, Search, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { auth } from '../../src/api/firebase.js';
import { onAuthStateChanged } from 'firebase/auth'; // Assuming Firebase auth is used for user ID
import { api } from '../../src/utils/authUtils'; // Centralized Axios instance

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null); // Firebase user object
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
            } else {
                setUser(null);
                setLoading(false);
                setError("Please log in to view your orders.");
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchMyOrders = async () => {
            if (!user) return; // Don't fetch if user is not logged in

            try {
                setLoading(true);
                setError(null);
                // Assuming a new endpoint /api/order/my-orders that filters by authenticated user
                const response = await api.get(`/order/my-orders`);
                
                if (response.data.success) {
                    setOrders(response.data.data || []);
                } else {
                    setError(response.data.message || "Failed to fetch orders.");
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
            <div className="flex flex-col justify-center items-center h-64 bg-white rounded-lg shadow-sm">
                <Loader2 className="animate-spin text-blue-500" size={32} />
                <p className="mt-3 text-gray-600">Loading your orders...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-rose-500 flex flex-col items-center gap-4 bg-white rounded-lg shadow-sm">
                <AlertCircle size={48} />
                <p className="font-bold text-lg">{error}</p>
                {!user && (
                    <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all">
                        Login Now
                    </Link>
                )}
                {user && ( // Allow retry if user is logged in but fetch failed
                    <button onClick={() => setUser(user)} className="bg-gray-800 px-6 py-2 rounded-lg text-white font-bold hover:bg-gray-700 transition-all flex items-center gap-2">
                        <RefreshCw size={16} /> Retry Fetching
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white p-4 md:p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h2>

            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search by Order ID or Product Name..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {filteredOrders.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <Package size={48} className="mx-auto mb-4" />
                    <p className="text-lg font-semibold">No orders found.</p>
                    <p className="text-sm mt-2">Looks like you haven't placed any orders yet.</p>
                    <Link to="/products" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                            <thead>
                                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    <th className="py-3 px-4 border-b">Order ID</th>
                                    <th className="py-3 px-4 border-b">Date</th>
                                    <th className="py-3 px-4 border-b">Items</th>
                                    <th className="py-3 px-4 border-b">Total</th>
                                    <th className="py-3 px-4 border-b">Status</th>
                                    <th className="py-3 px-4 border-b">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map(order => (
                                    <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm font-medium text-blue-600">{order.orderNumber}</td>
                                        <td className="py-3 px-4 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="py-3 px-4 text-sm text-gray-700">
                                            {order.orderItems.map(item => (
                                                <p key={item.productId} className="truncate max-w-[200px]">{item.name} (x{item.quantity})</p>
                                            ))}
                                        </td>
                                        <td className="py-3 px-4 text-sm font-semibold text-gray-800">₹{order.totalAmount.toLocaleString()}</td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                                                {getStatusIcon(order.orderStatus)} {order.orderStatus}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm">
                                            <Link to={`/order-details/${order._id}`} className="text-blue-600 hover:underline">View Details</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {filteredOrders.map(order => (
                            <div key={order._id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-md font-bold text-blue-600">Order #{order.orderNumber}</h3>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                                        {getStatusIcon(order.orderStatus)} {order.orderStatus}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mb-3">{new Date(order.createdAt).toLocaleDateString()}</p>
                                <div className="border-t border-gray-100 pt-3 mt-3 space-y-2">
                                    {order.orderItems.map(item => (
                                        <div key={item.productId} className="flex items-center gap-3">
                                            <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded" />
                                            <p className="text-sm text-gray-700 flex-1">{item.name} (x{item.quantity})</p>
                                            <p className="text-sm font-semibold text-gray-800">₹{(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-3">
                                    <p className="text-sm font-bold text-gray-800">Total:</p>
                                    <p className="text-lg font-bold text-gray-900">₹{order.totalAmount.toLocaleString()}</p>
                                </div>
                                <Link to={`/order-details/${order._id}`} className="mt-4 block text-center text-blue-600 hover:underline text-sm">View Details</Link>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default MyOrders;