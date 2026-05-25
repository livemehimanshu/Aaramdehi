import React, { useEffect, useState } from 'react';
import { IoCheckmarkCircleOutline, IoDownloadOutline, IoMailOutline } from "react-icons/io5";
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../../../Aaramdehi/component/header';

const OrderSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { orderId: routeOrderId } = useParams();
    const [dbOrder, setDbOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const stateData = location.state?.order || location.state?.orderDetails || location.state?.data || location.state || {};
    const orderData = dbOrder || stateData;

    useEffect(() => {
        const loadOrder = async () => {
            const idToFetch = stateData._id || stateData.orderId || stateData.orderNumber || routeOrderId;
            
            if (idToFetch && idToFetch !== 'ORD-XXXXX' && (!orderData.orderItems || orderData.orderItems.length === 0)) {
                try {
                    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000";
                    const token = localStorage.getItem('accessToken');
                    const response = await axios.get(`${apiBase}/api/order/${idToFetch}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.data.success) {
                        setDbOrder(response.data.data);
                    }
                } catch (error) {
                    console.error("Database fetch error:", error);
                }
            } else if (!location.state && !routeOrderId) {
                const saved = JSON.parse(localStorage.getItem('lastOrder'));
                if (saved && Object.keys(saved).length > 0) setDbOrder(saved);
            }
            setLoading(false);
        };
        loadOrder();
    }, [routeOrderId, location.state]);

    // Data normalizations and financial calculations
    const displayOrderId = orderData?.orderNumber || orderData?.orderId || orderData?._id || routeOrderId || 'ORD-XXXXX';
    const displayAmount = Number(orderData?.totalAmount || orderData?.amount || orderData?.totalPrice || 0);
    const displayMethod = (orderData?.paymentMethod || orderData?.method || 'CARD').toString().toUpperCase();
    const displayAddress = orderData?.shippingAddress || orderData?.address || {};
    const displayDiscount = Number(orderData?.discountAmount || 0);
    const displayShipping = Number(orderData?.deliveryFee || orderData?.shippingPrice || 0);

    // FEATURE 2: GST Calculation (18%)
    const taxableAmount = displayAmount - displayShipping;
    const cgst = (taxableAmount * 0.09); // 9% CGST
    const sgst = (taxableAmount * 0.09); // 9% SGST

    // Subtotal (Base Product Price) = Total Paid - Shipping + Discount
    const displaySubtotal = displayAmount - displayShipping + displayDiscount;

    useEffect(() => {
        if (!loading && (!orderData || Object.keys(orderData).length < 2) && !location.state) {
            const timer = setTimeout(() => navigate('/'), 3000);
            return () => clearTimeout(timer);
        }
    }, [loading, orderData, location.state, navigate]);

    const handleDownloadInvoice = () => {
        if (displayOrderId === 'ORD-XXXXX') return alert("Order details loading...");
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <>
            <Header hideNav={true} />
            <section className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4 print:bg-white print:py-0">
                <div className="container mx-auto max-w-2xl">
                    
                    {/* Confirmation Message */}
                    <div className="text-center mb-10 print:hidden">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                                <IoCheckmarkCircleOutline size={48} className="text-green-600" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 mb-2">Order Confirmed!</h1>
                        <p className="text-gray-600 text-lg">Thank you for your purchase</p>
                    </div>

                    {/* Order Details Structure Sheet */}
                    <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-50 mb-8 print:shadow-none print:border-none">
                        
                        <div className="mb-6 pb-6 border-b border-gray-100">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[3px]">Order ID</p>
                            <p className="text-2xl font-black text-gray-900 mt-1 tracking-tighter">{displayOrderId}</p>
                        </div>

                        <div className="space-y-4 mb-6 pb-6 border-b border-gray-100">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Subtotal (Products)</span>
                                <span className="font-bold text-gray-900">₹{displaySubtotal.toLocaleString('en-IN')}</span>
                            </div>
                            
                            {/* GST Breakdown */}
                            <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold border-t border-gray-50 pt-2 italic">
                                <span>HSN: 9404 (Mattresses & Bedding)</span>
                                <div className="text-right">
                                    <p>CGST (9%): ₹{cgst.toFixed(2)}</p>
                                    <p>SGST (9%): ₹{sgst.toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Shipping Fee</span>
                                <span className="font-bold text-gray-900">₹{displayShipping.toLocaleString('en-IN')}</span>
                            </div>

                            {displayDiscount > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Coupon Discount</span>
                                    <span className="font-black text-emerald-600">- ₹{displayDiscount.toLocaleString('en-IN')}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-3 border-t border-dashed mt-2">
                                <span className="text-xs text-gray-900 font-black uppercase tracking-[2px]">Total Payable</span>
                                <span className="text-3xl font-black text-blue-900">₹{displayAmount.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        {/* Verified Dynamic Payment Method Type */}
                        <div className="mb-6 pb-6 border-b border-gray-100">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[3px] mb-2">Payment Method</p>
                            <div className="inline-block bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider">
                                {displayMethod === 'COD' ? 'Cash On Delivery' : 
                                 displayMethod === 'UPI' ? 'UPI / NetBanking' : 'Credit / Debit Card'}
                            </div>
                        </div>

                        {/* Shipping Target Location */}
                        <div className="mb-2">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[3px] mb-2">Delivery Address</p>
                            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                <p className="font-black text-gray-900 text-sm">{displayAddress.name || 'Customer'}</p>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{displayAddress.address || displayAddress.street || 'Address details structure pending...'}</p>
                                <p className="text-xs text-gray-500 mt-1 font-semibold">Phone: {displayAddress.phone || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Operational Trigger Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 print:hidden">
                        <button 
                            onClick={handleDownloadInvoice}
                            className="flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/10"
                        >
                            <IoDownloadOutline size={18} /> Download Invoice
                        </button>
                        <button className="flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/10">
                            <IoMailOutline size={18} /> Track Order
                        </button>
                        <button 
                            onClick={() => navigate('/')} 
                            className="flex items-center justify-center gap-2 bg-red-500 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-colors shadow-lg shadow-red-500/10"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </section>
        </>
    );
};

export default OrderSuccess;