import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { Link } from 'react-router-dom';

// Swiper Styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const HeroSection = () => {
    const heroSlides = [
        {
            id: 1,
            title: 'Premium Cushions Collection',
            subtitle: 'Experience Ultimate Comfort',
            image: 'https://rukminim2.flixcart.com/image/612/612/xif0q/pillow/t/v/v/17-white-soft-microfiber-pillow-pack-of-2-17-27-2-p-2-m-p-2-original-imahfzhgzff9ay8h.jpeg?q=90',
            discount: 'Up to 50% OFF'
        },
        {
            id: 2,
            title: 'Luxury Bedsheet Range',
            subtitle: 'Finest Quality Cotton',
            image: 'https://rukminim2.flixcart.com/image/612/612/l4ae8i80/bed-sheet/f/b/9/queen-bedsheet-1-modern-home-original-imagfv9hfvhc8czv.jpeg?q=90',
            discount: 'Up to 40% OFF'
        },
        {
            id: 3,
            title: 'Handcrafted Bolsters',
            subtitle: 'Artisan Excellence',
            image: 'https://rukminim2.flixcart.com/image/612/612/k7f26kw0/bolster/v/j/z/plain-bolster-white-1-bolster-white-satin-plain-white-fiber-original-imafpnzdqghvggym.jpeg?q=70',
            discount: 'Up to 45% OFF'
        },
    ];

    const promotionalBanner = {
        title: 'Exclusive Deal',
        subtitle: 'Summer Collection',
        description: 'Get the best home furnishing at unbeatable prices',
        image: 'https://rukminim2.flixcart.com/image/612/612/xif0q/pillow/t/v/v/17-white-soft-microfiber-pillow-pack-of-2-17-27-2-p-2-m-p-2-original-imahfzhgzff9ay8h.jpeg?q=90'
    };

    return (
        <section className="bg-gray-100 py-6">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Hero Slider - Takes 3 columns on desktop */}
                    <div className="lg:col-span-3">
                        <Swiper
                            modules={[Autoplay, Pagination, EffectFade]}
                            autoplay={{
                                delay: 3000,
                                disableOnInteraction: false,
                            }}
                            pagination={{
                                clickable: true,
                                bulletActiveClass: 'bg-red-500',
                            }}
                            effect="fade"
                            speed={800}
                            loop={true}
                            className="hero-swiper rounded-lg overflow-hidden"
                        >
                            {heroSlides.map((slide) => (
                                <SwiperSlide key={slide.id}>
                                    <Link to={`/category/${slide.id}`} className="relative block h-96 group">
                                        {/* Background Image */}
                                        <img
                                            src={slide.image}
                                            alt={slide.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />

                                        {/* Dark Overlay */}
                                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-300"></div>

                                        {/* Content */}
                                        <div className="absolute inset-0 flex flex-col justify-center items-start p-8 md:p-12">
                                            <p className="text-red-500 text-sm md:text-base font-bold uppercase tracking-widest mb-2">
                                                {slide.discount}
                                            </p>
                                            <h1 className="text-3xl md:text-5xl font-black text-white mb-2 leading-tight">
                                                {slide.title}
                                            </h1>
                                            <p className="text-white text-sm md:text-base font-semibold mb-6">
                                                {slide.subtitle}
                                            </p>

                                            {/* Shop Now Button */}
                                            <button className="bg-red-500 text-white px-8 py-3 rounded-sm font-bold uppercase tracking-widest text-sm hover:bg-red-600 transition-colors duration-300 shadow-lg">
                                                Shop Now →
                                            </button>
                                        </div>
                                    </Link>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>

                    {/* Static Promotional Banner - Right Side */}
                    <div className="lg:col-span-1">
                        <Link to="/promo" className="block relative h-96 group rounded-lg overflow-hidden shadow-md">
                            {/* Banner Image */}
                            <img
                                src={promotionalBanner.image}
                                alt={promotionalBanner.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />

                            {/* Dark Overlay */}
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all duration-300"></div>

                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/70 to-transparent">
                                <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-1">
                                    {promotionalBanner.title}
                                </p>
                                <h3 className="text-white text-xl md:text-2xl font-black mb-2 leading-tight">
                                    {promotionalBanner.subtitle}
                                </h3>
                                <p className="text-gray-200 text-xs mb-4">
                                    {promotionalBanner.description}
                                </p>

                                {/* Shop Now Button */}
                                <button className="w-full bg-red-500 text-white py-2 rounded-sm font-bold uppercase text-xs tracking-widest hover:bg-red-600 transition-colors duration-300">
                                    Explore →
                                </button>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            <style>{`
                .hero-swiper .swiper-pagination {
                    bottom: 15px !important;
                }
                .hero-swiper .swiper-pagination-bullet {
                    background-color: rgba(255, 255, 255, 0.5) !important;
                    width: 8px !important;
                    height: 8px !important;
                }
                .hero-swiper .swiper-pagination-bullet-active {
                    background-color: rgb(239, 68, 68) !important;
                }
            `}</style>
        </section>
    );
};

export default HeroSection;
