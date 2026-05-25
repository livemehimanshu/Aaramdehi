import React, { useState, useEffect } from 'react';
import { IoLocationOutline, IoHeartOutline, IoHeart, IoChevronDown } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import MinimalCheckoutHeader from '../header/MinimalCheckoutHeader.jsx';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [userAddress, setUserAddress] = useState({
        name: 'John Doe',
        address: '123 High Street, Apartment 4B, New York, NY 10001',
        phone: '+1 (555) 123-4567',
        addressType: 'Home'
    });
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(userAddress);
    const [wishlistItems, setWishlistItems] = useState([]);

    // Load cart from localStorage
    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCartItems(savedCart);
        
        // Initialize quantities
        const initialQuantities = {};
        savedCart.forEach(item => {
            initialQuantities[item.id] = item.quantity || 1;
        });
        setQuantities(initialQuantities);

        // Sync wishlist
        const savedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        setWishlistItems(savedWishlist);

        window.addEventListener("wishlistUpdated", syncWishlist);
        return () => window.removeEventListener("wishlistUpdated", syncWishlist);
    }, []);

    const syncWishlist = () => {
        const savedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        setWishlistItems(savedWishlist);
    };

    // Update quantity
    const handleQuantityChange = (productId, newQuantity) => {
        if (newQuantity < 1) return;
        setQuantities(prev => ({
            ...prev,
            [productId]: newQuantity
        }));
    };

    // Remove item from cart
    const handleRemoveItem = (productId) => {
        const updatedCart = cartItems.filter(item => item.id !== productId);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        setCartItems(updatedCart);
        window.dispatchEvent(new Event("cartUpdated"));
    };

    // Toggle wishlist
    const handleToggleWishlist = (product) => {
        let currentWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        const isPresent = currentWishlist.some(item => String(item.id) === String(product.id));

        if (isPresent) {
            currentWishlist = currentWishlist.filter(item => String(item.id) !== String(product.id));
        } else {
            currentWishlist.push({
                id: product.id,
                name: product.name,
                image: product.image,
                price: product.price,
                brand: product.brand || "Aaramdehi"
            });
        }

        localStorage.setItem("wishlist", JSON.stringify(currentWishlist));
        window.dispatchEvent(new Event("wishlistUpdated"));
        syncWishlist();
    };

    // Calculate price details
    const calculatePrices = () => {
        let mrp = 0;
        let discount = 0;

        cartItems.forEach(item => {
            const qty = quantities[item.id] || 1;
            const itemPrice = item.price || 0;
            mrp += itemPrice * qty;
        });

        // Calculate discount (assuming 20% as example)
        discount = Math.round(mrp * 0.10);

        const deliveryFee = mrp > 500 ? 0 : 40;
        const total = mrp - discount + deliveryFee;

        return {
            mrp,
            discount,
            deliveryFee,
            total
        };
    };

    const prices = calculatePrices();

    const handleSaveAddress = () => {
        setUserAddress(editingAddress);
        setShowAddressModal(false);
    };

    const handleContinue = () => {
        navigate('/payment', {
            state: {
                cartItems,
                quantities,
                userAddress,
                prices
            }
        });
    };

    if (cartItems.length === 0) {
        return (
            <>
                <MinimalCheckoutHeader currentStep={1} />
                <section className="min-h-screen bg-gray-100 py-12">
                    <div className="container mx-auto px-4">
                        <div className="bg-white rounded-lg p-12 text-center shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
                            <p className="text-gray-600 mb-6">Add items to your cart to proceed with checkout</p>
                            <button
                                onClick={() => navigate('/')}
                                className="bg-red-500 text-white px-8 py-3 rounded-sm font-bold uppercase tracking-widest hover:bg-red-600 transition-colors"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </section>
            </>
        );
    }

    return (
        <>
            <MinimalCheckoutHeader currentStep={1} />
            <section className="bg-gray-100 min-h-screen py-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Address & Products */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Address Section */}
                        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-3">
                                    <IoLocationOutline size={24} className="text-gray-600 mt-1" />
                                    <div>
                                        <h3 className="font-bold text-gray-900">Delivery Address</h3>
                                        <p className="text-sm text-gray-600 mt-2">
                                            <span className="font-bold">{userAddress.name}</span>
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">{userAddress.address}</p>
                                        <p className="text-sm text-gray-600 mt-1">Phone: {userAddress.phone}</p>
                                        <span className="inline-block text-xs font-bold bg-gray-100 text-gray-700 px-3 py-1 rounded mt-2">
                                            {userAddress.addressType}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setEditingAddress(userAddress);
                                        setShowAddressModal(true);
                                    }}
                                    className="text-blue-600 text-sm font-bold hover:underline"
                                >
                                    Change
                                </button>
                            </div>
                        </div>

                        {/* Products Section */}
                        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
                            <div className="space-y-4">
                                {cartItems.map(item => {
                                    const isInWishlist = wishlistItems.some(w => String(w.id) === String(item.id));
                                    const quantity = quantities[item.id] || 1;
                                    const itemTotal = (item.price || 0) * quantity;

                                    return (
                                        <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                                            {/* Product Image */}
                                            <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-16 h-16 object-contain"
                                                />
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900 text-sm mb-1">{item.name}</h4>
                                                <p className="text-xs text-gray-600 mb-2">Seller: {item.brand || 'Aaramdehi'}</p>
                                                
                                                {/* Price */}
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="font-bold text-red-500">₹{item.price}</span>
                                                </div>

                                                {/* Quantity Selector */}
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, quantity - 1)}
                                                        className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center text-gray-600 hover:bg-gray-50"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="w-6 text-center font-bold text-gray-900">{quantity}</span>
                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, quantity + 1)}
                                                        className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center text-gray-600 hover:bg-gray-50"
                                                    >
                                                        +
                                                    </button>
                                                    <span className="text-xs text-gray-600 ml-3">
                                                        Subtotal: <span className="font-bold text-gray-900">₹{itemTotal}</span>
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={() => handleToggleWishlist(item)}
                                                    className="p-2 hover:bg-gray-50 rounded transition-colors"
                                                >
                                                    {isInWishlist ? (
                                                        <IoHeart size={18} className="text-red-500" />
                                                    ) : (
                                                        <IoHeartOutline size={18} className="text-gray-400" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    className="text-red-500 text-xs font-bold hover:text-red-600"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Price Details (Sticky) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-6 bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4">Price Details</h3>

                            <div className="space-y-3 pb-4 border-b border-gray-200">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Price (MRP)</span>
                                    <span>₹{prices.mrp}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Discount</span>
                                    <span className="text-green-600 font-bold">−₹{prices.discount}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Delivery Charge</span>
                                    <span>
                                        {prices.deliveryFee === 0 ? (
                                            <span className="text-green-600 font-bold">FREE</span>
                                        ) : (
                                            `₹${prices.deliveryFee}`
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="py-4 mb-4">
                                <div className="flex justify-between text-lg">
                                    <span className="font-bold text-gray-900">Total Amount</span>
                                    <span className="font-bold text-red-500">₹{prices.total}</span>
                                </div>
                                <p className="text-xs text-green-600 font-bold mt-2">
                                    You will save ₹{prices.discount} on this order
                                </p>
                            </div>

                            <button
                                onClick={handleContinue}
                                className="w-full bg-orange-500 text-white py-3 rounded-sm font-bold uppercase tracking-widest hover:bg-orange-600 transition-colors mt-6"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Address Modal */}
            {showAddressModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Address</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-gray-700 block mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={editingAddress.name}
                                    onChange={(e) => setEditingAddress({
                                        ...editingAddress,
                                        name: e.target.value
                                    })}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-bold text-gray-700 block mb-1">Address</label>
                                <textarea
                                    value={editingAddress.address}
                                    onChange={(e) => setEditingAddress({
                                        ...editingAddress,
                                        address: e.target.value
                                    })}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500 h-20 resize-none"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-bold text-gray-700 block mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={editingAddress.phone}
                                    onChange={(e) => setEditingAddress({
                                        ...editingAddress,
                                        phone: e.target.value
                                    })}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddressModal(false)}
                                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded font-bold hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveAddress}
                                className="flex-1 bg-red-500 text-white py-2 rounded font-bold hover:bg-red-600"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
        </>
    );
};

export default CheckoutPage;
