import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    IoCardOutline,
    IoSwapHorizontalOutline,
    IoBusiness,
    IoWalletOutline,
    IoLogoUsd,
    IoCheckmarkCircle
} from "react-icons/io5";
import {
    placeOrderAPI,
    createPaymentOrderAPI,
    verifyPaymentAPI
} from '../../src/api/authAndAdminApi';
import { trackUserAction } from '../../src/hooks/useAnalyticsTracker';

// Dynamically load Razorpay SDK script if not loaded
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Extract state safely
    const orderPayload = location.state?.orderPayload || {};
    const totalAmount = location.state?.totalAmount || 0;

    // Redirect to checkout if page is accessed directly without state
    useEffect(() => {
        if (!location.state || !location.state.orderPayload) {
            navigate('/checkout', { replace: true });
        }
    }, [location.state, navigate]);

    const [selectedMethod, setSelectedMethod] = useState('card');
    const [selectedEmiMonth, setSelectedEmiMonth] = useState(3);
    const [cardData, setCardData] = useState({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: ''
    });
    const [netBankingBank, setNetBankingBank] = useState('');
    const [upiId, setUpiId] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const paymentMethods = [
        { id: 'card', name: 'Credit / Debit / ATM Card', icon: IoCardOutline },
        { id: 'emi', name: 'EMI', icon: IoSwapHorizontalOutline },
        { id: 'netbanking', name: 'Net Banking', icon: IoBusiness },
        { id: 'cod', name: 'Cash on Delivery', icon: IoWalletOutline },
        { id: 'upi', name: 'UPI', icon: IoLogoUsd },
    ];

    const banks = [
        'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'SBI Bank', 'PNB Bank', 'Kotak Bank', 'Yes Bank'
    ];

    // Method Switcher with cleanup
    const handleMethodChange = (methodId) => {
        setSelectedMethod(methodId);
        setErrors({});
    };

    // Validations
    const validateCardForm = () => {
        const newErrors = {};
        const rawCardNumber = cardData.cardNumber.replace(/\s/g, '');

        if (!rawCardNumber || rawCardNumber.length !== 16) {
            newErrors.cardNumber = 'Card number must be 16 digits';
        }
        if (!cardData.cardHolder.trim()) {
            newErrors.cardHolder = 'Cardholder name is required';
        }
        if (!cardData.expiryDate || !/^\d{2}\/\d{2}$/.test(cardData.expiryDate)) {
            newErrors.expiryDate = 'Format: MM/YY required';
        }
        if (!cardData.cvv || cardData.cvv.length < 3) {
            newErrors.cvv = 'CVV must be 3-4 digits';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateUpiForm = () => {
        const newErrors = {};
        if (!upiId || !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(upiId)) {
            newErrors.upi = 'Enter a valid UPI ID (e.g. username@bank)';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateNetBankingForm = () => {
        const newErrors = {};
        if (!netBankingBank) {
            newErrors.bank = 'Please select a bank';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Card Input Formatters
    const handleCardNumberChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 16);
        setCardData((prev) => ({ ...prev, cardNumber: value }));
    };

    const handleExpiryChange = (e) => {
        let value = e.target.value.replace(/\D/g, '').slice(0, 4);
        if (value.length >= 3) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        setCardData((prev) => ({ ...prev, expiryDate: value }));
    };

    const handleCvvChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
        setCardData((prev) => ({ ...prev, cvv: value }));
    };

    // Helper to finish order processing and redirect
    const handleSuccessNavigation = (resData) => {
        localStorage.setItem("cart", JSON.stringify([]));
        window.dispatchEvent(new Event("cartUpdated"));

        const orderItems = resData?.orderItems || resData?.data?.orderItems || [];
        Promise.all(orderItems.map((item) => trackUserAction({
            productId: item.productId || item.product,
            eventType: 'checkout_success'
        }))).catch(() => {});

        navigate('/order-success', {
            state: {
                order: resData,
                orderId: resData?.orderNumber || resData?._id || resData?.id,
                amount: totalAmount,
                orderDetails: resData
            }
        });
    };

    // Main Order/Payment Handler
    const handlePlaceOrder = async () => {
        let isValid = false;

        if (selectedMethod === 'card') isValid = validateCardForm();
        else if (selectedMethod === 'upi') isValid = validateUpiForm();
        else if (selectedMethod === 'netbanking') isValid = validateNetBankingForm();
        else if (selectedMethod === 'cod' || selectedMethod === 'emi') isValid = true;

        if (!isValid) return;

        setLoading(true);
        setErrors({});

        try {
            if (!localStorage.getItem('userData')) {
                setErrors({ global: "Your session has expired. Please log in again." });
                setLoading(false);
                navigate('/login');
                return;
            }

            // 🟢 Handle Cash On Delivery (COD) Directly
            if (selectedMethod === 'cod') {
                const finalOrderPayload = {
                    ...orderPayload,
                    paymentMethod: 'COD',
                    paymentInfo: {
                        id: "COD-" + Math.random().toString(36).substring(2, 11).toUpperCase(),
                        status: "Pending",
                        method: "cod"
                    }
                };

                const response = await placeOrderAPI(finalOrderPayload);
                const resData = response?.data || response;
                handleSuccessNavigation(resData);
                return;
            }

            // 🔵 Handle Online Payment Gateway (Razorpay/Card/UPI/NetBanking)
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                setErrors({ global: "Payment gateway failed to load. Check your internet connection." });
                setLoading(false);
                return;
            }

            // Step 1: Create Order on Backend Payment Gateway
            const paymentOrderData = await createPaymentOrderAPI(orderPayload.orderItems);

            if (!paymentOrderData.success) {
                setErrors({ global: paymentOrderData.message || "Failed to initialize payment." });
                setLoading(false);
                return;
            }

            // Step 2: Open Gateway Checkout Modal
            const options = {
                key: paymentOrderData.key_id,
                amount: paymentOrderData.order?.amount || totalAmount * 100,
                currency: paymentOrderData.order?.currency || "INR",
                name: "Aaramdehi",
                description: `Payment for Order`,
                order_id: paymentOrderData.order?.id,
                handler: async function (paymentResponse) {
                    try {
                        setLoading(true);
                        // Step 3: Verify Payment Signature on Backend
                        const verifyRes = await verifyPaymentAPI({
                            razorpay_order_id: paymentResponse.razorpay_order_id,
                            razorpay_payment_id: paymentResponse.razorpay_payment_id,
                            razorpay_signature: paymentResponse.razorpay_signature
                        });

                        if (verifyRes.success || verifyRes.status === "ok") {
                            // Step 4: Finalize Order Placement
                            const finalOrderPayload = {
                                ...orderPayload,
                                paymentMethod: selectedMethod.toUpperCase(),
                                paymentInfo: {
                                    id: paymentResponse.razorpay_payment_id,
                                    status: "Paid",
                                    method: selectedMethod,
                                    ...(selectedMethod === 'card' && {
                                        cardHolder: cardData.cardHolder,
                                        cardLast4: cardData.cardNumber.slice(-4)
                                    }),
                                    ...(selectedMethod === 'upi' && { upi: upiId }),
                                    ...(selectedMethod === 'netbanking' && { bank: netBankingBank }),
                                    ...(selectedMethod === 'emi' && { tenureMonths: selectedEmiMonth }),
                                }
                            };

                            const response = await placeOrderAPI(finalOrderPayload);
                            const resData = response?.data || response;
                            handleSuccessNavigation(resData);
                        } else {
                            setErrors({ global: "Payment verification failed. Please contact support." });
                        }
                    } catch (err) {
                        console.error("Verification Error:", err);
                        setErrors({ global: "Failed to verify transaction signature." });
                    } finally {
                        setLoading(false);
                    }
                },
                prefill: {
                    name: cardData.cardHolder || "",
                    email: "",
                    contact: "",
                    method: selectedMethod === 'cod' ? undefined : selectedMethod,
                    bank: selectedMethod === 'netbanking' ? 
                        ({
                            'HDFC Bank': 'HDFC',
                            'ICICI Bank': 'ICIC',
                            'Axis Bank': 'UTIB',
                            'SBI Bank': 'SBIN',
                            'PNB Bank': 'PUNB_R',
                            'Kotak Bank': 'KKBK',
                            'Yes Bank': 'YESB'
                        }[netBankingBank]) : undefined,
                    vpa: selectedMethod === 'upi' ? upiId : undefined
                },
                theme: {
                    color: "#16a34a"
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    }
                }
            };

            const paymentWindow = new window.Razorpay(options);
            paymentWindow.open();

        } catch (error) {
            console.error("Order API Error:", error);
            if (error?.response?.status === 401) {
                setErrors({ global: "Session expired. Please log in again." });
            } else {
                setErrors({
                    global: error?.response?.data?.message || "Failed to process payment. Please try again."
                });
            }
        } finally {
            if (selectedMethod === 'cod') {
                setLoading(false);
            }
        }
    };

    return (
        <section className="bg-gray-100 min-h-screen py-8">
            <div className="container mx-auto px-4">
                {errors.global && (
                    <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                        {errors.global}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left Sidebar - Payment Methods Selection */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 bg-gray-50 border-b border-gray-200">
                                <h3 className="font-bold text-gray-900">Payment Method</h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {paymentMethods.map((method) => {
                                    const IconComponent = method.icon;
                                    const isActive = selectedMethod === method.id;
                                    return (
                                        <button
                                            key={method.id}
                                            type="button"
                                            disabled={loading}
                                            onClick={() => handleMethodChange(method.id)}
                                            className={`w-full py-4 px-4 text-left transition-all flex items-center gap-3 border-l-4 ${isActive
                                                    ? 'bg-white border-l-green-500'
                                                    : 'bg-gray-50 border-l-gray-100 hover:bg-gray-100'
                                                }`}
                                        >
                                            <IconComponent
                                                size={20}
                                                className={isActive ? 'text-green-600' : 'text-gray-600'}
                                            />
                                            <div className="flex-1">
                                                <p className={`text-sm font-bold ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
                                                    {method.name}
                                                </p>
                                            </div>
                                            {isActive && <IoCheckmarkCircle size={18} className="text-green-600" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Main Form Content Area */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
                            {selectedMethod === 'card' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-900 mb-6">Enter Card Details</h3>
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 block mb-2">Card Number</label>
                                        <input
                                            type="text"
                                            placeholder="1234 5678 9012 3456"
                                            value={cardData.cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ')}
                                            onChange={handleCardNumberChange}
                                            className={`w-full border rounded px-4 py-3 text-sm focus:outline-none ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                        {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 block mb-2">Cardholder Name</label>
                                        <input
                                            type="text"
                                            placeholder="Your Name"
                                            value={cardData.cardHolder}
                                            onChange={(e) => setCardData({ ...cardData, cardHolder: e.target.value })}
                                            className={`w-full border rounded px-4 py-3 text-sm focus:outline-none ${errors.cardHolder ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                        {errors.cardHolder && <p className="text-red-500 text-xs mt-1">{errors.cardHolder}</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-bold text-gray-700 block mb-2">Expiry (MM/YY)</label>
                                            <input
                                                type="text"
                                                placeholder="MM/YY"
                                                value={cardData.expiryDate}
                                                onChange={handleExpiryChange}
                                                className={`w-full border rounded px-4 py-3 text-sm focus:outline-none ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                            />
                                            {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>}
                                        </div>
                                        <div>
                                            <label className="text-sm font-bold text-gray-700 block mb-2">CVV</label>
                                            <input
                                                type="password"
                                                placeholder="123"
                                                value={cardData.cvv}
                                                onChange={handleCvvChange}
                                                className={`w-full border rounded px-4 py-3 text-sm focus:outline-none ${errors.cvv ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                            />
                                            {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedMethod === 'upi' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-900 mb-6">Enter UPI ID</h3>
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 block mb-2">UPI ID</label>
                                        <input
                                            type="text"
                                            placeholder="yourname@bankname"
                                            value={upiId}
                                            onChange={(e) => setUpiId(e.target.value)}
                                            className={`w-full border rounded px-4 py-3 text-sm focus:outline-none ${errors.upi ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                        {errors.upi && <p className="text-red-500 text-xs mt-1">{errors.upi}</p>}
                                    </div>
                                </div>
                            )}

                            {selectedMethod === 'netbanking' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-900 mb-6">Select Your Bank</h3>
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 block mb-2">Bank</label>
                                        <select
                                            value={netBankingBank}
                                            onChange={(e) => setNetBankingBank(e.target.value)}
                                            className={`w-full border rounded px-4 py-3 text-sm bg-white focus:outline-none ${errors.bank ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        >
                                            <option value="">Select a bank</option>
                                            {banks.map((bank) => (
                                                <option key={bank} value={bank}>
                                                    {bank}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.bank && <p className="text-red-500 text-xs mt-1">{errors.bank}</p>}
                                    </div>
                                </div>
                            )}

                            {selectedMethod === 'emi' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-900 mb-6">Select EMI Tenure</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[3, 6, 9].map((months) => (
                                            <div
                                                key={months}
                                                onClick={() => setSelectedEmiMonth(months)}
                                                className={`cursor-pointer border rounded p-4 text-center transition-all ${selectedEmiMonth === months
                                                        ? 'border-green-600 bg-green-50'
                                                        : 'border-gray-300 bg-gray-50'
                                                    }`}
                                            >
                                                <p className="font-bold text-gray-900">{months} Months</p>
                                                <p className="text-sm text-red-500 mt-1">
                                                    ₹{Math.ceil((totalAmount || 0) / months)}/mo
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedMethod === 'cod' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-900 mb-6">Cash on Delivery</h3>
                                    <div className="bg-green-50 border border-green-200 rounded p-4">
                                        <p className="text-green-700 font-bold">Pay on Delivery</p>
                                        <p className="text-sm text-green-600 mt-2">
                                            You can pay ₹{Number(totalAmount).toLocaleString('en-IN')} upon delivery.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Summary & Submit Action Footer */}
                        <div className="bg-yellow-400 rounded-lg p-6 shadow-sm">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <p className="text-sm font-bold text-gray-700">Order Total</p>
                                    <p className="text-3xl font-black text-gray-900">
                                        ₹{Number(totalAmount).toLocaleString('en-IN')}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handlePlaceOrder}
                                    disabled={loading}
                                    className="w-full sm:w-auto bg-gray-900 text-white px-8 py-3 rounded font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 transition-all cursor-pointer"
                                >
                                    {loading ? 'Processing...' : 'Place Order'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PaymentPage;