import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade, Navigation } from 'swiper/modules';
import { Link } from 'react-router-dom';

// Swiper Styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

const HeroSection = () => {
    const heroSlides = [
        { id: 1, image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?auto=format&fit=crop&q=80&w=1200' },
        { id: 2, image: 'https://images.unsplash.com/photo-1616464530777-62e91244e877?auto=format&fit=crop&q=80&w=1200' },
        { id: 3, image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=1200' },
    ];

    return (
        <section className="relative w-full h-[450px] overflow-hidden">
            <Swiper
                modules={[Autoplay, Pagination, EffectFade, Navigation]}
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                navigation={true}
                effect="fade"
                loop={true}
                className="w-full h-full"
            >
                {heroSlides.map((slide) => (
                    <SwiperSlide key={slide.id}>
                        <div className="w-full h-full relative">
                            <img
                                src={slide.image}
                                alt="Banner"
                                className="w-full h-full object-cover"
                            />
                            {/* Subtle dark overlay to make navigation arrows more visible */}
                            <div className="absolute inset-0 bg-black/20"></div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            <style>{`
                .swiper-button-next, .swiper-button-prev {
                    color: white !important;
                    background: rgba(0,0,0,0.3);
                    padding: 30px 20px;
                    border-radius: 5px;
                }
                .swiper-button-next::after, .swiper-button-prev::after {
                    font-size: 20px !important;
                    font-weight: bold;
                }
                .swiper-pagination-bullet {
                    background: white !important;
                    opacity: 0.7;
                }
                .swiper-pagination-bullet-active {
                    background: #ef4444 !important;
                }
            `}</style>
        </section>
    );
};

export default HeroSection;
