import React from 'react';
// Swiper Components और Styles इम्पोर्ट करें
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const Hero = () => {
  // 1. मुख्य हीरो स्लाइडर का डेटा
  const heroSliderData = [
    {
      id: 1,
      title: "Women Solid Round Green T-Shirt",
      subtitle: "Big Saving Days Sale",
      price: "$59.00",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000",
      bgColor: "bg-[#e8e9d5]"
    },
    {
      id: 2,
      title: "New Summer Collection 2024",
      subtitle: "Exclusive Offer",
      price: "$49.00",
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000",
      bgColor: "bg-[#f3e5d8]"
    }
  ];

  // 2. कैटेगरी स्लाइडर का डेटा (Slick Slider जैसा)
  const categorySliderData = [
    { id: 1, name: "Fashion", image: "https://rukminim2.flixcart.com/flap/128/128/image/82b3ca5fb2301045.png?q=80" },
    { id: 2, name: "Electronics", image: "https://rukminim2.flixcart.com/flap/128/128/image/69c6589653afdb9a.png?q=80" },
    { id: 3, name: "Home", image: "https://rukminim2.flixcart.com/flap/128/128/image/243760238e55e424.png?q=80" },
    { id: 4, name: "Appliances", image: "https://rukminim2.flixcart.com/flap/128/128/image/0ff199d1bd27eb98.png?q=80" },
    { id: 5, name: "Beauty", image: "https://rukminim2.flixcart.com/flap/128/128/image/d3677e4a7d6e4085.png?q=80" },
    { id: 6, name: "Grocery", image: "https://rukminim2.flixcart.com/flap/128/128/image/29327f40e9c4d26b.png?q=80" },
    { id: 7, name: "Toys", image: "https://rukminim2.flixcart.com/flap/128/128/image/f949826f5d507119.png?q=80" },
    { id: 8, name: "Mobiles", image: "https://rukminim2.flixcart.com/flap/128/128/image/22fddf3c7da4c4f4.png?q=80" },
  ];

  return (
    <section className="bg-[#f5f0f0] py-6">
      <div className="container mx-auto px-4 space-y-10">
        
        {/* --- SECTION 1: MAIN HERO SLIDER --- */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT SIDE: AUTO IMAGE SLIDER */}
          <div className="w-full lg:w-[68%] rounded-xl overflow-hidden shadow-lg">
            <Swiper
              spaceBetween={0}
              centeredSlides={true}
              autoplay={{
                delay: 4000, // 4 सेकंड में इमेज बदलेगी
                disableOnInteraction: false,
              }}
              pagination={{ clickable: true }}
              modules={[Autoplay, Pagination]}
              className="mySwiper h-[300px] md:h-[480px]"
            >
              {heroSliderData.map((slide) => (
                <SwiperSlide key={slide.id}>
                  <div className={`relative w-full h-full flex items-center ${slide.bgColor}`}>
                    <div className="z-10 px-8 md:px-16 w-[70%] md:w-[60%]">
                      <span className="text-red-500 font-bold text-sm md:text-xl block mb-2 uppercase tracking-wide">
                        {slide.subtitle}
                      </span>
                      <h2 className="text-2xl md:text-6xl font-black text-gray-800 leading-tight mb-4">
                        {slide.title}
                      </h2>
                      <p className="text-lg md:text-2xl text-gray-600 mb-6">
                        Starting At Only <span className="text-red-500 font-bold">{slide.price}</span>
                      </p>
                      <button className="bg-[#ff5252] text-white px-8 py-3 rounded-md font-bold text-sm uppercase hover:bg-black transition-all">
                        Shop Now
                      </button>
                    </div>
                    <img 
                      src={slide.image} 
                      alt="Banner" 
                      className="absolute right-0 bottom-0 h-[90%] md:h-full object-contain z-0"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* RIGHT SIDE: STATIC CARDS */}
          <div className="w-full lg:w-[32%] flex flex-col gap-6">
            {/* Card 1 */}
            <div className="bg-[#dce4f2] p-8 rounded-xl flex flex-col justify-center relative overflow-hidden h-[230px] group cursor-pointer shadow-md hover:shadow-xl transition-all">
              <div className="z-10 max-w-[60%]">
                <h3 className="text-xl font-bold text-gray-800 leading-snug">Samsung Gear <br /> VR Camera</h3>
                <p className="text-red-500 font-bold text-lg mt-2">$129.00</p>
                <button className="mt-4 text-sm font-bold border-b-2 border-black hover:text-red-500 hover:border-red-500 transition-all uppercase">Shop Now</button>
              </div>
              <img src="https://pngimg.com/uploads/vr_headset/vr_headset_PNG42.png" className="absolute -right-5 w-40 group-hover:scale-110 transition-transform duration-500" alt="VR" />
            </div>
            {/* Card 2 */}
            <div className="bg-[#dae9e1] p-8 rounded-xl flex flex-col justify-center relative overflow-hidden h-[230px] group cursor-pointer shadow-md hover:shadow-xl transition-all">
              <div className="z-10 max-w-[60%]">
                <h3 className="text-xl font-bold text-gray-800 leading-snug">Marcel Dining <br /> Room Chair</h3>
                <p className="text-red-500 font-bold text-lg mt-2">$129.00</p>
                <button className="mt-4 text-sm font-bold border-b-2 border-black hover:text-red-500 hover:border-red-500 transition-all uppercase">Shop Now</button>
              </div>
              <img src="https://pngimg.com/uploads/chair/chair_PNG6847.png" className="absolute -right-5 w-40 group-hover:scale-110 transition-transform duration-500" alt="Chair" />
            </div>
          </div>
        </div>

        {/* --- SECTION 2: CATEGORY SLIDER (Slick Slider replacement) --- */}
        <div className="bg-gray-50 p-6 rounded-2xl shadow-inner border border-gray-100">
          <Swiper
            spaceBetween={20} // आइटम्स के बीच की दूरी
            slidesPerView={3} // मोबाइल पर एक बार में कितने दिखेंगे
            autoplay={{
              delay: 2500, // 2.5 सेकंड में अगला आइटम आएगा
              disableOnInteraction: false,
            }}
            modules={[Autoplay]}
            // Responsive Breakpoints (अलग-अलग स्क्रीन पर कितने आइटम्स)
            breakpoints={{
              640: { slidesPerView: 4, spaceBetween: 20 },
              768: { slidesPerView: 5, spaceBetween: 25 },
              1024: { slidesPerView: 7, spaceBetween: 30 }, // डेस्कटॉप पर 7 आइटम्स
            }}
            className="myCategorySwiper"
          >
            {categorySliderData.map((category) => (
              <SwiperSlide key={category.id}>
                <div className="flex flex-col items-center justify-center p-2 text-center group cursor-pointer">
                  {/* Circular Image Container */}
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center border-2 border-gray-100 shadow-sm overflow-hidden transition-all group-hover:border-red-400 group-hover:scale-105">
                    <img 
                      src={category.image} 
                      alt={category.name} 
                      className="w-[70%] h-[70%] object-contain"
                    />
                  </div>
                  {/* Category Name */}
                  <span className="mt-3 text-sm md:text-base font-medium text-gray-700 group-hover:text-red-500 transition-colors">
                    {category.name}
                  </span>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

      </div>
    </section>
  );
};

export default Hero;