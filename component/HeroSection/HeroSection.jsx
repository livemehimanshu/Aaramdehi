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
        <section className="relative w-full h-[520px] overflow-hidden">
            <Swiper
                modules={[Autoplay, Pagination, EffectFade, Navigation]}
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                navigation={true}
                effect="fade"
                loop={true}
                className="w-full h-full"
            >
                {heroSlides.map((slide, index) => (
                    <SwiperSlide key={slide.id}>
                        <div className="w-full h-full relative flex items-center justify-center">
                            <div className="absolute inset-0 grid place-items-center">
                                <div className="mx-auto w-[90%] h-[460px] rounded-[20px] overflow-hidden mc-card relative">
                                    <img
                                        src={slide.image}
                                        alt="Banner"
                                        width="1200"
                                        height="520"
                                        loading={index === 0 ? "eager" : "lazy"}
                                        fetchpriority={index === 0 ? "high" : "auto"}
                                        decoding="async"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/18 to-transparent"></div>
                                    <div className="absolute left-8 bottom-8 text-white max-w-lg">
                                        <h2 className="text-3xl mc-serif font-semibold mb-2">Curated Home Collection</h2>
                                        <p className="text-sm text-white/90 mb-4">Timeless pieces blended with modern minimalism.</p>
                                        <div className="flex gap-3">
                                            <a href="/collections/home" className="bg-white text-gray-900 px-4 py-2 rounded-md font-medium shadow hover:opacity-95">Browse Collection</a>
                                            <a href="/contact" className="border border-white/30 text-white px-4 py-2 rounded-md font-medium hover:bg-white/5">Contact Us</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            <style>{`
                .swiper-button-next, .swiper-button-prev {
                    color: var(--mc-accent) !important;
                    background: rgba(255,255,255,0.9);
                    padding: 10px 12px;
                    border-radius: 10px;
                    box-shadow: 0 6px 18px rgba(16,24,40,0.12);
                    border: 1px solid rgba(16,24,40,0.04);
                }
                .swiper-button-next::after, .swiper-button-prev::after {
                    font-size: 16px !important;
                    font-weight: 700;
                    color: var(--mc-accent) !important;
                }
                .swiper-pagination-bullet {
                    background: rgba(16,24,40,0.6) !important;
                    width: 10px !important;
                    height: 10px !important;
                    opacity: 0.9;
                }
                .swiper-pagination-bullet-active {
                    background: var(--mc-warm) !important;
                    transform: scale(1.2);
                }
            `}</style>
        </section>
    );
};

export default HeroSection;
