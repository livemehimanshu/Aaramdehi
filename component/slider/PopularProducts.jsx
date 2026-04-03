import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { IoClose, IoHeartOutline, IoSyncOutline, IoStar, IoStarOutline } from "react-icons/io5";

// Utils and Styles
// Note: Ensure this path is correct based on your folder structure
import { addToRecentlyViewed } from '../../src/data/recentlyViewedUtils'; 
import 'swiper/css';
import 'swiper/css/navigation';

const PopularProducts = () => {
    // --- STATE MANAGEMENT ---
    const [activeTab, setActiveTab] = useState('PILLOWS');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);

    const tabs = ['PILLOWS', 'BOLSTERS', 'CUSHIONS', 'ACCESSORIES', 'WELLNESS'];

    // useEffect: Fetching dummy data based on active category
    useEffect(() => {
        const getProducts = async () => {
            setLoading(true);
            // Simulated API Data
            const dummyData = [
                { 
                    id: 1, 
                    brand: "Aaramdehi Premium", 
                    name: "Luxury Microfiber Soft Pillow (Pack of 2)", 
                    rating: 4.5, 
                    oldPrice: 1599, 
                    newPrice: 949, 
                    stock: 147, 
                    image: "https://rukminim2.flixcart.com/image/1086/1086/xif0q/pillow/t/v/v/17-white-soft-microfiber-pillow-pack-of-2-17-27-2-p-2-m-p-2-original-imahfzhgzff9ay8h.jpeg", 
                    description: "Experience ultimate comfort with Aaramdehi's signature microfiber pillows. Designed for all types of sleepers with pure organic materials." 
                },
                { 
                    id: 2, 
                    brand: "Aaramdehi Comfort", 
                    name: "Satin Plain White Fiber Bolster", 
                    rating: 4.2, 
                    oldPrice: 1299, 
                    newPrice: 849, 
                    stock: 85, 
                    image: "https://rukminim2.flixcart.com/image/1086/1086/k7f26kw0/bolster/v/j/z/plain-bolster-white-1-bolster-white-satin-plain-white-fiber-original-imafpnzdqghvggym.jpeg", 
                    description: "Our satin bolsters provide perfect cylindrical support for your diwan or bed. High-density fiber ensures long shape life." 
                },
                { 
                    id: 3, 
                    brand: "Aaramdehi Essence", 
                    name: "Fragrant Mogra Sleep Spray (100ml)", 
                    rating: 4.9, 
                    oldPrice: 250, 
                    newPrice: 150, 
                    stock: 200, 
                    image: "https://rukminim2.flixcart.com/image/612/612/k7f26kw0/air-freshner/mogra-natural.jpeg", 
                    description: "Infused with the calming scent of fresh Mogra flowers. Spritz on your pillow before bed for a relaxing sleep." 
                },
                { 
                    id: 4, 
                    brand: "Aaramdehi Health", 
                    name: "Memory Foam Orthopedic Pillow", 
                    rating: 4.7, 
                    oldPrice: 2499, 
                    newPrice: 1299, 
                    stock: 45, 
                    image: "https://rukminim2.flixcart.com/image/1086/1086/xif0q/pillow/l/u/x/16-orthopaedic-memory-foam-pillow-original-imahfzhggh.jpeg", 
                    description: "Scientifically designed to relieve neck pain. Adapts to your body heat and weight for personalized support." 
                },
                { 
                    id: 5, 
                    brand: "Aaramdehi Decor", 
                    name: "Decorative Floral Sofa Cushion", 
                    rating: 4.4, 
                    oldPrice: 599, 
                    newPrice: 299, 
                    stock: 120, 
                    image: "https://rukminim2.flixcart.com/image/1086/1086/xif0q/cushion/s/o/f/decorative-floral-original-imahfzhg44.jpeg", 
                    description: "Add a touch of elegance to your living room with our premium vibrant floral pattern cushions." 
                }
            ];
            setProducts(dummyData);
            setLoading(false);
        };
        getProducts();
    }, [activeTab]);

    // --- Handlers ---
    const handleQuickView = (product) => {
        if (typeof addToRecentlyViewed === 'function') {
            addToRecentlyViewed(product);
        }
        setSelectedProduct(product);
        setQuantity(1); 
        setIsModalOpen(true);
    };

    const handleIncrement = () => setQuantity(q => q + 1);
    const handleDecrement = () => quantity > 1 && setQuantity(q => q - 1);

    const handleAddToCart = () => {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        const productWithQty = { ...selectedProduct, qty: quantity };
        const isExist = cart.find(item => item.id === selectedProduct.id);

        if (isExist) {
            cart = cart.map(item => 
                item.id === selectedProduct.id ? { ...item, qty: item.qty + quantity } : item
            );
        } else {
            cart.push(productWithQty);
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        window.dispatchEvent(new Event("cartUpdated"));
        alert(`${selectedProduct.name} added to cart!`);
        setIsModalOpen(false);
    };

    return (
        <section className="py-12 bg-gray-50 min-h-screen relative font-sans">
            <div className="container mx-auto px-4">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 border-b pb-4 gap-6">
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Popular Products</h2>
                        <p className="text-gray-400 text-xs font-medium">Do not miss the current offers until the end of March.</p>
                    </div>

                    <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide w-full md:w-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`text-[12px] font-black uppercase tracking-widest transition-all pb-2 border-b-2 whitespace-nowrap ${
                                    activeTab === tab ? 'text-red-500 border-red-500' : 'text-gray-400 border-transparent hover:text-gray-800'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Swiper Slider */}
                {loading ? (
                    <div className="h-64 flex items-center justify-center font-bold text-gray-400 italic">Loading Aaramdehi Collection...</div>
                ) : (
                    <Swiper
                        modules={[Navigation]}
                        navigation={true}
                        spaceBetween={20}
                        slidesPerView={1}
                        breakpoints={{
                            480: { slidesPerView: 2 },
                            768: { slidesPerView: 3 },
                            1024: { slidesPerView: 5 },
                        }}
                        className="popular-products-swiper !pb-14"
                    >
                        {products.map((item) => (
                            <SwiperSlide key={item.id}>
                                <div 
                                    className="bg-white border hover:shadow-xl transition-all duration-300 p-4 rounded-sm cursor-pointer group relative"
                                    onClick={() => handleQuickView(item)}
                                >
                                    <div className="relative overflow-hidden aspect-square mb-4">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                                        <span className="absolute top-0 left-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1">-12%</span>
                                    </div>
                                    <h3 className="text-[13px] font-bold text-gray-800 truncate mb-1">{item.name}</h3>
                                    <p className="text-[11px] text-green-600 font-bold mb-2">In Stock</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-black text-red-500">₹{item.newPrice}</span>
                                        <span className="text-sm text-gray-300 line-through">₹{item.oldPrice}</span>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                )}
            </div>

            {/* --- QUICK VIEW MODAL --- */}
            {isModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-5xl rounded-sm shadow-2xl relative flex flex-col md:flex-row overflow-hidden max-h-[95vh] animate-in fade-in zoom-in duration-300">
                        
                        <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-2xl text-gray-400 hover:text-red-500 z-50 bg-gray-100 rounded-full p-1 transition-all"><IoClose /></button>

                        {/* Left: Image Section */}
                        <div className="md:w-1/2 p-8 bg-[#fcfcfc] flex items-center justify-center border-r relative">
                            <img src={selectedProduct.image} alt={selectedProduct.name} className="max-h-[400px] object-contain mix-blend-multiply" />
                        </div>

                        {/* Right: Product Details Section */}
                        <div className="md:w-1/2 p-10 overflow-y-auto">
                            <h1 className="text-2xl font-black text-gray-900 leading-tight mb-3 uppercase tracking-tight">{selectedProduct.name}</h1>
                            
                            <div className="flex items-center gap-4 mb-5 border-b pb-5">
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (i < Math.floor(selectedProduct.rating) ? <IoStar key={i} /> : <IoStarOutline key={i} />))}
                                </div>
                                <span className="text-gray-400 text-[11px] font-bold tracking-widest uppercase mt-1">(1 Customer Review)</span>
                            </div>

                            <div className="space-y-2 mb-6">
                                <p className="text-[11px] font-bold text-gray-400 uppercase">Brand: <span className="text-gray-900 ml-2 font-black">{selectedProduct.brand}</span></p>
                                <p className="text-[11px] font-bold text-gray-400 uppercase">Status: <span className="text-green-600 ml-2 font-black">Available ({selectedProduct.stock} Items)</span></p>
                            </div>

                            <p className="text-sm text-gray-500 leading-relaxed mb-8">{selectedProduct.description}</p>

                            <div className="flex items-center gap-4 mb-8">
                                <span className="text-4xl font-black text-red-500">₹{selectedProduct.newPrice}</span>
                                <span className="text-xl text-gray-200 line-through font-bold">₹{selectedProduct.oldPrice}</span>
                            </div>

                            {/* Quantity & Add to Cart */}
                            <div className="flex gap-4 mb-8">
                                <div className="flex items-center border border-gray-200 h-14 rounded-sm bg-white">
                                    <button onClick={handleDecrement} className="px-5 h-full hover:bg-gray-50 font-black transition-all text-gray-400">－</button>
                                    <span className="w-10 text-center font-black text-sm text-gray-800">{quantity}</span>
                                    <button onClick={handleIncrement} className="px-5 h-full hover:bg-gray-50 font-black transition-all text-gray-400">＋</button>
                                </div>
                                
                                <button 
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-red-500 text-white h-14 px-8 font-black uppercase text-xs tracking-[2px] hover:bg-black transition-all shadow-xl shadow-red-500/20 active:translate-y-1">
                                    Add to Cart
                                </button>
                            </div>

                            <div className="flex gap-8 border-t pt-6">
                                <button className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 hover:text-red-500 transition-all tracking-widest"><IoHeartOutline size={16}/> Add to Wishlist</button>
                                <button className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 hover:text-red-500 transition-all tracking-widest"><IoSyncOutline size={16}/> Compare</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Swiper Styles */}
            <style>{`
                .popular-products-swiper .swiper-button-next,
                .popular-products-swiper .swiper-button-prev {
                    width: 40px !important; height: 40px !important;
                    background: white !important; border-radius: 50% !important;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important; color: black !important;
                }
                .popular-products-swiper .swiper-button-next:after,
                .popular-products-swiper .swiper-button-prev:after { font-size: 14px !important; font-weight: 900 !important; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
            `}</style>
        </section>
    );
};

export default PopularProducts;