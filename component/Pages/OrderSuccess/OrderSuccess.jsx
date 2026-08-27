import React, { useEffect, useState } from 'react';
import { IoCheckmarkCircleOutline, IoDownloadOutline, IoMailOutline } from "react-icons/io5";
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Header from '../../header';
import api from '../../../src/utils/authUtils'; // Import the configured API instance

// Invoice PDF Generator Fallback
const generateInvoicePDF = (data) => {
    console.log("Generating Invoice PDF for data: ", data);
    window.print(); 
};

const OrderSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { orderId: routeOrderId } = useParams();
    const [dbOrder, setDbOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    // Robust data extraction from state fallbacks
    const stateData = location.state?.order || location.state?.orderDetails || location.state?.data || location.state || {};
    const orderData = dbOrder || stateData;

    // Load order data from state, localStorage, or API
    useEffect(() => {
        let isMounted = true;
        const loadOrder = async () => {
            const idToFetch = stateData._id || stateData.orderId || stateData.orderNumber || routeOrderId;
            
            // Agar details missing hain toh DB se fetch karein
            if (idToFetch && idToFetch !== 'ORD-XXXXX' && (!orderData.orderItems || orderData.orderItems.length === 0)) {
                try {
                    const response = await api.get(`/orders/${idToFetch}`);
                    
                    if (isMounted && response.data?.success) {
                        setDbOrder(response.data.data);
                    }
                } catch (error) {
                    console.error("Error fetching order from database:", error);
                    if (isMounted) setFetchError("Could not fetch server data.");
                }
            } else if (!location.state && !routeOrderId) {
                const saved = JSON.parse(localStorage.getItem('lastOrder'));
                if (isMounted && saved && Object.keys(saved).length > 0) setDbOrder(saved);
            }
            
            if (isMounted) setLoading(false);
        };

        loadOrder();
        return () => { isMounted = false; };
    }, [routeOrderId, location.state]);

    // Math calculations & variables setup
    const displayOrderId = orderData?.orderNumber || orderData?.orderId || orderData?._id || routeOrderId || 'ORD-XXXXX';
    const displayAmount = Number(orderData?.totalAmount || orderData?.amount || orderData?.totalPrice || 0);
    const displayMethod = (orderData?.paymentMethod || orderData?.method || 'CARD').toString().toUpperCase();
    const displayAddress = orderData?.shippingAddress || orderData?.address || {};
    const displayCustomer = typeof orderData?.userId === 'object' ? orderData.userId : {};
    const customerName = displayAddress.fullName || displayAddress.name || displayCustomer.fullName || displayCustomer.name || 'Customer';
    const customerPhone = displayAddress.mobile || displayAddress.phone || displayCustomer.mobile || displayCustomer.phone || 'N/A';
    const customerEmail = displayAddress.email || displayCustomer.email || orderData?.email || 'N/A';
    const addressLine = [
        displayAddress.address || displayAddress.detail || displayAddress.street,
        displayAddress.city,
        displayAddress.state,
        displayAddress.pincode || displayAddress.postalCode
    ].filter(Boolean).join(', ');
    const orderItems = orderData?.orderItems || orderData?.items || [];
    const displayDiscount = Number(orderData?.discountAmount || 0);
    const displayShipping = Number(orderData?.deliveryFee || orderData?.shippingPrice || (orderData?.totalAmount > 0 ? 50 : 0));

    // Subtotal (Base Product Price) = Final Amount Paid - Shipping Fee + Applied Discount
    const displaySubtotal = displayAmount - displayShipping + displayDiscount;

    // Auto-redirect to home if no order data found
    useEffect(() => {
        if (!loading && (!orderData || Object.keys(orderData).length < 2) && !location.state) {
            const timer = setTimeout(() => navigate('/'), 4000);
            return () => clearTimeout(timer);
        }
    }, [loading, orderData, location.state, navigate]);

    const handleDownloadInvoice = () => {
        if (displayOrderId === 'ORD-XXXXX') return alert("Order details loading...");
        generateInvoicePDF({
            ...orderData,
            orderNumber: displayOrderId,
            totalAmount: displayAmount,
            paymentMethod: displayMethod,
            shippingAddress: displayAddress,
            orderItems: orderData?.orderItems || [],
            createdAt: orderData?.createdAt || new Date()
        });
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
            <section className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4 print:bg-white print:min-h-0 print:py-0 print:px-0">
                <div className="container mx-auto max-w-4xl print:max-w-none">
                    
                    {fetchError && (
                        <div className="mb-4 bg-amber-50 text-amber-800 p-3 rounded-xl text-xs font-semibold print:hidden">
                            Showing snapshot data.
                        </div>
                    )}

                    {/* Success Header Message */}
                    <div className="text-center mb-10 print:hidden">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                                <IoCheckmarkCircleOutline size={48} className="text-green-600" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 mb-2">Order Confirmed!</h1>
                        <p className="text-gray-600 text-lg">Thank you for your purchase</p>
                    </div>

                    {/* Order Details Card */}
                    <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-50 mb-8 print:rounded-none print:shadow-none print:border print:border-gray-200 print:p-6 print:mb-0">
                        
                        {/* Order ID Section */}
                        <div className="mb-6 pb-6 border-b border-gray-100 flex items-end justify-between print:mb-4 print:pb-4">
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[3px]">Order ID</p>
                            <p className="text-2xl font-black text-gray-900 mt-1 tracking-tighter">{displayOrderId}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-7 pb-7 border-b border-gray-100 print:gap-5 print:mb-5 print:pb-5">
                            <div>
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[3px] mb-3">Billed To</p>
                                <p className="font-black text-gray-900">{customerName}</p>
                                <p className="text-sm text-gray-500 mt-1">{addressLine || 'Address pending'}</p>
                                <p className="text-sm text-gray-500 mt-1">Phone: {customerPhone}</p>
                                <p className="text-sm text-gray-500 mt-1 break-all">Email: {customerEmail}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[3px] mb-3">Payment Details</p>
                                <p className="text-sm text-gray-600">Method: <strong>{displayMethod === 'COD' ? 'Cash on Delivery' : displayMethod}</strong></p>
                                <p className="text-sm text-gray-600 mt-1">Payment status: <strong>{orderData?.paymentStatus || 'Pending'}</strong></p>
                                <p className="text-sm text-gray-600 mt-1">Order status: <strong>{orderData?.orderStatus || 'Processing'}</strong></p>
                            </div>
                        </div>

                        <div className="mb-7 pb-7 border-b border-gray-100 print:mb-5 print:pb-5">
                            <div className="grid grid-cols-[1fr_auto_auto] gap-4 bg-blue-900 text-white px-4 py-3 text-[10px] font-black uppercase tracking-widest">
                                <span>Product</span><span>Qty</span><span>Amount</span>
                            </div>
                            {orderItems.map((item, index) => {
                                const quantity = Number(item.quantity || item.qty || 1);
                                const price = Number(item.price || item.sellingPrice || 0);
                                return <div key={`${item.productId || item.product || item.name}-${index}`} className="grid grid-cols-[1fr_auto_auto] gap-4 items-start border-x border-b border-gray-200 px-4 py-3 text-sm text-gray-700">
                                    <span className="font-semibold">{item.name || item.productName || 'Product'}</span><span>{quantity}</span><span className="font-bold">₹{(price * quantity).toLocaleString('en-IN')}</span>
                                </div>;
                            })}
                        </div>

                        <div className="space-y-4 mb-6 pb-6 border-b border-gray-100 md:ml-auto md:max-w-sm print:space-y-2 print:mb-4 print:pb-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Subtotal (Products)</span>
                                <span className="font-bold text-gray-900">₹{displaySubtotal.toLocaleString('en-IN')}</span>
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

                    </div>

                    {/* Operational Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 print:hidden">
                        <button 
                            onClick={handleDownloadInvoice}
                            className="flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-lg"
                        >
                            <IoDownloadOutline size={18} /> Download Invoice
                        </button>
                        <button onClick={() => navigate('/track-order')} className="flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-lg">
                            <IoMailOutline size={18} /> Track Order
                        </button>
                        <button 
                            onClick={() => navigate('/')} 
                            className="flex items-center justify-center gap-2 bg-red-500 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-colors shadow-lg"
                        >
                            Continue Shopping
                        </button>
                    </div>
                    {!localStorage.getItem('userData') && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-center print:hidden">
                            <p className="font-bold text-blue-900">Create an account to track orders faster</p>
                            <button onClick={() => navigate('/signup')} className="mt-3 text-sm font-bold text-blue-700 hover:underline">Create Account</button>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};

export default OrderSuccess;