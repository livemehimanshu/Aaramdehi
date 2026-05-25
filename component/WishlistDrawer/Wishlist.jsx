import React, { useState, useEffect } from 'react';
import { IoTrashOutline } from "react-icons/io5";
import { FiShoppingCart } from "react-icons/fi";
import { Link } from 'react-router-dom';

const Wishlist = () => {
    const [wishlistItems, setWishlistItems] = useState([]);

    // 1. LocalStorage se Data Load karna
    const loadWishlist = () => {
        const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        setWishlistItems(wishlist);
    };

    useEffect(() => {
        loadWishlist();
        // Jab kisi aur component (Drawer) se update ho toh sync karein
        window.addEventListener("wishlistUpdated", loadWishlist);
        return () => window.removeEventListener("wishlistUpdated", loadWishlist);
    }, []);

    // 2. Wishlist se Item Delete karna
    const removeFromWishlist = (id) => {
        const updatedWishlist = wishlistItems.filter(item => item.id !== id);
        setWishlistItems(updatedWishlist);
        localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
        // Header/Drawer ko notify karein
        window.dispatchEvent(new Event("wishlistUpdated"));
    };

    // 3. Add to Cart Function (Full Logic)
    const moveToCart = (item) => {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        const isExist = cart.find(cartItem => cartItem.id === item.id);

        if (isExist) {
            cart = cart.map(cartItem => 
                cartItem.id === item.id 
                    ? { ...cartItem, qty: (cartItem.qty || 1) + 1 } 
                    : cartItem
            );
        } else {
            cart.push({ ...item, qty: 1 });
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        
        // Cart count update karne ke liye event
        window.dispatchEvent(new Event("cartUpdated"));
        
        // Wishlist se remove karein
        removeFromWishlist(item.id);
        
        // Success alert (Optional)
        alert(`${item.name} added to cart!`);
    };

    return (
        <div className="flex-1 bg-white ml-4 shadow-sm border border-gray-100 rounded-sm overflow-hidden">
            {/* Header Area */}
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">
                    My Wishlist ({wishlistItems.length})
                </h2>
            </div>
            
            {wishlistItems.length > 0 ? (
                <div className="flex flex-col">
                    {wishlistItems.map((item) => (
                        <div key={item.id} className="flex gap-6 p-6 border-b border-gray-100 hover:bg-gray-50 transition-all group">
                            
                            {/* Product Image */}
                            <div className="w-28 h-32 bg-gray-50 rounded p-2 flex-shrink-0">
                                <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    className="w-full h-full object-contain mix-blend-multiply" 
                                />
                            </div>
                            
                            {/* Product Details */}
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div className="max-w-xl">
                                        <h3 className="text-md font-medium text-gray-800 mb-1 line-clamp-1">
                                            {item.name}
                                        </h3>
                                        
                                        {/* Ratings Badge */}
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded-sm font-bold flex items-center gap-1">
                                                4.2 ★
                                            </span>
                                            <span className="text-gray-400 text-xs font-semibold">(1,245)</span>
                                            <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62673a.png" 
                                                 alt="assured" className="h-4 ml-2" />
                                        </div>

                                        {/* Price Section */}
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl font-bold text-gray-900">
                                                ₹{(item.price || item.newPrice || 0).toLocaleString()}
                                            </span>
                                            <span className="text-gray-400 line-through text-sm">
                                                ₹{(item.oldPrice || (item.price + 500)).toLocaleString()}
                                            </span>
                                            <span className="text-green-600 text-sm font-bold">
                                                {Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100) || 60}% off
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <button 
                                        onClick={() => removeFromWishlist(item.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                        title="Remove from Wishlist"
                                    >
                                        <IoTrashOutline size={22} />
                                    </button>
                                </div>

                                {/* Add to Cart Button */}
                                <div className="mt-6">
                                    <button
                                        onClick={() => moveToCart(item)}
                                        className="flex items-center justify-center gap-2 bg-[#fb641b] text-white px-10 py-3 rounded-sm text-sm font-bold hover:bg-[#f4510b] hover:shadow-md transition-all uppercase tracking-wide"
                                    >
                                        <FiShoppingCart size={18} />
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Empty Wishlist UI */
                <div className="py-24 text-center">
                    <img 
                        src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/mywishlist-empty_39f7a5.png" 
                        alt="empty-wishlist" 
                        className="w-56 mx-auto mb-6 opacity-80" 
                    />
                    <h3 className="text-xl font-bold text-gray-800">Your wishlist is empty!</h3>
                    <p className="text-gray-500 text-sm mt-2 mb-8">
                        Seems like you haven't added anything to your wishlist yet.
                    </p>
                    <Link 
                        to="/products"
                        className="bg-blue-600 text-white px-12 py-3 rounded-sm font-bold text-sm shadow-md hover:bg-blue-700 uppercase"
                    >
                        Explore Products
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Wishlist;