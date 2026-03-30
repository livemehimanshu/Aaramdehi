import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { IoClose, IoStar, IoStarOutline, IoHeartOutline, IoSyncOutline } from "react-icons/io5";
import ProductCard from './ProductCard'; 

// Swiper Styles
import 'swiper/css';
import 'swiper/css/navigation';

const LatestProducts = () => {
  // --- Quick View States ---
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const products = [
    { id: 1, brand: "Home", name: "Black Kitchen Tool", rating: 4, oldPrice: "25.00", newPrice: "19.00", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=300", description: "High-quality black kitchen tools for modern homes." },
    { id: 2, brand: "Accessories", name: "Classic Silver Watch", rating: 5, oldPrice: "120.00", newPrice: "89.00", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=300", description: "Elegant silver watch with premium leather straps." },
    { id: 3, brand: "Tech", name: "Smart Google Home", rating: 4.5, oldPrice: "55.00", newPrice: "45.00", image: "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?q=80&w=300", description: "Voice-controlled smart home assistant." },
    { id: 4, brand: "Audio", name: "White Studio Speaker", rating: 4, oldPrice: "99.00", newPrice: "75.00", image: "https://images.unsplash.com/photo-1541339907198-e08756edd810?q=80&w=300", description: "Crystal clear audio for your studio and home." },
    { id: 5, brand: "Decor", name: "Modern Hanging Lamp", rating: 5, oldPrice: "40.00", newPrice: "32.00", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=300", description: "Modern lighting solutions for a cozy atmosphere." },
  ];

  // --- Modal Handler ---
  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-10 font-sans relative">
      
      {/* --- WATCH BANNER --- */}
      <div className="w-full bg-black rounded-xl overflow-hidden mb-10 flex items-center justify-between p-6 md:p-10 text-white relative">
        <div className="flex items-center gap-6">
          <img 
            src="https://images.unsplash.com/photo-1546868871-70c122467d8b?q=80&w=200" 
            alt="Smart Watch" 
            className="w-20 md:w-32 object-contain"
          />
          <div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter italic">WATCH</h2>
            <p className="text-[10px] md:text-sm text-gray-400 mt-2 max-w-[200px]">
              M6 Smart Band 2.3 - Fitness Band <br />
              Men's and Women's Health Tracking, Red Strap
            </p>
          </div>
        </div>
        
        <div className="hidden lg:flex gap-2">
            <img src="https://images.unsplash.com/photo-1508685096489-7aac29625a6b?q=80&w=100" className="w-16 h-16 rounded-full border border-gray-700 p-1" alt="watch" />
            <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=100" className="w-16 h-16 rounded-full border border-gray-700 p-1" alt="watch" />
        </div>
      </div>

      {/* --- HEADER WITH NAVIGATION --- */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Latest Products</h2>
        
        <div className="flex gap-2">
          <button className="latest-prev p-2 border rounded-full hover:bg-black hover:text-white transition-all">
            <FiChevronLeft size={20} />
          </button>
          <button className="latest-next p-2 border rounded-full hover:bg-black hover:text-white transition-all">
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* --- PRODUCT SWIPER --- */}
      <Swiper
        modules={[Navigation]}
        navigation={{
          nextEl: '.latest-next',
          prevEl: '.latest-prev',
        }}
        spaceBetween={20}
        slidesPerView={1}
        breakpoints={{
          480: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 5 },
        }}
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            {/* Click Wrapper to open Modal */}
            <div onClick={() => handleOpenModal(product)} className="cursor-pointer">
                <ProductCard product={product} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* --- QUICK VIEW MODAL SECTION --- */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-5xl rounded-sm shadow-2xl relative flex flex-col md:flex-row overflow-hidden max-h-[90vh] animate-in fade-in zoom-in duration-300">
            
            <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-2xl text-gray-400 hover:text-red-500 z-50 bg-gray-100 rounded-full p-1"><IoClose /></button>

            <div className="md:w-1/2 p-10 bg-[#f9f9f9] flex items-center justify-center border-r">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="max-h-[350px] object-contain transition-transform duration-500 hover:scale-110" />
            </div>

            <div className="md:w-1/2 p-10 overflow-y-auto">
              <h1 className="text-2xl font-black text-gray-900 leading-tight mb-2 uppercase tracking-tighter">{selectedProduct.name}</h1>
              
              <div className="flex items-center gap-4 mb-5 border-b pb-4 text-yellow-400">
                <div className="flex">
                    {[...Array(5)].map((_, i) => (i < Math.floor(selectedProduct.rating || 4) ? <IoStar key={i} /> : <IoStarOutline key={i} />))}
                </div>
                <span className="text-gray-400 text-[10px] font-black uppercase mt-1 tracking-widest">(Latest Release)</span>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-black text-red-500">₹{selectedProduct.newPrice}</span>
                <span className="text-xl text-gray-200 line-through font-bold">₹{selectedProduct.oldPrice}</span>
              </div>

              <p className="text-sm text-gray-500 leading-relaxed mb-8">{selectedProduct.description || "Premium quality product from our latest collection."}</p>

              {/* Functional Quantity */}
              <div className="flex gap-4 mb-8">
                <div className="flex items-center border border-gray-200 h-14 bg-white">
                  <button onClick={() => quantity > 1 && setQuantity(quantity - 1)} className="px-5 h-full hover:bg-gray-50 font-black border-r text-gray-400">－</button>
                  <span className="w-12 text-center font-black">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-5 h-full hover:bg-gray-50 font-black border-l text-gray-400">＋</button>
                </div>
                
                <button className="flex-1 bg-red-500 text-white h-14 px-8 font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-xl shadow-red-500/20 active:translate-y-1">
                  Add to Cart
                </button>
              </div>

              <div className="flex gap-8 border-t pt-6">
                <button className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 hover:text-red-500 transition-all"><IoHeartOutline size={16}/> Wishlist</button>
                <button className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 hover:text-red-500 transition-all"><IoSyncOutline size={16}/> Compare</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LatestProducts;