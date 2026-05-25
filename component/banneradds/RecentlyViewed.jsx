import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { getRecentlyViewed } from '../../src/data/recentlyViewedUtils';
import 'swiper/css';
import 'swiper/css/navigation';

// ===== RECENTLY VIEWED PRODUCTS SECTION =====
// Flipkart ke tarah - jab user products view karte hain toh yeh section show hota hai
// Ismein last 10 viewed products carousel mein dikhte hain

const RecentlyViewed = () => {
  // State: Jo products user ne recently view kiye hain
  const [recentProducts, setRecentProducts] = useState([]);

  // useEffect: Component load hone par recently viewed products load karna
  useEffect(() => {
    // localStorage se recently viewed products lana
    const loadRecentlyViewed = () => {
      const products = getRecentlyViewed();
      setRecentProducts(products);
    };

    loadRecentlyViewed();

    // Jab khi aur component se "recentlyViewedUpdated" event ho tab update karna
    window.addEventListener("recentlyViewedUpdated", loadRecentlyViewed);

    // Cleanup
    return () => {
      window.removeEventListener("recentlyViewedUpdated", loadRecentlyViewed);
    };
  }, []);

  // Agar koi product nahi dekha gaya hai toh component hide karna
  if (recentProducts.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Container with Light Blue Gradient Background */}
      <div className="bg-gradient-to-r from-[#e3f2fd] to-white rounded-md border border-gray-200 p-5 relative shadow-sm">
        
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Recently Viewed Products
        </h2>

        <Swiper
          modules={[Navigation]}
          navigation={true}
          spaceBetween={10}
          slidesPerView={2}
          breakpoints={{
            480: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            1024: { slidesPerView: 5 },
            1280: { slidesPerView: 6 },
          }}
          className="recent-slider"
        >
          {recentProducts.map((item) => (
            <SwiperSlide key={item.id}>
              <Link to={`/product/${item.id}`}>
                <div className="bg-white border border-gray-100 rounded-lg p-3 h-full flex flex-col items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
                  <div className="w-full aspect-square flex items-center justify-center p-2">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <p className="text-[12px] text-gray-700 font-semibold text-center mt-2 line-clamp-2">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-red-500 font-bold mt-1">
                    ₹{(item.price || item.newPrice || 0).toLocaleString()}
                  </p>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Custom Styles to match Flipkart Arrow Style */}
      <style>{`
        .recent-slider .swiper-button-next,
        .recent-slider .swiper-button-prev {
          background: white !important;
          width: 40px !important;
          height: 70px !important;
          color: #333 !important;
          box-shadow: 2px 2px 10px rgba(0,0,0,0.1);
          top: 50% !important;
          margin-top: -35px !important;
        }
        .recent-slider .swiper-button-next {
          right: 0 !important;
          border-radius: 4px 0 0 4px !important;
        }
        .recent-slider .swiper-button-prev {
          left: 0 !important;
          border-radius: 0 4px 4px 0 !important;
        }
        .recent-slider .swiper-button-next:after,
        .recent-slider .swiper-button-prev:after {
          font-size: 18px !important;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default RecentlyViewed;