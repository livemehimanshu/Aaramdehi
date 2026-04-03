import React, { useState, useEffect, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules'; 
import { IoHeartOutline, IoHeart } from "react-icons/io5";
import { Link } from 'react-router-dom'; // Product page navigation ke liye

// Data aur Utils
import { ALL_PRODUCTS_DATA } from '../../src/data/products';

// Swiper Styles
import 'swiper/css';

const PopularProducts = () => {
    const [activeTab, setActiveTab] = useState('PILLOWS');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [wishlistItems, setWishlistItems] = useState([]);

    const tabs = ['PILLOWS', 'BOLSTERS', 'CUSHIONS', 'ACCESSORIES', 'WELLNESS'];

    // --- WISHLIST SYNC ---
    const syncWishlist = useCallback(() => {
        const savedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        setWishlistItems(savedWishlist);
    }, []);

    useEffect(() => {
        setLoading(true);
        // Sirf popular products ya category wise data filter kar sakte ho
        const popularData = ALL_PRODUCTS_DATA.filter(p => p.rating >= 4.5);
        setProducts(popularData.length > 0 ? popularData : ALL_PRODUCTS_DATA);
        setLoading(false);

        syncWishlist();
        window.addEventListener("wishlistUpdated", syncWishlist);
        return () => window.removeEventListener("wishlistUpdated", syncWishlist);
    }, [activeTab, syncWishlist]);

    // --- TOGGLE WISHLIST ---
    const handleToggleWishlist = (e, product) => {
        e.preventDefault();
        e.stopPropagation(); // Link click (navigation) ko rokne ke liye

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

    return (
        <section className="py-12 bg-white relative font-sans">
            <div className="container mx-auto px-4">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 border-b pb-4 gap-6">
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">Popular Products</h2>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Premium Home Collection</p>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide w-full md:w-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`text-[11px] font-black uppercase tracking-[2px] transition-all pb-2 border-b-2 whitespace-nowrap ${
                                    activeTab === tab ? 'text-red-500 border-red-500' : 'text-gray-300 border-transparent hover:text-gray-800'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* FAST SWIPER SLIDER (No Arrows, Autoplay On) */}
                {loading ? (
                    <div className="h-64 flex items-center justify-center font-bold text-gray-200 uppercase tracking-widest">Loading...</div>
                ) : (
                    <Swiper
                        modules={[Autoplay]}
                        autoplay={{
                            delay: 2000, // 2 Seconds delay
                            disableOnInteraction: false,
                        }}
                        speed={800} // Smooth transition speed
                        loop={true}
                        spaceBetween={20}
                        slidesPerView={1}
                        breakpoints={{
                            480: { slidesPerView: 2 },
                            768: { slidesPerView: 3 },
                            1024: { slidesPerView: 5 },
                        }}
                        className="popular-products-swiper !pb-10"
                    >
                        {products.map((item) => {
                            const isInWishlist = wishlistItems.some(w => String(w.id) === String(item.id));
                            return (
                                <SwiperSlide key={item.id}>
                                    {/* Product Card as Link to Product Details Page */}
                                    <Link 
                                        to={`/product/${item.id}`}
                                        className="bg-white border border-gray-100 p-4 rounded-sm block cursor-pointer group relative transition-all duration-500 hover:shadow-[0_15px_45px_rgba(0,0,0,0.06)]"
                                    >
                                        {/* Wishlist Button */}
                                        <button 
                                            onClick={(e) => handleToggleWishlist(e, item)}
                                            className="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center bg-white shadow-sm rounded-full border border-gray-50 transition-all hover:bg-red-500 hover:text-white"
                                        >
                                            {isInWishlist ? (
                                                <IoHeart className="text-red-500" size={18} />
                                            ) : (
                                                <IoHeartOutline size={18} className="text-gray-300" />
                                            )}
                                        </button>

                                        {/* Image Area */}
                                        <div className="relative overflow-hidden aspect-square mb-5 flex items-center justify-center bg-[#fcfcfc] rounded-sm">
                                            <img 
                                                src={item.image} 
                                                alt={item.name} 
                                                className="w-[80%] h-[80%] object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110" 
                                            />
                                            {/* Visual Overlay feedback */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300"></div>
                                        </div>

                                        {/* Product Info */}
                                        <div className="text-left">
                                            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">{item.brand || "Aaramdehi"}</p>
                                            <h3 className="text-[13px] font-bold text-gray-800 truncate mb-2 group-hover:text-red-500 transition-colors">{item.name}</h3>
                                            
                                            <div className="flex items-center gap-2">
                                                <span className="text-[16px] font-black text-gray-900">₹{item.price || item.newPrice}</span>
                                                {item.oldPrice && <span className="text-[12px] text-gray-300 line-through font-bold">₹{item.oldPrice}</span>}
                                            </div>

                                            {/* Text indicator for Product Page navigation */}
                                            <p className="text-[10px] text-blue-900 font-black mt-4 opacity-0 group-hover:opacity-100 transition-opacity tracking-widest uppercase">
                                                View Details →
                                            </p>
                                        </div>
                                    </Link>
                                </SwiperSlide>
                            )
                        })}
                    </Swiper>
                )}
            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .popular-products-swiper .swiper-wrapper { transition-timing-function: ease-out !important; }
            `}</style>
        </section>
    );
};

export default PopularProducts;