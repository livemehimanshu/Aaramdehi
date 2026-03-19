import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ProductCard from './ProductCard'; // आपका पुराना ProductCard

// Swiper Styles
import 'swiper/css';
import 'swiper/css/navigation';

const LatestProducts = () => {
  const products = [
    { id: 1, brand: "Home", name: "Black Kitchen Tool", rating: 4, oldPrice: "25.00", newPrice: "19.00", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=300" },
    { id: 2, brand: "Accessories", name: "Classic Silver Watch", rating: 5, oldPrice: "120.00", newPrice: "89.00", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=300" },
    { id: 3, brand: "Tech", name: "Smart Google Home", rating: 4.5, oldPrice: "55.00", newPrice: "45.00", image: "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?q=80&w=300" },
    { id: 4, brand: "Audio", name: "White Studio Speaker", rating: 4, oldPrice: "99.00", newPrice: "75.00", image: "https://images.unsplash.com/photo-1541339907198-e08756edd810?q=80&w=300" },
    { id: 5, brand: "Decor", name: "Modern Hanging Lamp", rating: 5, oldPrice: "40.00", newPrice: "32.00", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=300" },
  ];

  return (
    <div className="container mx-auto px-4 py-10">
      
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
        
        {/* Banner Right Side Images (Optional) */}
        <div className="hidden lg:flex gap-2">
            <img src="https://images.unsplash.com/photo-1508685096489-7aac29625a6b?q=80&w=100" className="w-16 h-16 rounded-full border border-gray-700 p-1" alt="watch" />
            <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=100" className="w-16 h-16 rounded-full border border-gray-700 p-1" alt="watch" />
        </div>
      </div>

      {/* --- HEADER WITH NAVIGATION --- */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Latest Products</h2>
        
        {/* Custom Navigation Buttons */}
        <div className="flex gap-2">
          <button className="latest-prev p-2 border rounded-full hover:bg-gray-100 transition-colors">
            <FiChevronLeft size={20} />
          </button>
          <button className="latest-next p-2 border rounded-full hover:bg-gray-100 transition-colors">
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
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default LatestProducts;