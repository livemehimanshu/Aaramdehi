import React, { useState, useEffect, useMemo } from 'react';
import {
    IoLocationOutline,
    IoHeartOutline,
    IoHeart
} from "react-icons/io5";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressSchema } from '../../src/schemas/validationSchemas';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getFrequentlyBoughtTogetherAPI } from '../../src/api/authAndAdminApi';

const CheckoutPage = () => {
    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState([]);
    const [quantities, setQuantities] = useState({});
    const PLACEHOLDER = 'https://placehold.co/150x150?text=Product';

    const [usePoints, setUsePoints] = useState(false);
    const [userPoints, setUserPoints] = useState(0);

    const [userAddress, setUserAddress] = useState({
        name: 'John Doe',
        address: '123 High Street, Apartment 4B, New York, NY 10001',
        phone: '+1 (555) 123-4567',
        addressType: 'Home',
        city: 'Saharanpur',
        postalCode: '247001'
    });

    const [showAddressModal, setShowAddressModal] = useState(false);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [comboProduct, setComboProduct] = useState(null);

    // React Hook Form Setup
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            fullName: userAddress.name,
            address: userAddress.address,
            phone: userAddress.phone.replace(/[^0-9]/g, '').slice(-10),
            city: userAddress.city,
            postalCode: userAddress.postalCode,
            email: 'user@example.com',
            state: 'UP'
        }
    });

    // Reset Form values when modal opens or userAddress updates
    useEffect(() => {
        if (showAddressModal) {
            reset({
                fullName: userAddress.name,
                address: userAddress.address,
                phone: userAddress.phone.replace(/[^0-9]/g, '').slice(-10),
                city: userAddress.city,
                postalCode: userAddress.postalCode,
                email: 'user@example.com',
                state: 'UP'
            });
        }
    }, [showAddressModal, userAddress, reset]);

    // Initial Load
    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCartItems(savedCart);

        try {
            const rawUserData = localStorage.getItem('userData');
            const userData = rawUserData ? JSON.parse(rawUserData) : {};
            setUserPoints(userData.loyaltyPoints || 0);
        } catch (err) {
            console.warn('Invalid userData in localStorage:', err);
            setUserPoints(0);
        }

        const initialQuantities = {};
        savedCart.forEach(item => {
            const id = item._id || item.id;
            initialQuantities[id] = item.quantity || item.qty || 1;
        });
        setQuantities(initialQuantities);

        syncWishlist();

        window.addEventListener("wishlistUpdated", syncWishlist);
        return () => {
            window.removeEventListener("wishlistUpdated", syncWishlist);
        };
    }, []);

    useEffect(() => {
        let active = true;
        const sourceProduct = cartItems[0];
        if (!sourceProduct) {
            setComboProduct(null);
            return () => { active = false; };
        }

        const cartIds = new Set(cartItems.map(item => String(item._id || item.id)));
        getFrequentlyBoughtTogetherAPI(sourceProduct._id || sourceProduct.id)
            .then(response => {
                const recommendations = Array.isArray(response?.data) ? response.data : [];
                const recommended = recommendations.find(product =>
                    product && !cartIds.has(String(product._id || product.id)) && Number(product.stock ?? 1) > 0
                );
                if (active) setComboProduct(recommended || null);
            })
            .catch(error => {
                if (active) setComboProduct(null);
                console.warn('Smart combo recommendation unavailable:', error.message);
            });
        return () => { active = false; };
    }, [cartItems]);

    const syncWishlist = () => {
        const savedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        setWishlistItems(savedWishlist);
    };

    // FIX 1: Quantity Change with localStorage Sync
    const handleQuantityChange = (productId, newQuantity) => {
        if (newQuantity < 1) return;

        const updatedQuantities = {
            ...quantities,
            [productId]: newQuantity
        };
        setQuantities(updatedQuantities);

        // Sync local storage so refresh doesn't reset quantity
        const updatedCart = cartItems.map(item => {
            const id = item._id || item.id;
            if (id === productId) {
                return { ...item, quantity: newQuantity, qty: newQuantity };
            }
            return item;
        });

        setCartItems(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
    };

    // Remove Item
    const handleRemoveItem = (productId) => {
        const updatedCart = cartItems.filter(
            item => (item._id || item.id) !== productId
        );

        localStorage.setItem("cart", JSON.stringify(updatedCart));
        setCartItems(updatedCart);
        window.dispatchEvent(new Event("cartUpdated"));
    };

    const handleAddCombo = () => {
        if (!comboProduct) return toast.error('Combo product is unavailable right now.');
        const productId = comboProduct._id || comboProduct.id;
        const existing = cartItems.find(item => String(item._id || item.id) === String(productId));
        const updatedCart = existing
            ? cartItems.map(item => String(item._id || item.id) === String(productId)
                ? { ...item, quantity: (item.quantity || item.qty || 1) + 1, qty: (item.quantity || item.qty || 1) + 1 }
                : item)
            : [...cartItems, { ...comboProduct, quantity: 1, qty: 1 }];
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        setCartItems(updatedCart);
        setQuantities(previous => ({ ...previous, [productId]: (existing?.quantity || existing?.qty || 0) + 1 }));
        window.dispatchEvent(new Event('cartUpdated'));
        toast.success('Pillow added to your cart.');
    };

    // Toggle Wishlist
    const handleToggleWishlist = (product) => {
        let currentWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

        const isPresent = currentWishlist.some(
            item => String(item._id || item.id) === String(product._id || product.id)
        );

        if (isPresent) {
            currentWishlist = currentWishlist.filter(
                item => String(item._id || item.id) !== String(product._id || product.id)
            );
        } else {
            currentWishlist.push({
                _id: product._id || product.id,
                name: product.name,
                image: product.thumbnail || product.image,
                price: product.sellingPrice || product.price,
                brand: product.brand || "Aaramdehi"
            });
        }

        localStorage.setItem("wishlist", JSON.stringify(currentWishlist));
        window.dispatchEvent(new Event("wishlistUpdated"));
        syncWishlist();
    };

    // Price Calculations
    const prices = useMemo(() => {
        let mrp = 0;
        let sellingTotal = 0;

        cartItems.forEach(item => {
            const id = item._id || item.id;
            const qty = quantities[id] || item.qty || 1;

            const salePrice = item.price || item.sellingPrice || 0;
            const basePrice = item.originalPrice || item.mrp || (item.sellingPrice > salePrice ? item.sellingPrice : salePrice) || salePrice;

            mrp += basePrice * qty;
            sellingTotal += salePrice * qty;
        });

        const pointsValue = usePoints ? Math.min(userPoints, sellingTotal) : 0;
        const discount = mrp - sellingTotal;
        const deliveryFee = sellingTotal >= 2000 ? 0 : 50;
        const total = Math.max(0, sellingTotal + deliveryFee - pointsValue);

        return {
            mrp,
            discount,
            deliveryFee,
            total,
            pointsRedeemed: pointsValue
        };
    }, [cartItems, quantities, usePoints, userPoints]);

    // Save Address
    const onAddressSubmit = (data) => {
        setUserAddress(prev => ({
            ...prev,
            name: data.fullName,
            address: data.address,
            phone: data.phone,
            city: data.city,
            postalCode: data.postalCode
        }));
        setShowAddressModal(false);
        toast.success("Address updated successfully!");
    };

    // Checkout Proceed
    const handleContinue = async () => {
        if (cartItems.length === 0) {
            toast.error("Your cart is empty. Please add items.");
            return;
        }

        if (!userAddress.name || !userAddress.address || !userAddress.phone) {
            toast.error("Please provide a complete shipping address.");
            return;
        }

        if (!localStorage.getItem('userData')) {
            toast.error("Please log in to place an order.");
            navigate('/login');
            return;
        }

        const appliedCouponCode = cartItems.find(item => item.appliedCoupon)?.appliedCoupon || null;

        const orderPayload = {
            orderItems: cartItems.map(item => {
                const itemId = item._id || item.id;
                const quantityValue = Number(quantities[itemId] || item.qty || item.quantity || 1);
                return {
                    ...item,
                    product: itemId,
                    productId: itemId,
                    quantity: quantityValue,
                    qty: quantityValue,
                    price: Number(item.price || item.sellingPrice || item.newPrice || 0),
                    image: item.thumbnail || (item.images && item.images[0]?.url) || item.image || PLACEHOLDER
                };
            }),
            shippingAddress: {
                fullName: userAddress.name || 'Anonymous',
                address: userAddress.address,
                city: userAddress.city || 'N/A',
                pincode: String(userAddress.postalCode || '000000'),
                postalCode: userAddress.postalCode || '000000',
                mobile: userAddress.phone
            },
            paymentInfo: { id: "n/a", status: "pending" },
            paymentMethod: "COD",
            itemsPrice: Number(prices.mrp - prices.discount),
            shippingPrice: Number(prices.deliveryFee),
            taxPrice: 0,
            totalPrice: Number(prices.total),
            totalAmount: Number(prices.total),
            discountAmount: Number(prices.discount),
            loyaltyPointsUsed: prices.pointsRedeemed,
            couponCode: appliedCouponCode,
            deliveryFee: Number(prices.deliveryFee)
        };

        navigate("/payment", {
            state: {
                orderPayload,
                totalAmount: prices.total
            }
        });
    };

    if (cartItems.length === 0) {
        return (
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
        );
    }

    return (
        <section className="bg-gray-100 min-h-screen py-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Address */}
                        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    <IoLocationOutline size={24} className="text-gray-600 mt-1" />
                                    <div>
                                        <h3 className="font-bold text-gray-900">Delivery Address</h3>
                                        <p className="text-sm text-gray-600 mt-2"><span className="font-bold">{userAddress.name}</span></p>
                                        <p className="text-sm text-gray-600 mt-1">{userAddress.address}</p>
                                        <p className="text-sm text-gray-600 mt-1">Phone: {userAddress.phone}</p>
                                        <span className="inline-block text-xs font-bold bg-gray-100 text-gray-700 px-3 py-1 rounded mt-2">{userAddress.addressType}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowAddressModal(true)}
                                    className="text-blue-600 text-sm font-bold hover:underline"
                                >
                                    Change
                                </button>
                            </div>
                        </div>

                        {/* Smart Combo Offer */}
                        {comboProduct && <div className="bg-orange-50 rounded-xl p-6 border border-orange-200 shadow-sm relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-100 rounded-full opacity-50"></div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                                <div className="w-20 h-20 bg-white rounded-lg p-2 shadow-sm flex-shrink-0">
                                    <img
                                        src={comboProduct.thumbnail || comboProduct.images?.[0]?.url || PLACEHOLDER}
                                        alt={comboProduct.name || 'Pillow Suggestion'}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h4 className="font-black text-gray-900 text-sm uppercase">Smart Combo Offer! 🛋️</h4>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Add <span className="font-bold text-gray-800">{comboProduct.name}</span> for just
                                        <span className="text-red-600 font-black ml-1 text-sm">₹{comboProduct.sellingPrice || comboProduct.price}</span>
                                        <span className="text-gray-500 line-through ml-1 text-[10px]">₹{comboProduct.mrp || comboProduct.originalPrice}</span>
                                    </p>
                                </div>
                                <button
                                    onClick={handleAddCombo}
                                    className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-md shadow-gray-900/20"
                                >
                                    + Add to Cart
                                </button>
                            </div>
                        </div>}

                        {/* Products List */}
                        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
                            <div className="space-y-4">
                                {cartItems.map(item => {
                                    const id = item._id || item.id;
                                    const quantity = quantities[id] || item.qty || 1;
                                    const itemTotal = (item.sellingPrice || item.price || 0) * quantity;
                                    const isInWishlist = wishlistItems.some(w => String(w._id || w.id) === String(item._id || item.id));

                                    return (
                                        <div key={id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                                            <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <img
                                                    src={(item.thumbnail || item.image) || PLACEHOLDER}
                                                    alt={item.name}
                                                    className="w-16 h-16 object-contain"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER; }}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900 text-sm mb-1">{item.name}</h4>
                                                <p className="text-xs text-gray-600 mb-2">Seller: {item.brand || 'Aaramdehi'}</p>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="font-bold text-red-500">₹{item.sellingPrice || item.price}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => handleQuantityChange(id, quantity - 1)} className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center text-gray-700 hover:bg-gray-50">−</button>
                                                    <span className="w-6 text-center font-bold text-gray-900">{quantity}</span>
                                                    <button onClick={() => handleQuantityChange(id, quantity + 1)} className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center text-gray-700 hover:bg-gray-50">+</button>
                                                    <span className="text-xs text-gray-600 ml-3">Subtotal: <span className="font-bold text-gray-900 ml-1">₹{itemTotal}</span></span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <button onClick={() => handleToggleWishlist(item)} className="p-2 hover:bg-gray-50 rounded transition-colors">
                                                    {isInWishlist ? <IoHeart size={18} className="text-red-500" /> : <IoHeartOutline size={18} className="text-gray-500" />}
                                                </button>
                                                <button onClick={() => handleRemoveItem(id)} className="text-red-500 text-xs font-bold hover:text-red-600">Remove</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="sticky top-6 bg-white rounded-lg p-6 shadow-sm border border-gray-100">

                            {/* Loyalty Points */}
                            {userPoints > 0 && (
                                <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-black text-blue-900 uppercase">Loyalty Points</p>
                                        <p className="text-xs font-bold text-blue-600">{userPoints} Available</p>
                                    </div>
                                    <label className="flex items-center gap-3 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={usePoints}
                                            onChange={(e) => setUsePoints(e.target.checked)}
                                            className="w-4 h-4 rounded accent-blue-900 cursor-pointer"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Redeem points for ₹{userPoints} discount</span>
                                    </label>
                                </div>
                            )}

                            <h3 className="font-bold text-gray-900 mb-4">Price Details</h3>
                            <div className="space-y-3 pb-4 border-b border-gray-200">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Price (MRP)</span>
                                    <span>₹{prices.mrp}</span>
                                </div>

                                {prices.discount > 0 && (
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Product Discount</span>
                                        <span className="text-green-600 font-bold">−₹{prices.discount}</span>
                                    </div>
                                )}

                                {prices.pointsRedeemed > 0 && (
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Points Redeemed</span>
                                        <span className="text-blue-600 font-bold">−₹{prices.pointsRedeemed}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Delivery Charge</span>
                                    <span className="flex flex-col items-end">
                                        {prices.mrp - prices.discount >= 2000 && <span className="text-[10px] line-through text-gray-500">₹50</span>}
                                        {prices.deliveryFee === 0 ? <span className="text-green-600 font-bold">FREE</span> : `₹${prices.deliveryFee}`}
                                    </span>
                                </div>
                            </div>

                            <div className="py-4 mb-4">
                                <div className="flex justify-between text-lg">
                                    <span className="font-bold text-gray-900">Total Amount</span>
                                    <span className="font-bold text-red-500">₹{prices.total}</span>
                                </div>
                                {prices.discount > 0 && (
                                    <p className="text-xs text-green-600 font-bold mt-2">You saved ₹{prices.discount} on products!</p>
                                )}
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
                        <form onSubmit={handleSubmit(onAddressSubmit)} className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-gray-700 block mb-1">Full Name</label>
                                <input
                                    type="text"
                                    {...register('fullName')}
                                    className={`w-full border rounded px-3 py-2 text-sm focus:outline-none ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.fullName && <p className="text-red-500 text-[10px] mt-1">{errors.fullName.message}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700 block mb-1">Address</label>
                                <textarea
                                    {...register('address')}
                                    className={`w-full border rounded px-3 py-2 text-sm focus:outline-none h-20 resize-none ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.address && <p className="text-red-500 text-[10px] mt-1">{errors.address.message}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-sm font-bold text-gray-700 block mb-1">City</label>
                                    <input type="text" {...register('city')} className={`w-full border rounded px-3 py-2 text-sm ${errors.city ? 'border-red-500' : 'border-gray-300'}`} />
                                    {errors.city && <p className="text-red-500 text-[10px] mt-1">{errors.city.message}</p>}
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-700 block mb-1">Pincode</label>
                                    <input type="text" inputMode="numeric" maxLength={6} {...register('postalCode')} className={`w-full border rounded px-3 py-2 text-sm ${errors.postalCode ? 'border-red-500' : 'border-gray-300'}`} />
                                    {errors.postalCode && <p className="text-red-500 text-[10px] mt-1">{errors.postalCode.message}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700 block mb-1">Phone (10 Digits)</label>
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    maxLength={10}
                                    {...register('phone')}
                                    className={`w-full border rounded px-3 py-2 text-sm focus:outline-none ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.phone && <p className="text-red-500 text-[10px] mt-1">{errors.phone.message}</p>}
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setShowAddressModal(false)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded font-bold text-sm">Cancel</button>
                                <button type="submit" className="flex-1 bg-blue-900 text-white py-2 rounded font-bold text-sm">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
};

export default CheckoutPage;