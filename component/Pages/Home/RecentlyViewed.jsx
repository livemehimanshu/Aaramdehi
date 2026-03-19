import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const RecentlyViewed = () => {
  const items = [
    { id: 1, name: "Monitors", image: "https://rukminim2.flixcart.com/image/150/150/xif0q/monitor/s/g/u/-original-imagz6zgvj7gz96f.jpeg?q=70" },
    { id: 2, name: "Mobiles", image: "https://rukminim2.flixcart.com/image/150/150/xif0q/mobile/k/l/l/-original-imagtc5fz9zz9vg6.jpeg?q=70" },
    { id: 3, name: "Amplifiers & AV Receivers", image: "https://rukminim2.flixcart.com/image/150/150/k7m89zk0/amplifier/h/z/v/p-30-pioneer-original-imafptyhzztyyz9f.jpeg?q=70" },
    { id: 4, name: "Mobile Cables", image: "https://rukminim2.flixcart.com/image/150/150/xif0q/data-cable/u/f/n/-original-imagh2vubshszr9e.jpeg?q=70" },
    { id: 5, name: "Protein Supplement", image: "https://rukminim2.flixcart.com/image/150/150/xif0q/protein-supplement/g/x/v/0-5-creatine-monohydrate-muscleblaze-original-imagz7zgvj7gz96f.jpeg?q=70" },
    { id: 6, name: "Headphones", image: "https://rukminim2.flixcart.com/image/150/150/xif0q/headphone/p/y/v/-original-imagz7zgvj7gz96f.jpeg?q=70" },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Container with Light Blue Gradient Background */}
      <div className="bg-gradient-to-r from-[#e3f2fd] to-white rounded-md border border-gray-200 p-5 relative shadow-sm">
        
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Himanshu, still looking for these?
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
          {items.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="bg-white border border-gray-100 rounded-lg p-3 h-full flex flex-col items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-full aspect-square flex items-center justify-center p-2">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <p className="text-[12px] text-gray-500 font-medium text-center mt-2 line-clamp-1">
                  {item.name}
                </p>
              </div>
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