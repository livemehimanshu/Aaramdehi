import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const LOGO_PLACEHOLDER = "https://placehold.co/200x100?text=Aaramdehi";

const AaramdehiAdBanner = () => {
  const [siteLogo, setSiteLogo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_URL || "";
        const response = await fetch(`${apiBase}/api/settings/public`, { signal: AbortSignal.timeout(10000) });
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const result = await response.json();
        // result.data is a key->value object from the public settings endpoint
        if (result.success && result.data && result.data.LOGO) {
          setSiteLogo(result.data.LOGO);
        } else if (result.success && result.data && result.data.logo) {
          setSiteLogo(result.data.logo);
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
            {siteLogo ? (
              <img 
                src={siteLogo} 
                onError={(e) => { e.target.src = LOGO_PLACEHOLDER; }}
                alt="Logo" 
                className="h-8 sm:h-10 object-contain" />
            ) : (
              <span className="text-2xl font-extrabold tracking-wider text-slate-800 uppercase sm:text-3xl">
                Aaram<span className="text-indigo-600">dehi</span>
              </span>
            )}
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
            src="/images/luxury-pillow.webp"
            alt="Pillow"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/400x400?text=Pillow'; }}
            className="w-full h-full object-contain transform hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
    </div>
  );
};

export default AaramdehiAdBanner;