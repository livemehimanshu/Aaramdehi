import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';
import { getActiveBannersAPI } from '../../src/api/authAndAdminApi';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

/**
 * HomeBanner Component
 * @param {string} section - Kaunsa section dikhana hai (e.g. 'hero', 'promotional')
 */
const HomeBanner = ({ section = 'hero' }) => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const PLACEHOLDER = 'https://placehold.co/1200x400?text=Banner';

    useEffect(() => {
        const fetchBanners = async () => {
            console.log(`Fetching banners for section: ${section}`); // Debugging line
            try {
                // Fetch all active banners first
                const res = await getActiveBannersAPI();
                if (res.success && Array.isArray(res.data)) {
                    // Filter locally by the section prop provided
                    const filtered = res.data
                        .filter(b => b.category?.toLowerCase() === section.toLowerCase() && b.isActive !== false)
                        .sort((a, b) => (a.position || 0) - (b.position || 0));
                    // console.log(`Filtered banners for section '${section}':`, filtered); // Debugging (can be uncommented if needed)
                    setBanners(filtered);
                    if (filtered.length === 0) {
                        console.warn(`⚠️ No banners found for section: '${section}'. Check Admin Panel category names.`);
                    }
                }
            } catch (err) {
                console.error("Frontend Banner Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBanners();
    }, [section]);

    if (loading || banners.length === 0) return null;

    return (
        <div className={`w-full ${section === 'hero' ? 'mb-10' : 'my-8'} px-4 container mx-auto`}>
            <Swiper
                modules={[Navigation, Autoplay, Pagination]}
                navigation={true}
                pagination={{ clickable: true }}
                autoplay={{ delay: 5000 }}
                loop={banners.length > 1}
                className="rounded-2xl overflow-hidden shadow-lg border border-gray-100"
            >
                {banners.map((banner) => (
                    <SwiperSlide key={banner._id}>
                        <Link to={banner.link || '/'} className="block relative group">
                            <img 
                                src={banner.image || PLACEHOLDER} 
                                alt={banner.title} 
                                className="w-full h-[250px] md:h-[450px] object-cover transition-transform duration-700 group-hover:scale-105"
                                onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER; }}
                            />
                            {banner.title && (
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8 md:p-16">
                                    <h2 className="text-white text-2xl md:text-5xl font-black uppercase tracking-tighter mb-2 drop-shadow-lg">
                                        {banner.title}
                                    </h2>
                                    {banner.link && (
                                        <span className="text-white bg-red-600 w-fit px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest mt-4">
                                            Shop Now
                                        </span>
                                    )}
                                </div>
                            )}
                        </Link>
                    </SwiperSlide>
                ))}
            </Swiper>
            <style>{`
                .swiper-button-next, .swiper-button-prev { color: #fff !important; }
                .swiper-pagination-bullet-active { background: #dc2626 !important; }
            `}</style>
        </div>
    );
};

export default HomeBanner;