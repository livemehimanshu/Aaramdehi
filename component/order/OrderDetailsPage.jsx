import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../src/utils/authUtils';
import OrderTracking from './OrderTracking';
import { Loader2, ArrowLeft, Package, MapPin, CreditCard, ReceiptText } from 'lucide-react';
import SEO from '../header/SEO';

const OrderDetailsPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/order/details/${id}`);
                if (res.data.success) {
                    setOrder(res.data.data);
                }
            } catch (err) {
                setError(err.response?.data?.message || "Order details load karne mein error.");
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <Loader2 className="animate-spin text-blue-900 mb-4" size={40} />
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Loading order info...</p>
        </div>
    );

    if (error || !order) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-rose-50 text-rose-600 p-8 rounded-[30px] border border-rose-100 max-w-md w-full">
                <p className="font-black text-lg uppercase tracking-tight mb-4">{error || "Order not found"}</p>
                <Link to="/orders" className="inline-block bg-blue-900 text-white px-8 py-3 rounded-xl font-black text-xs uppercase">Go Back</Link>
            </div>
        </div>
    );

    return (
        <div className="bg-[#f8fafc] min-h-screen py-12 md:py-20 mt-16">
            <SEO title={`Order #${order.orderNumber}`} />
            <div className="container mx-auto px-4 max-w-5xl">
                <Link to="/orders" className="inline-flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-blue-900 mb-8 transition-colors">
                    <ArrowLeft size={14} /> Back to My Orders
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Order Status Header */}
                        <div className="bg-white p-6 md:p-10 rounded-[40px] shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h1 className="text-2xl font-black text-blue-900 uppercase">Order #{order.orderNumber}</h1>
                                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                                <span className="bg-blue-900 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">{order.orderStatus}</span>
                            </div>
                            <OrderTracking currentStatus={order.orderStatus} />
                        </div>

                        {/* Order Items */}
                        <div className="bg-white p-6 md:p-10 rounded-[40px] shadow-sm border border-gray-100">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8 flex items-center gap-2"><Package size={18} /> Order Items</h3>
                            <div className="divide-y divide-gray-50">
                                {order.orderItems.map((item, idx) => (
                                    <div key={idx} className="py-6 flex gap-6 items-center">
                                        <img src={item.image} className="w-20 h-20 object-contain bg-gray-50 rounded-2xl border border-gray-100" alt={item.name} />
                                        <div className="flex-1 min-w-0">
                                            <Link to={`/product/${item.productId}`} className="text-sm font-black text-gray-800 hover:text-blue-900 transition-colors line-clamp-1 uppercase">{item.name}</Link>
                                            <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                                        </div>
                                        <p className="text-sm font-black text-blue-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Totals & Shipping */}
                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2"><ReceiptText size={18} /> Summary</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    <span>Subtotal</span>
                                    <span>₹{order.itemsPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    <span>Shipping</span>
                                    <span className="text-emerald-500">{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}</span>
                                </div>
                                {order.discountAmount > 0 && (
                                    <div className="flex justify-between text-xs font-bold text-rose-500 uppercase tracking-widest">
                                        <span>Discount</span>
                                        <span>- ₹{order.discountAmount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                                    <span className="text-xs font-black text-blue-900 uppercase">Total Paid</span>
                                    <span className="text-2xl font-black text-blue-900 tracking-tighter">₹{order.totalAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2"><MapPin size={18} /> Shipping To</h3>
                            <div className="space-y-1">
                                <p className="text-sm font-black text-gray-800 uppercase">{order.shippingAddress.name}</p>
                                <p className="text-[11px] font-bold text-gray-500 leading-relaxed uppercase tracking-tighter">
                                    {order.shippingAddress.address}, {order.shippingAddress.city}<br />
                                    {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                </p>
                                <p className="text-[11px] font-black text-blue-900 pt-2 uppercase tracking-widest">📞 {order.shippingAddress.mobile}</p>
                            </div>
                        </div>

                        <div className="bg-blue-900 p-8 rounded-[40px] text-white shadow-xl shadow-blue-900/10">
                            <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-60 flex items-center gap-2"><CreditCard size={14} /> Method</h3>
                            <p className="text-sm font-black uppercase tracking-widest">{order.paymentMethod}</p>
                            <p className="text-[10px] font-bold mt-1 opacity-60 uppercase tracking-widest">Payment {order.paymentStatus}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default OrderDetailsPage;