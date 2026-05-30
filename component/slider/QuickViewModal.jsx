import React, { useState, useEffect, useCallback } from 'react';
import { IoClose, IoHeartOutline, IoHeart, IoSyncOutline, IoStar, IoStarOutline } from "react-icons/io5";
import toast from 'react-hot-toast';

// ===== QUICK VIEW MODAL COMPONENT =====
const QuickViewModal = ({ product, isOpen, onClose }) => {
    // --- STATES ---
    const [quantity, setQuantity] = useState(1);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [isInCompare, setIsInCompare] = useState(false);

    // --- 1. SYNC WISHLIST STATE ---
    // Is function ko use karke hum check karte hain ki product wishlist mein hai ya nahi
    const syncWishlistState = useCallback(() => {
        if (!product) return;
        const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        const productId = product._id || product.id; // Prioritize _id from Firebase, fallback to id
        const isPresent = wishlist.some(item => String(item.id) === String(productId)); // Compare with item.id in wishlist
        setIsInWishlist(isPresent);
    }, [product]);

    // --- 2. SYNC COMPARE STATE ---
    // Compare mein product hai ya nahi check karna
    const syncCompareState = useCallback(() => {
        if (!product) return;
        const compare = JSON.parse(localStorage.getItem("compare")) || [];
        const productId = product._id || product.id; // Prioritize _id from Firebase, fallback to id
        const isPresent = compare.some(item => String(item.id) === String(productId)); // Compare with item.id in compare
        setIsInCompare(isPresent);
    }, [product]);

    // useEffect: Modal khulne par ya product badalne par state update karein
    useEffect(() => {
        if (isOpen) {
            setQuantity(1);
            syncWishlistState();
            syncCompareState();
        }
        
        // Listen to global updates (agar kisi aur component se wishlist/compare change ho)
        window.addEventListener("wishlistUpdated", syncWishlistState);
        window.addEventListener("compareUpdated", syncCompareState);
        return () => {
            window.removeEventListener("wishlistUpdated", syncWishlistState);
            window.removeEventListener("compareUpdated", syncCompareState);
        };
    }, [isOpen, syncWishlistState, syncCompareState]);

    // --- 2. HANDLE WISHLIST TOGGLE ---
    const handleToggleWishlist = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        try {
            let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
            const productId = product._id || product.id; // Prioritize _id from Firebase, fallback to id
            const isPresent = wishlist.some(item => String(item.id) === String(productId)); // Compare with item.id in wishlist
            
            if (isPresent) {
                // Remove from wishlist
                wishlist = wishlist.filter(item => String(item.id) !== String(productId));
                console.log("❌ Removed:", product.name);
            } else {
                // Add to wishlist - pure product object ke saath (consistent with ProductListing)
                const productToSave = {
                    id: productId,
                    name: product.name || "Unknown Product",
                    brand: product.brand || "Aaramdehi",
                    price: product.sellingPrice || product.price || product.newPrice || 0,
                    oldPrice: product.oldPrice || 0,
                    rating: product.rating || 5,
                    image: product.thumbnail || (product.images && product.images[0]?.url) || product.image || "", // Use thumbnail or images array
                    category: product.category || "Uncategorized"
                };
                wishlist.push(productToSave);
                if (wishlist[wishlist.length - 1].price === 0) {
                    console.warn("Product added to wishlist with 0 price from QuickViewModal:", product.name, "Original product:", product);
                }
                console.log("❤️ Added:", product.name);
            }
            
            // Save to localStorage
            localStorage.setItem("wishlist", JSON.stringify(wishlist));
            
            // Global event dispatch (Bahut important hai Drawer ko refresh karne ke liye)
            window.dispatchEvent(new Event("wishlistUpdated"));
            
            // Local state update
            syncWishlistState();
        } catch (error) {
            console.error("❌ Wishlist error:", error);
        }
    };

    // --- 3. HANDLE ADD TO CART ---
    const handleAddToCart = () => {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        const productId = product._id || product.id; // Prioritize _id from Firebase, fallback to id
        const isExist = cart.find(item => String(item.id) === String(productId)); // Compare with item.id in cart

        if (isExist) {
            cart = cart.map(item => 
                String(item.id) === String(productId) ? { ...item, qty: item.qty + quantity } : item
            );
        } else {
            cart.push({ 
                ...product, // Pura product object save karein
                qty: quantity, 
                id: productId, // Consistent ID: Use id for cart
                price: product.sellingPrice || product.price || product.newPrice 
            });
            if (cart[cart.length - 1].price === 0) {
                console.warn("Product added to cart with 0 price from QuickViewModal:", product.name, "Original product:", product);
            }
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        window.dispatchEvent(new Event("cartUpdated"));
        
        // Success feedback
        toast.success(`${product.name} added to cart!`);
        onClose(); 
    };

    // --- 4. HANDLE COMPARE TOGGLE ---
    const handleToggleCompare = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        try {
            let compare = JSON.parse(localStorage.getItem("compare")) || [];
            const productId = product._id || product.id; // Prioritize _id from Firebase, fallback to id
            const isPresent = compare.some(item => String(item.id) === String(productId)); // Compare with item.id in compare

            // Maximum 3 products constraint
            if (!isPresent && compare.length >= 3) {
                toast.error("Maximum 3 products allowed for comparison!");
                return;
            }

            if (isPresent) {
                // Remove from compare (consistent with item.id)
                compare = compare.filter(item => String(item.id) !== String(productId));
                console.log("⚖️ Removed from Compare:", product.name);
                toast.error("Removed from comparison");
            } else {
                // Add to compare
                const productToSave = { // Ensure id is present for compare
                    id: productId,
                    name: product.name || "Unknown Product",
                    brand: product.brand || "Aaramdehi",
                    price: product.sellingPrice || product.price || product.newPrice || 0,
                    oldPrice: product.oldPrice || 0,
                    rating: product.rating || 5,
                    image: product.image || "",
                    category: product.category || "Uncategorized"
                };
                compare.push(productToSave);
                if (compare[compare.length - 1].price === 0) {
                    console.warn("Product added to compare with 0 price from QuickViewModal:", product.name, "Original product:", product);
                }
                console.log("⚖️ Added to Compare:", product.name);
                toast.success("Added to comparison!");
            }
            
            // Save to localStorage
            localStorage.setItem("compare", JSON.stringify(compare));
            
            // Global event dispatch
            window.dispatchEvent(new Event("compareUpdated"));
            
            // Local state update
            syncCompareState();
        } catch (error) {
            console.error("⚠️ Compare error:", error);
        }
    };

    if (!isOpen || !product) return null;

    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 transition-all duration-300">
            <div className="bg-white w-full max-w-5xl rounded-sm shadow-2xl relative flex flex-col md:flex-row overflow-hidden max-h-[90vh] animate-in fade-in zoom-in duration-300">
                
                {/* Close Button */}
                <button 
                    onClick={onClose} 
                    className="absolute right-4 top-4 text-2xl text-gray-400 hover:text-red-500 z-50 bg-gray-100 rounded-full p-1 transition-all shadow-sm"
                >
                    <IoClose />
                </button>

                {/* Left Side: Product Image */}
                <div className="md:w-1/2 p-8 bg-[#fcfcfc] flex items-center justify-center border-r">
                    <img 
                        src={product.thumbnail || (product.images && product.images[0]?.url) || product.image || "https://placehold.co/400x400?text=Product"}
                        alt={product.name} 
                        className="max-h-[380px] w-full object-contain mix-blend-multiply transition-transform hover:scale-105 duration-500" 
                    />
                </div>

                {/* Right Side: Product Details */}
                <div className="md:w-1/2 p-10 overflow-y-auto text-left">
                    <h1 className="text-2xl font-black text-gray-900 leading-tight mb-2 uppercase tracking-tighter">
                        {product.name}
                    </h1>
                    
                    {/* Rating Section */}
                    <div className="flex items-center gap-4 mb-5 border-b pb-4">
                        <div className="flex text-yellow-400 text-sm">
                            {[...Array(5)].map((_, i) => (
                                i < Math.floor(product.rating || 4) ? <IoStar key={i} /> : <IoStarOutline key={i} />
                            ))}
                        </div>
                        <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">
                            (1 Customer Review)
                        </span>
                    </div>

                    {/* Stock & Brand Info */}
                    <div className="space-y-1 mb-6">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Brand: <span className="text-gray-900 ml-2 font-black">{product.brand || "Aaramdehi"}</span>
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Status: <span className="text-green-600 ml-2 font-black">Available (85 Items)</span>
                        </p>
                    </div>

                    {/* Price Section */}
                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-4xl font-black text-red-500">₹{(product.sellingPrice || product.price || product.newPrice || 0).toLocaleString()}</span>
                        {product.oldPrice && (
                            <span className="text-xl text-gray-300 line-through font-bold">₹{product.oldPrice}</span>
                        )}
                    </div>

                    <p className="text-sm text-gray-500 leading-relaxed mb-8">
                        Our premium products provide perfect support and comfort for your home. High-quality materials ensure long-lasting durability.
                    </p>

                    {/* Quantity & Add to Cart Controls */}
                    <div className="flex gap-4 mb-8">
                        <div className="flex items-center border border-gray-200 h-14 rounded-sm bg-white">
                            <button 
                                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                                className="px-5 h-full hover:bg-gray-50 font-black transition-all text-gray-400 border-r"
                            >
                                －
                            </button>
                            <span className="w-12 text-center font-black text-sm text-gray-800">
                                {quantity}
                            </span>
                            <button 
                                onClick={() => setQuantity(quantity + 1)}
                                className="px-5 h-full hover:bg-gray-50 font-black transition-all text-gray-400 border-l"
                            >
                                ＋
                            </button>
                        </div>
                        
                        <button 
                            onClick={handleAddToCart}
                            className="flex-1 bg-red-500 text-white h-14 px-8 font-black uppercase text-xs tracking-[2px] hover:bg-black transition-all shadow-xl shadow-red-500/10 active:translate-y-1"
                        >
                            Add to Cart
                        </button>
                    </div>

                    {/* Footer Actions: Wishlist & Compare */}
                    <div className="flex gap-8 border-t pt-6">
                        <button 
                            onClick={handleToggleWishlist}
                            className={`flex items-center gap-2 text-[10px] font-black uppercase transition-all tracking-widest ${
                                isInWishlist ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                            }`}
                        >
                            {isInWishlist ? <IoHeart size={18}/> : <IoHeartOutline size={18}/>}
                            {isInWishlist ? 'Added to Wishlist' : 'Add to Wishlist'}
                        </button>
                        
                        <button 
                            onClick={handleToggleCompare}
                            className={`flex items-center gap-2 text-[10px] font-black uppercase transition-all tracking-widest ${
                                isInCompare ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'
                            }`}
                        >
                            <IoSyncOutline size={18}/> 
                            {isInCompare ? 'Remove Compare' : 'Add Compare'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickViewModal;