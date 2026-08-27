import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllProductsAPI, getSettingsAPI, getProductByIdAPI } from '../../src/api/authAndAdminApi';

const LOGO_PLACEHOLDER = "/aaramdehi-logo.svg";

const AaramdehiAdBanner = ({ products = [], categoryName = 'All' }) => {
  const [bannerImage, setBannerImage] = useState('/images/luxury-pillow.webp');
  const [fallbackProducts, setFallbackProducts] = useState([]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (products.length === 0) {
          const productResult = await getAllProductsAPI();
          const productData = productResult?.data?.data || productResult?.data || productResult;
          if (Array.isArray(productData)) setFallbackProducts(productData);
        }

        const result = await getSettingsAPI();
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
      }
    };
    fetchSettings();
  }, [products.length]);

  const availableProducts = products.length > 0 ? products : fallbackProducts;
  const categoryProduct = availableProducts.find((product) => product?.thumbnail || product?.image || product?.images?.length) || availableProducts[0];
  const productImage = categoryProduct?.thumbnail || categoryProduct?.image || categoryProduct?.images?.[0]?.url;
  const productId = categoryProduct?._id || categoryProduct?.id;
  const adImage = productImage || bannerImage;
  const adTitle = categoryProduct?.name || (categoryName !== 'All' ? `${categoryName} essentials` : 'Ultimate pillow for restful sleep');
  const productPath = productId ? `/product/${productId}` : '/products';

  return (
    <Link to={productPath} className="block w-full bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden my-6 hover:shadow-md transition-shadow">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 relative">
        
        {/* Brand Logo / Name */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-2">
            <img
              src="/aaramdehi-logo.svg"
              alt="Aaramdehi"
              className="h-16 w-16 shrink-0 aspect-square object-contain sm:h-20 sm:w-20"
            />
          </div>
        </div>

        {/* Catchy Hook & CTA */}
        <div className="text-center flex-1 max-w-xl">
          <h3 className="text-lg font-medium text-gray-900 sm:text-xl md:text-2xl tracking-tight">
            {adTitle}
          </h3>
          <span className="mt-2 inline-block text-base font-bold text-indigo-600 transition-colors duration-200 underline underline-offset-4">
            Shop now &rarr;
          </span>
        </div>

        {/* Product Image & Ad Badge */}
        <div className="relative w-40 h-24 sm:w-48 sm:h-28 flex items-center justify-center">
          <span className="absolute top-0 right-0 bg-gray-200 text-gray-600 text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider scale-90">Ad</span>
          <img
            src={adImage || '/images/luxury-pillow.webp'}
            alt={adTitle}
            loading="lazy"
            decoding="async"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/400x400?text=Pillow'; }}
            className="w-full h-full object-contain transform hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
    </Link>
  );
};

export default AaramdehiAdBanner;