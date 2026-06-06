import React, { useState, useEffect } from 'react';
import axiosInstance from '../../src/api/axiosInstance'; // ✅ Use global instance
import { IoBagHandleOutline, IoChevronForward } from "react-icons/io5";
import { Link } from 'react-router-dom';

// ✅ Professional Skeleton Loader Component
const OrderSkeleton = () => (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
                <div className="space-y-2">
                    <div className="h-3 w-20 bg-gray-200 rounded"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    <div className="h-3 w-24 bg-gray-200 rounded"></div>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <div className="hidden sm:block space-y-2">
                    <div className="h-2 w-10 bg-gray-200 rounded ml-auto"></div>
                    <div className="h-6 w-20 bg-gray-100 rounded-full"></div>
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded"></div>
            </div>
        </div>
    </div>
);

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axiosInstance.get('/orders');
                if (res.success) {
                    setOrders(res.data);
                }
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    return (
        <div className="w-full py-2">
            <div className="max-w-full mx-auto">
                <div className="flex items-center gap-3 mb-6 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center shadow-md">
                        <IoBagHandleOutline size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-800">My Orders</h1>
                        <p className="text-sm text-gray-500">Track and manage your recent purchases</p>
                    </div>
                </div>

                {loading ? (
                    // ✅ Show 3 Skeletons while loading
                    <div className="space-y-4">
                        <OrderSkeleton />
                        <OrderSkeleton />
                        <OrderSkeleton />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-gray-100 text-center">
                        <p className="text-gray-400 mb-6 font-medium">You haven't placed any orders yet.</p>
                        <Link to="/" className="inline-block bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-600 transition">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition group">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                                            <img 
                                                src={order.orderItems[0]?.image || 'https://via.placeholder.com/100'} 
                                                alt="product" 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Order {order.orderNumber}</p>
                                            <h3 className="font-bold text-gray-800">
                                                {order.orderItems.length} {order.orderItems.length === 1 ? 'Item' : 'Items'}
                                            </h3>
                                            <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="text-right flex items-center gap-6">
                                        <div className="hidden sm:block">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Status</p>
                                            <span className="text-[11px] font-black uppercase px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">{order.orderStatus}</span>
                                        </div>
                                        <div className="font-black text-gray-900 text-lg">₹{order.totalAmount}</div>
                                        <IoChevronForward className="text-gray-300 group-hover:text-gray-900 transition" size={20} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
export default Orders;