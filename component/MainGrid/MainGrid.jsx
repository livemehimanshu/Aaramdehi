import React, { useState, useEffect, useCallback } from 'react';
import { IoHeartOutline, IoHeart, IoCartOutline } from "react-icons/io5";
import { Link } from 'react-router-dom';
import axios from 'axios';

// Local fallback data
import { ALL_PRODUCTS_DATA } from '../../src/data/products';

const MainGrid = ({ apiEndpoint = null }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [cartItems, setCartItems] = useState([]);

    // --- WISHLIST SYNC ---
    const syncWishlist = useCallback(() => {
        const savedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        setWishlistItems(savedWishlist);
    }, []);

    // --- CART SYNC ---
    const syncCart = useCallback(() => {
        const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCartItems(savedCart);
    }, []);

    // --- FETCH PRODUCTS ---
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);

                // Try to fetch from API if endpoint provided
                if (apiEndpoint) {
                    try {
                        const response = await axios.get(apiEndpoint, {
                            timeout: 5000,
                            headers: {
                                'Content-Type': 'application/json',
                            }
                        });
                        setProducts(response.data.products || response.data);
                    } catch (apiError) {
                        console.warn('API fetch failed, using local data:', apiError.message);
                        setProducts(ALL_PRODUCTS_DATA);
                    }
                } else {
                    // Use local data if no API endpoint provided
                    setProducts(ALL_PRODUCTS_DATA);
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Failed to load products');
                setProducts(ALL_PRODUCTS_DATA);
                setLoading(false);
            }
        };

        fetchProducts();
    }, [apiEndpoint]);

    // Listen for wishlist and cart updates
    useEffect(() => {
        syncWishlist();
        syncCart();

        window.addEventListener("wishlistUpdated", syncWishlist);
        window.addEventListener("cartUpdated", syncCart);

        return () => {
            window.removeEventListener("wishlistUpdated", syncWishlist);
            window.removeEventListener("cartUpdated", syncCart);
        };
    }, [syncWishlist, syncCart]);

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

    // --- ADD TO CART ---
    const handleAddToCart = (e, product) => {
        e.preventDefault();
        e.stopPropagation();

        let currentCart = JSON.parse(localStorage.getItem("cart")) || [];
        const existingItem = currentCart.find(item => String(item.id) === String(product.id));

        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
            currentCart.push({
                id: product.id,
                name: product.name,
                image: product.image,
                price: product.price || product.newPrice,
                brand: product.brand || "Aaramdehi",
                quantity: 1
            });
        }

        localStorage.setItem("cart", JSON.stringify(currentCart));
        window.dispatchEvent(new Event("cartUpdated"));
        syncCart();
    };

    // Calculate discount percentage
    const getDiscountPercentage = (price, oldPrice) => {
        if (!oldPrice) return 0;
        return Math.round(((oldPrice - price) / oldPrice) * 100);
    };

    if (error && products.length === 0) {
        return (
            <section className="bg-white py-12">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-red-500 font-bold text-lg">{error}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-white py-12">
            <div className="container mx-auto px-4">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter mb-10">
                    All Products
                </h2>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="bg-gray-100 rounded-sm animate-pulse h-64"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {products && products.length > 0 ? (
                            products.map((product) => {
                                const isInWishlist = wishlistItems.some(w => String(w.id) === String(product.id));
                                const isInCart = cartItems.some(c => String(c.id) === String(product.id));
                                const discountPercent = getDiscountPercentage(product.price, product.oldPrice);

                                return (
                                    <Link
                                        key={product.id}
                                        to={`/product/${product.id}`}
                                        className="bg-white border border-gray-100 rounded-sm overflow-hidden group transition-all duration-500 hover:shadow-lg"
                                    >
                                        {/* Image Container */}
                                        <div className="relative aspect-square overflow-hidden bg-gray-50 flex items-center justify-center">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-[80%] h-[80%] object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
                                            />

                                            {/* Wishlist Button */}
                                            <button
                                                onClick={(e) => handleToggleWishlist(e, product)}
                                                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white shadow-sm rounded-full border border-gray-50 transition-all hover:bg-red-500 hover:text-white z-10"
                                            >
                                                {isInWishlist ? (
                                                    <IoHeart className="text-red-500" size={16} />
                                                ) : (
                                                    <IoHeartOutline size={16} className="text-gray-300" />
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
                                        <div className="p-3">
                                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1 truncate">
                                                {product.brand || "Aaramdehi"}
                                            </p>
                                            <h3 className="text-xs font-bold text-gray-800 line-clamp-2 mb-2 group-hover:text-red-500 transition-colors h-8">
                                                {product.name}
                                            </h3>

                                            {/* Price */}
                                            <div className="flex items-center gap-1 mb-2">
                                                <span className="text-sm font-black text-red-500">
                                                    ₹{product.price}
                                                </span>
                                                {product.oldPrice && (
                                                    <span className="text-[10px] text-gray-400 line-through font-bold">
                                                        ₹{product.oldPrice}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Rating */}
                                            {product.rating && (
                                                <p className="text-[10px] text-yellow-500 font-bold mb-3">
                                                    ★ {product.rating}
                                                </p>
                                            )}

                                            {/* Add to Cart Button */}
                                            <button
                                                onClick={(e) => handleAddToCart(e, product)}
                                                className={`w-full py-2 flex items-center justify-center gap-1 rounded-sm font-bold text-xs uppercase tracking-widest transition-all ${
                                                    isInCart
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-gray-50 text-red-500 border border-gray-200 hover:bg-red-500 hover:text-white'
                                                }`}
                                            >
                                                <IoCartOutline size={14} />
                                                {isInCart ? 'In Cart' : 'Add Cart'}
                                            </button>
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <p className="text-gray-400 font-bold uppercase tracking-widest">
                                    No Products Available
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default MainGrid;
