import React, { useState, useCallback, useEffect } from 'react';
import { IoHeartOutline, IoHeart, IoArrowForward } from "react-icons/io5";
import { Link } from 'react-router-dom';

const ProductRow = ({ title, products = [], categoryPath = '/category/all' }) => {
    const [wishlistItems, setWishlistItems] = useState([]);

    // --- WISHLIST SYNC ---
    const syncWishlist = useCallback(() => {
        const savedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        setWishlistItems(savedWishlist);
    }, []);

    useEffect(() => {
        syncWishlist();
        window.addEventListener("wishlistUpdated", syncWishlist);
        return () => window.removeEventListener("wishlistUpdated", syncWishlist);
    }, [syncWishlist]);

    // --- TOGGLE WISHLIST ---
    const handleToggleWishlist = (e, product) => {
        e.preventDefault();
        e.stopPropagation();

        let currentWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        const isPresent = currentWishlist.some(item => String(item.id) === String(product.id));

        if (isPresent) {
            currentWishlist = currentWishlist.filter(item => String(item.id) !== String(product.id));
        } else {
            currentWishlist.push({
                id: product.id,
                name: product.name,
                image: product.image,
                price: product.price || product.newPrice,
                brand: product.brand || "Aaramdehi"
            });
        }

        localStorage.setItem("wishlist", JSON.stringify(currentWishlist));
        window.dispatchEvent(new Event("wishlistUpdated"));
        syncWishlist();
    };

    // Calculate discount percentage
    const getDiscountPercentage = (price, oldPrice) => {
        if (!oldPrice) return 0;
        return Math.round(((oldPrice - price) / oldPrice) * 100);
    };

    return (
        <section className="bg-white py-8 border-b border-gray-100">
            <div className="container mx-auto px-4">
                {/* Header with Title and View All Button */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tighter">
                        {title}
                    </h2>
                    <Link
                        to={categoryPath}
                        className="flex items-center gap-2 bg-red-500 text-white px-4 md:px-6 py-2 rounded-sm font-bold text-sm uppercase tracking-widest hover:bg-red-600 transition-colors duration-300"
                    >
                        View All
                        <IoArrowForward size={16} />
                    </Link>
                </div>

                {/* Horizontal Scrolling Container */}
                <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                    <div className="flex gap-4 pb-2">
                        {products && products.length > 0 ? (
                            products.map((product) => {
                                const isInWishlist = wishlistItems.some(w => String(w.id) === String(product.id));
                                const discountPercent = getDiscountPercentage(product.price, product.oldPrice);

                                return (
                                    <Link
                                        key={product.id}
                                        to={`/product/${product.id}`}
                                        className="flex-shrink-0 w-48 bg-white border border-gray-100 rounded-sm overflow-hidden group transition-all duration-500 hover:shadow-lg"
                                    >
                                        {/* Image Container */}
                                        <div className="relative aspect-square overflow-hidden bg-gray-50 flex items-center justify-center">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-[85%] h-[85%] object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
                                            />

                                            {/* Wishlist Button */}
                                            <button
                                                onClick={(e) => handleToggleWishlist(e, product)}
                                                className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-white shadow-sm rounded-full border border-gray-50 transition-all hover:bg-red-500 hover:text-white z-10"
                                            >
                                                {isInWishlist ? (
                                                    <IoHeart className="text-red-500" size={18} />
                                                ) : (
                                                    <IoHeartOutline size={18} className="text-gray-300" />
                                                )}
                                            </button>

                                            {/* Discount Badge */}
                                            {discountPercent > 0 && (
                                                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                                    {discountPercent}% OFF
                                                </div>
                                            )}

                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300"></div>
                                        </div>

                                        {/* Product Info */}
                                        <div className="p-4">
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                                {product.brand || "Aaramdehi"}
                                            </p>
                                            <h3 className="text-sm font-bold text-gray-800 truncate mb-2 group-hover:text-red-500 transition-colors">
                                                {product.name}
                                            </h3>

                                            {/* Price and Discount */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-black text-red-500">
                                                    ₹{product.price}
                                                </span>
                                                {product.oldPrice && (
                                                    <span className="text-xs text-gray-400 line-through font-bold">
                                                        ₹{product.oldPrice}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Rating */}
                                            {product.rating && (
                                                <p className="text-xs text-yellow-500 font-bold mt-2">
                                                    ★ {product.rating} / 5
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                            <div className="w-full h-48 flex items-center justify-center text-gray-400 font-bold uppercase">
                                No Products Available
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
            `}</style>
        </section>
    );
};

export default ProductRow;
