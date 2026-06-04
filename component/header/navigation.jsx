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
        className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-300" />;
    }
    return (
      <span className="group-hover:scale-110 transition-transform duration-300">
        {cat.icon || '🎁'}
      </span>
    );
  };

  return (
    <nav className="bg-white border-b shadow-sm hidden lg:block py-2.5 relative">
      <div className="container mx-auto px-10 flex justify-center items-center gap-5 min-w-[900px]">

        {/* Dynamic DB Categories */}
        {categories.map((cat) => (
          /* Safe key handling agar _id missing ho */
          <div key={cat._id || cat.id || cat.name} className="group relative flex flex-col items-center cursor-pointer">
            <Link to={`/products?category=${cat.name}`} className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl group-hover:bg-blue-50 group-hover:shadow-md transition-all border border-transparent group-hover:border-blue-100 overflow-hidden">
                {getIcon(cat)}
              </div>
            </Link>
            
            {/* Dropdown for Subcategories (Flipkart Style) */}
            {cat.subCategories?.length > 0 && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100]">
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
      </div>
    </nav>
  );
};

export default Navigation;