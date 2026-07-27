import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';
import { getActiveBannersAPI } from '../../src/api/authAndAdminApi';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const normalizeBannerLink = (link) => {
    if (!link) return '/';
    const trimmed = String(link).trim();
    if (/^(https?:\/\/|mailto:|tel:|#)/i.test(trimmed)) return trimmed;
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

const isExternalLink = (link) => /^(https?:\/\/|mailto:|tel:)/i.test(link);

/**
 * HomeBanner Component
 * @param {string} section - Kaunsa section dikhana hai (e.g. 'hero', 'promotional')
 */
const HomeBanner = ({ section = 'hero' }) => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const PLACEHOLDER = 'https://placehold.co/1200x400?text=Banner';
    const swiperStyles = ".swiper-button-next, .swiper-button-prev { color: #fff !important; } .swiper-pagination-bullet-active { background: #dc2626 !important; }";

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
                {banners.map((banner) => {
                    const bannerUrl = normalizeBannerLink(banner.link);
                    const external = isExternalLink(bannerUrl);
                    const Wrapper = external ? 'a' : Link;
                    const wrapperProps = external ? { href: bannerUrl, target: '_blank', rel: 'noreferrer' } : { to: bannerUrl };
                    return (
                        <SwiperSlide key={banner._id}>
                            <Wrapper {...wrapperProps} className="block">
                                <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] items-center bg-white p-4 md:p-6 xl:p-8 rounded-[28px] shadow-xl">
                                    <div className="space-y-5">
                                        {banner.category?.toLowerCase() !== 'hero' && (
                                            <span className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                                                {banner.category || 'Featured'}
                                            </span>
                                        )}
                                        <h2 className="text-3xl font-black text-slate-900 sm:text-4xl lg:text-5xl">
                                            {banner.title || 'Shop the latest collection'}
                                        </h2>
                                        <p className="max-w-xl text-sm text-slate-600 sm:text-base">
                                            {banner.description || 'Discover curated offers and polished banner placements designed to match your brand theme seamlessly.'}
                                        </p>
                                        <div className="flex flex-wrap gap-3">
                                            <span className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                                                Fresh arrivals
                                            </span>
                                            <span className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                                                On-trend deals
                                            </span>
                                        </div>
                                        <span className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
                                            Explore now
                                        </span>
                                    </div>

                                    <div className="relative overflow-hidden rounded-[24px] bg-slate-100 h-[260px] sm:h-[320px] md:h-[360px] lg:h-[420px]">
                                        <img
                                            src={banner.image || PLACEHOLDER}
                                            alt={banner.title}
                                            className="h-full w-full object-contain"
                                            onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER; }}
                                        />
                                    </div>
                                </div>
                            </Wrapper>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
            <style>{swiperStyles}</style>
        </div>
    );
};

export default HomeBanner;