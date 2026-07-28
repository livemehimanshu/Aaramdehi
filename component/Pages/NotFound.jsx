import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../header/SEO';
import { FiSearch, FiHome, FiGrid, FiHelpCircle, FiArrowRight } from 'react-icons/fi';

const NotFound = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://www.aaramdehi.co.in';

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const categories = [
    { title: 'Beds & Mattresses', path: '/products?category=bed' },
    { title: 'Sofas & Recliners', path: '/products?category=sofa' },
    { title: 'Living Room', path: '/products?category=living' },
    { title: 'Dining & Kitchen', path: '/products?category=dining' },
    { title: 'Home Decor', path: '/products?category=decor' },
    { title: 'Lighting & Lamps', path: '/products?category=lighting' },
  ];

  return (
    <div className="min-h-[80vh] bg-gradient-to-b from-[#f8f5ef] via-white to-[#f8f5ef] px-4 py-12 md:py-20 flex flex-col justify-center items-center">
      <SEO
        title="404 - Page Not Found"
        description="The page you are looking for could not be found. Discover premium furniture and home decor at Aaramdehi."
        keywords="404 page, furniture, home decor, aaramdehi, page not found"
        ogUrl={currentUrl}
      />

      <div className="max-w-4xl w-full text-center space-y-8">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-[#b8893c]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-[#b8893c]">
          <span>Error 404</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#b8893c]"></span>
          <span>Page Missing</span>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl font-serif text-[#1A365D] tracking-tight">
            Oops! Look like you're lost.
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-600 leading-relaxed">
            The page you requested may have been moved, renamed, or is temporarily unavailable. Let's get you back on track to finding your perfect comfort.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-lg rounded-2xl overflow-hidden border border-gray-200 focus-within:border-[#1A365D] transition-all">
            <input
              type="text"
              placeholder="Search furniture, beds, sofas, lamps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-4 pl-12 text-sm text-gray-800 focus:outline-none bg-white placeholder-gray-400"
            />
            <FiSearch className="absolute left-4 text-gray-400 text-lg" />
            <button
              type="submit"
              className="bg-[#1A365D] text-white px-6 py-4 text-xs font-bold uppercase tracking-wider hover:bg-[#2a4365] transition-colors flex items-center gap-2"
            >
              Search <FiArrowRight />
            </button>
          </form>
        </div>

        {/* Quick Action Links */}
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-[#1A365D] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#2a4365] shadow-md"
          >
            <FiHome size={16} /> Go to Homepage
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-full border-2 border-[#1A365D] px-6 py-3 text-xs font-bold uppercase tracking-widest text-[#1A365D] transition hover:bg-[#1A365D] hover:text-white"
          >
            <FiGrid size={16} /> Explore All Products
          </Link>
        </div>

        {/* Popular Categories */}
        <div className="pt-8 border-t border-gray-200/80">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">Popular Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {categories.map((cat, idx) => (
              <Link
                key={idx}
                to={cat.path}
                className="p-3.5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#1A365D] text-xs font-semibold text-gray-700 hover:text-[#1A365D] transition-all text-center block"
              >
                {cat.title}
              </Link>
            ))}
          </div>
        </div>

        {/* Help & Support Footer Banner */}
        <div className="p-4 rounded-2xl bg-white/70 border border-gray-200/60 max-w-lg mx-auto flex items-center justify-between text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-[#1A365D]/10 text-[#1A365D]">
              <FiHelpCircle size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">Need assistance?</p>
              <p className="text-[11px] text-gray-500">Contact our support team anytime</p>
            </div>
          </div>
          <Link
            to="/account/profile"
            className="text-xs font-bold text-[#1A365D] hover:underline flex items-center gap-1"
          >
            Get Help <FiArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
