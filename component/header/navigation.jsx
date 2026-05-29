import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

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
        className="w-8 h-8 object-contain" />;
    }
    return cat.icon || '🎁';
  };

  return (
    <nav className="bg-white border-b shadow-sm hidden lg:block py-2.5 overflow-x-auto no-scrollbar scroll-smooth">
      <div className="container mx-auto px-10 flex justify-center items-center gap-5 min-w-[900px]">
        {/* Homepage Special Category */}
        <Link to="/products" className="flex flex-col items-center group cursor-pointer transition-transform hover:-translate-y-1">
           <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-xl group-hover:bg-blue-100 transition-colors">
             🎁
           </div>
           <span className="mt-2 text-xs font-black text-gray-700 group-hover:text-blue-600 uppercase tracking-tighter">Offers</span>
        </Link>

        {/* Dynamic DB Categories */}
        {categories.map((cat) => (
          /* Safe key handling agar _id missing ho */
          <div key={cat._id || cat.id || cat.name} className="group relative flex flex-col items-center cursor-pointer">
            <Link to={`/products?category=${cat.name}`} className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-xl group-hover:bg-blue-50 group-hover:shadow-md transition-all border border-transparent group-hover:border-blue-100">
                {getIcon(cat)}
              </div>
              <span className="mt-2 text-xs font-black text-gray-700 flex items-center gap-1 group-hover:text-blue-600 uppercase tracking-tighter">
                {cat.name} 
                {cat.subCategories?.length > 0 && <ChevronDown size={12} className="group-hover:rotate-180 transition-transform" />}
              </span>
            </Link>
            
            {/* Dropdown for Subcategories (Flipkart Style) */}
            {cat.subCategories?.length > 0 && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="bg-white shadow-2xl border border-gray-100 rounded-xl p-4 min-w-[220px]">
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-gray-100 rotate-45"></div>
                  <ul className="space-y-1 relative">
                    {cat.subCategories.map((sub, idx) => (
                      <li key={idx}>
                        <Link to={`/products?category=${sub}`} className="text-sm font-bold text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg block transition-all">
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
      </div>
    </nav>
  );
};

export default Navigation;