import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSettingsAPI, getProductByIdAPI } from '../../src/api/authAndAdminApi';

const LOGO_PLACEHOLDER = "/aaramdehi-logo.svg";

const AaramdehiAdBanner = () => {
  const [siteLogo, setSiteLogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bannerImage, setBannerImage] = useState('/images/luxury-pillow.webp');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const result = await getSettingsAPI();
        if (result.success && result.data && result.data.LOGO) {
          setSiteLogo(result.data.LOGO);
        } else if (result.success && result.data && result.data.logo) {
          setSiteLogo(result.data.logo);
        }

        // Check for a featured product id or explicit banner image in public settings
        if (result.success && result.data) {
          const data = result.data;
          // Common keys: FEATURED_PRODUCT_ID, BANNER_FEATURED_PRODUCT_ID, BANNER_IMAGE
          const featuredId = data.FEATURED_PRODUCT_ID || data.BANNER_FEATURED_PRODUCT_ID || data.FEATURED_PRODUCT || null;
          const bannerImgSetting = data.BANNER_IMAGE || data.HERO_BANNER_IMAGE || null;

          if (featuredId) {
            try {
              const prodRes = await getProductByIdAPI(featuredId);
              if (prodRes && prodRes.success && prodRes.product) {
                const p = prodRes.product;
                const img = p.thumbnail || (p.images && p.images[0]?.url) || p.image;
                if (img) setBannerImage(img);
              } else if (prodRes && prodRes.success && prodRes.data) {
                // Some product APIs return data under `data` key
                const p = prodRes.data;
                const img = p.thumbnail || (p.images && p.images[0]?.url) || p.image;
                if (img) setBannerImage(img);
              }
            } catch (err) {
              console.warn('Failed to fetch featured product for banner:', err.message || err);
            }
          } else if (bannerImgSetting) {
            setBannerImage(bannerImgSetting);
          }
        }
      } catch (error) {
        console.error("Error fetching logo for banner:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  return (
    <div className="w-full bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden my-6">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 relative">
        
        {/* Brand Logo / Name */}
        <div className="flex-shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={siteLogo || LOGO_PLACEHOLDER}
              onError={(e) => { e.currentTarget.src = LOGO_PLACEHOLDER; }}
              alt="Aaramdehi"
              className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 aspect-square object-contain"
            />
          </Link>
        </div>

        {/* Catchy Hook & CTA */}
        <div className="text-center flex-1 max-w-xl">
          <h3 className="text-lg font-medium text-gray-900 sm:text-xl md:text-2xl tracking-tight">
            Ultimate pillow for restful sleep
          </h3>
          <Link to="/products" className="mt-2 inline-block text-base font-bold text-indigo-600 hover:text-indigo-500 transition-colors duration-200 underline underline-offset-4">
            Shop now &rarr;
          </Link>
        </div>

        {/* Product Image & Ad Badge */}
        <div className="relative w-40 h-24 sm:w-48 sm:h-28 flex items-center justify-center">
          <span className="absolute top-0 right-0 bg-gray-200 text-gray-600 text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider scale-90">Ad</span>
          <img
            src={bannerImage || '/images/luxury-pillow.webp'}
            alt="Pillow"
            loading="lazy"
            decoding="async"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/400x400?text=Pillow'; }}
            className="w-full h-full object-contain transform hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
    </div>
  );
};

export default AaramdehiAdBanner;