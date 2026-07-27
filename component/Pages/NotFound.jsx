import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../header/SEO';

const NotFound = () => {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://www.aaramdehi.co.in';

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-[#f8f5ef] px-4 py-16">
      <SEO
        title="Page Not Found"
        description="The page you are looking for could not be found. Explore premium furniture and home decor at Aaramdehi."
        keywords="404 page, furniture, home decor, aaramdehi"
        ogUrl={currentUrl}
      />

      <div className="max-w-2xl text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-[#b8893c] font-semibold mb-4">Error 404</p>
        <h1 className="text-4xl md:text-6xl font-serif text-[#1A365D] mb-4">Page not found</h1>
        <p className="text-base md:text-lg text-gray-600 leading-8">
          The page you were looking for may have moved, been removed, or never existed. Explore our curated furniture and home decor collection to continue your journey.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="rounded-full bg-[#1A365D] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2a4365]">
            Go to Homepage
          </Link>
          <Link to="/products" className="rounded-full border border-[#1A365D] px-6 py-3 text-sm font-semibold text-[#1A365D] transition hover:bg-[#1A365D] hover:text-white">
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
