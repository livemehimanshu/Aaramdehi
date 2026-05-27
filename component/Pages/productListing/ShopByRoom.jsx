import React from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';

const ShopByRoom = () => {
  const rooms = [
    { id: 1, name: "Living Room", image: "https://images.unsplash.com/photo-1618220179428-dfa40e814713?q=80&w=200", link: "/products?category=Living Room" },
    { id: 2, name: "Bedroom", image: "https://images.unsplash.com/photo-1595526114035-a5852991a03c?q=80&w=200", link: "/products?category=Bedroom" },
    { id: 3, name: "Kitchen", image: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?q=80&w=200", link: "/products?category=Kitchen" },
    { id: 4, name: "Dining Room", image: "https://images.unsplash.com/photo-1600490036269-d04b61b2066d?q=80&w=200", link: "/products?category=Dining Room" },
    { id: 5, name: "Bathroom", image: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?q=80&w=200", link: "/products?category=Bathroom" },
    { id: 6, name: "Outdoor", image: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?q=80&w=200", link: "/products?category=Outdoor" },
    { id: 7, name: "Kids Room", image: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?q=80&w=200", link: "/products?category=Kids Room" },
  ];

  return (
    <section className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Shop by Room</h2>
      <Swiper
        modules={[FreeMode]}
        spaceBetween={20}
        slidesPerView={2}
        freeMode={true}
        breakpoints={{
          640: { slidesPerView: 3 },
          768: { slidesPerView: 4 },
          1024: { slidesPerView: 6 },
        }}
        className="my-room-swiper"
      >
        {rooms.map(room => (
          <SwiperSlide key={room.id}>
            <Link to={room.link} className="block group text-center">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden mx-auto border-4 border-white shadow-md group-hover:shadow-lg group-hover:border-blue-500 transition-all duration-300">
                <img 
                  src={room.image} 
                  alt={room.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
              </div>
              <p className="mt-3 text-sm md:text-base font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                {room.name}
              </p>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default ShopByRoom;