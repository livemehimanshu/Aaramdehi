import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';
import { getActiveBannersAPI } from '../../src/api/authAndAdminApi';
import { getResponsiveImageAttributes } from '../../src/utils/imageOptimizer';
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

const checkIsVideo = (banner) => {
    if (banner?.mediaType === 'video') return true;
    const url = banner?.mediaUrl || banner?.image || '';
    if (typeof url !== 'string') return false;
    return url.includes('/video/upload/') || /\.(mp4|webm|mkv|mov|avi)($|\?)/i.test(url);
};

const DEFAULT_HERO = [
  {
    _id: 'default-hero-1',
    title: 'Transform Your Home with Premium Comfort',
    description: 'Explore curated beds, sofas, and home decor designed for luxury and everyday living.',
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?auto=format&fit=crop&q=80&w=1200',
    link: '/products',
    category: 'hero',
    mediaType: 'image'
  }
];

const HomeBanner = ({ section = 'hero' }) => {
    const [banners, setBanners] = useState(section === 'hero' ? DEFAULT_HERO : []);
    const [loading, setLoading] = useState(section === 'hero' ? false : true);
    const PLACEHOLDER = 'https://placehold.co/1200x400?text=Banner';
    const swiperStyles = ".swiper-button-next, .swiper-button-prev { color: #fff !important; } .swiper-pagination-bullet-active { background: #dc2626 !important; }";

    // SIRF 'category' section ke liye compact height apply hogi.
    // 'hero' aur 'promotional' (ya koi bhi aur banner) pehle ki tarah hi rahenge.
    const isCategory = section.toLowerCase() === 'category';

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const res = await getActiveBannersAPI();
                if (res && res.success && Array.isArray(res.data)) {
                    const filtered = res.data
                        .filter(b => b.category?.toLowerCase() === section.toLowerCase() && b.isActive !== false)
                        .sort((a, b) => (a.position || 0) - (b.position || 0));
                    if (filtered.length > 0) {
                        setBanners(filtered);
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

    if (loading) {
        return (
            <div className={`w-full ${isCategory ? 'my-3' : 'mb-10'} px-4 container mx-auto`}>
                <div className={`grid gap-4 lg:grid-cols-[0.95fr_1.05fr] items-center bg-white ${isCategory ? 'p-3 md:p-4 min-h-[160px]' : 'p-6 md:p-8 min-h-[300px] sm:min-h-[360px] md:min-h-[420px]'} rounded-2xl border border-gray-100 animate-pulse`}>
                    <div className="space-y-2">
                        <div className="h-4 w-20 bg-slate-200 rounded-full"></div>
                        <div className="h-6 w-3/4 bg-slate-200 rounded-xl"></div>
                        <div className="h-8 w-full bg-slate-200 rounded-xl"></div>
                    </div>
                    <div className={`w-full rounded-xl bg-slate-200 ${isCategory ? 'h-[140px] md:h-[180px]' : 'h-[260px] sm:h-[320px] md:h-[360px] lg:h-[420px]'}`}></div>
                </div>
            </div>
        );
    }

    if (banners.length === 0) return null;

    return (
        <div className={`w-full ${isCategory ? 'my-3' : 'mb-10'} px-4 container mx-auto`}>
            <Swiper
                modules={[Navigation, Autoplay, Pagination]}
                navigation={true}
                pagination={{ clickable: true }}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                loop={banners.length > 1}
                className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-white"
            >
                {banners.map((banner, index) => {
                    const bannerUrl = normalizeBannerLink(banner.link);
                    const external = isExternalLink(bannerUrl);
                    const Wrapper = external ? 'a' : Link;
                    const wrapperProps = external ? { href: bannerUrl, target: '_blank', rel: 'noreferrer' } : { to: bannerUrl };
                    const isFirst = index === 0 && section === 'hero';
                    const isVideo = checkIsVideo(banner);
                    const mediaSrc = banner.mediaUrl || banner.image || PLACEHOLDER;

                    return (
                        <SwiperSlide key={banner._id || index}>
                            <Wrapper {...wrapperProps} className="block w-full bg-white">
                                <div className={`grid gap-4 lg:grid-cols-[0.95fr_1.05fr] items-center bg-white ${isCategory ? 'p-3 md:p-4 lg:p-5' : 'p-4 md:p-6 xl:p-8'}`}>
                                    <div className={isCategory ? 'space-y-2' : 'space-y-5'}>
                                        {banner.category?.toLowerCase() !== 'hero' && (
                                            <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                                                {banner.category || 'Featured'}
                                            </span>
                                        )}
                                        <h2 className={`font-black text-slate-900 ${isCategory ? 'text-lg sm:text-xl lg:text-2xl' : 'text-3xl sm:text-4xl lg:text-5xl'}`}>
                                            {banner.title || 'Shop the latest collection'}
                                        </h2>
                                        <p className={`max-w-xl text-slate-600 line-clamp-2 ${isCategory ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'}`}>
                                            {banner.description || 'Discover curated offers and polished banner placements.'}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                                Fresh arrivals
                                            </span>
                                            <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                                On-trend deals
                                            </span>
                                        </div>
                                        <span className={`inline-flex items-center justify-center rounded-full bg-emerald-600 text-white font-semibold transition hover:bg-emerald-700 ${isCategory ? 'px-4 py-1.5 text-xs' : 'px-6 py-3 text-sm'}`}>
                                            Explore now
                                        </span>
                                    </div>

                                    {/* Image/Video Container - Height condition specific to section='category' */}
                                    <div className={`relative overflow-hidden rounded-xl bg-slate-100 ${isCategory ? 'h-[140px] sm:h-[160px] md:h-[180px] lg:h-[200px]' : 'h-[260px] sm:h-[320px] md:h-[360px] lg:h-[420px]'}`}>
                                        {isVideo ? (
                                            <video
                                                src={mediaSrc}
                                                poster={banner.poster || banner.thumbnail || DEFAULT_HERO[0].image}
                                                autoPlay
                                                muted
                                                loop
                                                playsInline
                                                preload="metadata"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <img
                                                {...getResponsiveImageAttributes(mediaSrc, [500, 800, 1200], "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 1200px")}
                                                alt={banner.title || 'Banner'}
                                                width="1200"
                                                height={isCategory ? "200" : "420"}
                                                loading={isFirst ? "eager" : "lazy"}
                                                fetchPriority={isFirst ? "high" : "auto"}
                                                decoding="async"
                                                className="h-full w-full object-contain"
                                                onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER; e.target.srcset = ''; }}
                                            />
                                        )}
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