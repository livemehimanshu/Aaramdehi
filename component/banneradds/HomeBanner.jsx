import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';
import { getActiveBannersAPI } from '../../src/api/authAndAdminApi';
import { optimizeImage, getResponsiveImageAttributes } from '../../src/utils/imageOptimizer';
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

// Helper function to check if the media URL or object is a video
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

/**
 * HomeBanner Component
 * @param {string} section - Kaunsa section dikhana hai (e.g. 'hero', 'promotional')
 */
const HomeBanner = ({ section = 'hero' }) => {
    const [banners, setBanners] = useState(section === 'hero' ? DEFAULT_HERO : []);
    const [loading, setLoading] = useState(section === 'hero' ? false : true);
    const PLACEHOLDER = 'https://placehold.co/1200x400?text=Banner';
    const swiperStyles = ".swiper-button-next, .swiper-button-prev { color: #fff !important; } .swiper-pagination-bullet-active { background: #dc2626 !important; }";

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
            <div className={`w-full ${section === 'hero' ? 'mb-10' : 'my-8'} px-4 container mx-auto`}>
                <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] items-center bg-slate-50 p-6 md:p-8 rounded-[28px] border border-gray-100 animate-pulse min-h-[300px] sm:min-h-[360px] md:min-h-[420px]">
                    <div className="space-y-4">
                        <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
                        <div className="h-10 w-3/4 bg-slate-200 rounded-xl"></div>
                        <div className="h-16 w-full bg-slate-200 rounded-xl"></div>
                        <div className="h-10 w-32 bg-slate-200 rounded-full"></div>
                    </div>
                    <div className="w-full rounded-[24px] bg-slate-200 h-[260px] sm:h-[320px] md:h-[360px] lg:h-[420px]"></div>
                </div>
            </div>
        );
    }

    if (banners.length === 0) return null;

    return (
        <div className={`w-full ${section === 'hero' ? 'mb-10' : 'my-8'} px-4 container mx-auto min-h-[300px] sm:min-h-[360px] md:min-h-[420px]`}>
            <Swiper
                modules={[Navigation, Autoplay, Pagination]}
                navigation={true}
                pagination={{ clickable: true }}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                loop={banners.length > 1}
                className="rounded-2xl overflow-hidden shadow-lg border border-gray-100"
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
                                        {isVideo ? (
                                            <video
                                                src={mediaSrc}
                                                autoPlay
                                                muted
                                                loop
                                                playsInline
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <img
                                                {...getResponsiveImageAttributes(mediaSrc, [500, 800, 1200], "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 1200px")}
                                                alt={banner.title || 'Banner'}
                                                width="1200"
                                                height="420"
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