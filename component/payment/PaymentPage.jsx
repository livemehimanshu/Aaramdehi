import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    IoCardOutline, 
    IoSwapHorizontalOutline, 
    IoBusiness, 
    IoWalletOutline, 
    IoLogoUsd, 
    IoCheckmarkCircle 
} from "react-icons/io5";
import MinimalCheckoutHeader from '../header/MinimalCheckoutHeader.jsx';
import { placeOrderAPI } from '../../src/api/authAndAdminApi'; 

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { cartItems = [], quantities = {}, userAddress = {}, prices = {} } = location.state || {};

    const [selectedMethod, setSelectedMethod] = useState('card');
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

    // Validate Card Form
    const validateCardForm = () => {
        const newErrors = {};

        if (!cardData.cardNumber || cardData.cardNumber.length < 16) {
            newErrors.cardNumber = 'Card number must be 16 digits';
        }
        if (!cardData.cardHolder) {
            newErrors.cardHolder = 'Card holder name is required';
        }
        if (!cardData.expiryDate || !/^\d{2}\/\d{2}$/.test(cardData.expiryDate)) {
            newErrors.expiryDate = 'Format: MM/YY';
        }
        if (!cardData.cvv || cardData.cvv.length < 3) {
            newErrors.cvv = 'CVV must be 3-4 digits';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Validate UPI Form
    const validateUpiForm = () => {
        const newErrors = {};
        if (!upiId || !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(upiId)) {
            newErrors.upi = 'Enter a valid UPI ID (format: username@bankname)';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Validate Net Banking Form
    const validateNetBankingForm = () => {
        const newErrors = {};
        if (!netBankingBank) {
            newErrors.bank = 'Please select a bank';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle Payment
    const handlePlaceOrder = async () => {
        let isValid = false;

        if (selectedMethod === 'card') {
            isValid = validateCardForm();
        } else if (selectedMethod === 'upi') {
            isValid = validateUpiForm();
        } else if (selectedMethod === 'netbanking') {
            isValid = validateNetBankingForm();
        } else if (selectedMethod === 'cod' || selectedMethod === 'emi') {
            isValid = true;
        }

        if (!isValid) return;

        setLoading(true);

        try {
            // 1. Get token from localStorage to solve 401 Unauthorized
            const token = localStorage.getItem("token"); 

            if (!token) {
                setErrors({ global: "Authentication missing. Please log in again." });
                setLoading(false);
                return;
            }

            // 2. Prepare payload data
            const orderPayload = {
                items: cartItems,
                quantities,
                shippingAddress: userAddress,
                paymentDetails: {
                    method: selectedMethod,
                    amount: prices.total || 0,
                    ...(selectedMethod === 'card' && { holderName: cardData.cardHolder }),
                    ...(selectedMethod === 'upi' && { upiId }),
                    ...(selectedMethod === 'netbanking' && { bank: netBankingBank }),
                }
            };

            // 3. Send Request to backend with Authorization token headers
            const response = await placeOrderAPI(orderPayload, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Clear Cart Storage on success
            localStorage.setItem("cart", JSON.stringify([]));
            window.dispatchEvent(new Event("cartUpdated"));

            // Navigate to Success Page
            navigate('/order-success', {
                state: {
                    orderId: response?.data?.orderId || 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                    amount: prices.total || 0,
                    method: selectedMethod,
                    address: userAddress
                }
            });
        } catch (error) {
            console.error("Order API Error:", error);
            
            // Check if backend returned an authorization error
            if (error.response && error.response.status === 401) {
                setErrors({ global: "Your session has expired or you are unauthorized. Please log in again." });
            } else {
                setErrors({ global: "Failed to place order. Please try again." });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCardNumberChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 16);
        setCardData({ ...cardData, cardNumber: value });
    };

    const handleExpiryChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        setCardData({ ...cardData, expiryDate: value });
    };

    const handleCvvChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
        setCardData({ ...cardData, cvv: value });
    };

    return (
        <>
            <MinimalCheckoutHeader currentStep={2} />
            <section className="bg-gray-100 min-h-screen py-8">
                <div className="container mx-auto px-4">
                    {errors.global && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                            {errors.global}
                        </div>
                    )}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Left Sidebar - Payment Methods */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-4 bg-gray-50 border-b border-gray-200">
                                    <h3 className="font-bold text-gray-900">Payment Method</h3>
                                </div>

                                <div className="divide-y divide-gray-100">
                                    {paymentMethods.map(method => {
                                        const IconComponent = method.icon;
                                        const isActive = selectedMethod === method.id;

                                        return (
                                            <button
                                                key={method.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedMethod(method.id);
                                                    setErrors({});
                                                }}
                                                className={`w-full py-4 px-4 text-left transition-all flex items-center gap-3 border-l-4 ${
                                                    isActive
                                                        ? 'bg-white border-l-green-500'
                                                        : 'bg-gray-50 border-l-gray-100 hover:bg-gray-100'
                                                }`}
                                            >
                                                <IconComponent 
                                                    size={20} 
                                                    className={isActive ? 'text-green-600' : 'text-gray-600'}
                                                />
                                                <div className="flex-1">
                                                    <p className={`text-sm font-bold ${
                                                        isActive ? 'text-gray-900' : 'text-gray-700'
                                                    }`}>
                                                        {method.name}
                                                    </p>
                                                </div>
                                                {isActive && (
                                                    <IoCheckmarkCircle size={18} className="text-green-600" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
                                {/* Card Payment */}
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
                                                className={`w-full border rounded px-4 py-3 text-sm focus:outline-none ${
                                                    errors.cardNumber ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
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
                                                className={`w-full border rounded px-4 py-3 text-sm focus:outline-none ${
                                                    errors.cardHolder ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
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
                                                    className={`w-full border rounded px-4 py-3 text-sm focus:outline-none ${
                                                        errors.expiryDate ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                                                    }`}
                                                />
                                                {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>}
                                            </div>
                                            <div>
                                                <label className="text-sm font-bold text-gray-700 block mb-2">CVV</label>
                                                <input
                                                    type="text"
                                                    placeholder="123"
                                                    value={cardData.cvv}
                                                    onChange={handleCvvChange}
                                                    className={`w-full border rounded px-4 py-3 text-sm focus:outline-none ${
                                                        errors.cvv ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                                                    }`}
                                                />
                                                {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* UPI Payment */}
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
                                                className={`w-full border rounded px-4 py-3 text-sm focus:outline-none ${
                                                    errors.upi ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                                                }`}
                                            />
                                            {errors.upi && <p className="text-red-500 text-xs mt-1">{errors.upi}</p>}
                                        </div>
                                        <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                                            You will receive an OTP on your registered mobile number after clicking "Place Order"
                                        </p>
                                    </div>
                                )}

                                {/* Net Banking */}
                                {selectedMethod === 'netbanking' && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-gray-900 mb-6">Select Your Bank</h3>
                                        <div>
                                            <label className="text-sm font-bold text-gray-700 block mb-2">Bank</label>
                                            <select
                                                value={netBankingBank}
                                                onChange={(e) => setNetBankingBank(e.target.value)}
                                                className={`w-full border rounded px-4 py-3 text-sm bg-white focus:outline-none ${
                                                    errors.bank ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                                                }`}
                                            >
                                                <option value="">Select a bank</option>
                                                {banks.map(bank => (
                                                    <option key={bank} value={bank}>{bank}</option>
                                                ))}
                                            </select>
                                            {errors.bank && <p className="text-red-500 text-xs mt-1">{errors.bank}</p>}
                                        </div>
                                        <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                                            Click "Place Order" to proceed to your bank portal for secure payment
                                        </p>
                                    </div>
                                )}

                                {/* EMI */}
                                {selectedMethod === 'emi' && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-gray-900 mb-6">EMI Option</h3>
                                        <p className="text-gray-700 mb-4">Choose your EMI plan on the next page</p>
                                        <div className="grid grid-cols-3 gap-4">
                                            {[3, 6, 9].map(months => (
                                                <div key={months} className="border border-gray-300 rounded p-3 text-center bg-gray-50">
                                                    <p className="font-bold text-gray-900">{months} Months</p>
                                                    <p className="text-sm text-red-500 mt-1">
                                                        ₹{Math.ceil((prices.total || 0) / months)}/mo
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Cash on Delivery */}
                                {selectedMethod === 'cod' && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-gray-900 mb-6">Cash on Delivery</h3>
                                        <div className="bg-green-50 border border-green-200 rounded p-4">
                                            <p className="text-green-700 font-bold">Pay on Delivery</p>
                                            <p className="text-sm text-green-600 mt-2">
                                                You can pay the amount ₹{prices.total || 0} when the package is delivered to you.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Order Summary Card */}
                            <div className="bg-yellow-400 rounded-lg p-6 shadow-sm">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                                    <div>
                                        <p className="text-sm font-bold text-gray-700">Order Total</p>
                                        <p className="text-3xl font-black text-gray-900">₹{prices.total || 0}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handlePlaceOrder}
                                        disabled={loading}
                                        className="w-full sm:w-auto bg-gray-900 text-white px-8 py-3 rounded font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        {loading ? 'Processing...' : 'Place Order'}
                                    </button>
                                </div>
                                <p className="text-sm text-gray-800">
                                    By placing this order, you agree to our Terms & Conditions
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default PaymentPage;