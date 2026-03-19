import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import ProductCard from './ProductCard';
import axios from 'axios';

// Swiper Styles
import 'swiper/css';
import 'swiper/css/navigation';

const PopularProducts = () => {
  const [activeTab, setActiveTab] = useState('FASHION');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabs = ['FASHION', 'ELECTRONICS', 'BAGS', 'FOOTWEAR', 'GROCERIES', 'BEAUTY', 'WELLNESS'];

  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        // API call (अभी के लिए Dummy डेटा डाल रहा हूँ ताकि स्क्रीन ब्लैंक न हो)
        // असली API होने पर axios.get('URL') का इस्तेमाल करें
        const dummyData = [
          { id: 1, brand: "Soylent Green", name: "Siril Georgette Pink Color Saree", rating: 4.5, oldPrice: "58.00", newPrice: "48.00", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=500" },
          { id: 2, brand: "Soylent Green", name: "Siril Georgette Pink Color Saree", rating: 4.5, oldPrice: "58.00", newPrice: "48.00", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=500" },
          { id: 3, brand: "Soylent Green", name: "Siril Georgette Pink Color Saree", rating: 4.5, oldPrice: "58.00", newPrice: "48.00", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=500" },
          { id: 4, brand: "Soylent Green", name: "Siril Georgette Pink Color Saree", rating: 4.5, oldPrice: "58.00", newPrice: "48.00", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=500" },
          { id: 5, brand: "Soylent Green", name: "Siril Georgette Pink Color Saree", rating: 4.5, oldPrice: "58.00", newPrice: "48.00", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=500" },
          { id: 6, brand: "Soylent Green", name: "Siril Georgette Pink Color Saree", rating: 4.5, oldPrice: "58.00", newPrice: "48.00", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=500" },
        ];
        setProducts(dummyData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    getProducts();
  }, [activeTab]);

  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto px-4">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h2 className="text-[22px] font-bold text-gray-800 uppercase tracking-tight">Popular Products</h2>
            <p className="text-gray-400 text-sm">Do not miss the current offers until the end of March.</p>
          </div>

          {/* Tabs Navigation */}
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide pb-2 w-full md:w-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-[13px] font-bold transition-all whitespace-nowrap pb-1 border-b-2 ${
                  activeTab === tab ? 'text-red-500 border-red-500' : 'text-gray-400 border-transparent hover:text-gray-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Products Swiper */}
        {loading ? (
          <div className="h-64 flex items-center justify-center">Loading...</div>
        ) : (
          <Swiper
            modules={[Navigation]}
            navigation={true}
            spaceBetween={15}
            slidesPerView={1}
            breakpoints={{
              480: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 5 },
              1300: { slidesPerView: 6 },
            }}
            className="popular-products-swiper !pb-12"
          >
            {products.map((item) => (
              <SwiperSlide key={item.id}>
                <ProductCard product={item} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      {/* CSS fixes for Swiper Arrows */}
      <style>{`
        .popular-products-swiper .swiper-button-next,
        .popular-products-swiper .swiper-button-prev {
          width: 35px !important;
          height: 35px !important;
          background: white !important;
          border-radius: 50% !important;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1) !important;
          color: black !important;
        }
        .popular-products-swiper .swiper-button-next:after,
        .popular-products-swiper .swiper-button-prev:after {
          font-size: 14px !important;
          font-weight: bold !important;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
};

export default PopularProducts;