import React from 'react';
import { Link } from 'react-router-dom';

// Yeh component main navigation bar hai jo header ke niche dikhta hai
// Ab yeh dynamic categories ko render karega
const Navigation = ({ categories = [] }) => {
  // आइकॉन मैपिंग (कैटेगरी के नाम के हिसाब से)
  const getIcon = (cat) => {
    if (cat.icon?.startsWith('http')) {
      return <img 
        src={cat.icon} 
        onError={(e) => { e.target.src = "https://placehold.co/40x40?text=📦"; }}
        alt={cat.name} 
        className="w-full h-full object-contain rounded-xl" />;
    }
    return (
      <span className="text-2xl">
        {cat.icon || '🎁'}
      </span>
    );
  };

  return (
    <nav className="bg-white border-b shadow-sm py-2 relative">
      <div className="container mx-auto px-4 lg:px-10 flex lg:justify-center items-center gap-6 lg:gap-8 overflow-x-auto no-scrollbar scroll-smooth w-full">

        {/* Dynamic DB Categories */}
        {categories.map((cat) => (
          /* Safe key handling agar _id missing ho */
          <div key={cat._id || cat.id || cat.name} className="group relative flex flex-col items-center cursor-pointer flex-shrink-0">
            <Link to={`/products?category=${cat.name}`} className="group flex flex-col items-center gap-1">
              <div className="w-12 h-12 lg:w-20 lg:h-20 bg-transparent rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:bg-blue-50 group-hover:shadow-sm">
                <div className="w-full h-full flex items-center justify-center p-2.5 lg:p-4 transition-transform duration-300 group-hover:scale-105">
                  {getIcon(cat)}
                </div>
              </div>
              <span className="text-[10px] lg:text-[11px] font-extrabold text-slate-700 tracking-tight group-hover:text-[#1A365D] transition-colors duration-200 whitespace-nowrap">
                {cat.name}
              </span>
            </Link>
            
            {/* Dropdown for Subcategories (Flipkart Style) - Desktop Only (hidden on touch/mobile) */}
            {cat.subCategories?.length > 0 && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible lg:group-hover:opacity-100 lg:group-hover:visible transition-all duration-300 z-[100] hidden lg:block">
                <div className="bg-white shadow-2xl border border-gray-100 rounded-xl p-4 min-w-[220px]">
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-gray-100 rotate-45"></div>
                  <ul className="space-y-1 relative">
                    {cat.subCategories.map((sub, idx) => (
                      <li key={idx}>
                        <Link to={`/products?category=${encodeURIComponent(cat.name)}&subCategory=${encodeURIComponent(sub)}`} className="text-sm font-bold text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg block transition-all">
                          {sub}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Static Blog Link */}
        <div className="group relative flex flex-col items-center cursor-pointer flex-shrink-0">
          <Link to="/blog" className="group flex flex-col items-center gap-1">
            <div className="w-12 h-12 lg:w-20 lg:h-20 bg-transparent rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:bg-blue-50 group-hover:shadow-sm">
              <div className="w-full h-full flex items-center justify-center p-2.5 lg:p-4 transition-transform duration-300 group-hover:scale-105">
                <span className="text-2xl">📝</span>
              </div>
            </div>
            <span className="text-[10px] lg:text-[11px] font-extrabold text-slate-700 tracking-tight group-hover:text-[#1A365D] transition-colors duration-200 whitespace-nowrap">
              Journal
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;