import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, ChevronDown, MapPin, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const LOGO_PLACEHOLDER = "https://placehold.co/200x100?text=Aaramdehi";

const Header = () => {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [userName, setUserName] = useState("Login");
  const [siteLogo, setSiteLogo] = useState(null);

  // 1. Cart aur Wishlist count को sync करने वाला फंक्शन
  const updateCounts = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    
    // कुल क्वांटिटी जोड़ना (जैसे 2 पिलो + 1 बेड = 3)
    setCartCount(cart.reduce((total, item) => total + (item.qty || 1), 0)); // Cart items count
    setWishlistCount(wishlist.length); // Wishlist items count
    
    // यूजर का नाम (अगर डेटाबेस/टोकन में हो)
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.name) setUserName(user.name.split(' ')[0]);
  };

  const fetchSettings = async () => {
    try {
      const envApiUrl = import.meta.env.VITE_API_URL;
      const isProd = import.meta.env.PROD;
      const normalizedEnvApiUrl = envApiUrl ? envApiUrl.replace(/\/$/, '') : '';
      const apiBase = normalizedEnvApiUrl || (isProd ? 'https://aaramdehi-backend.onrender.com' : '/api');
      const response = await fetch(`${apiBase}/settings/public`);
      const result = await response.json();
      if (result.success && result.data) setSiteLogo(result.data.LOGO || result.data.logo || null);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    updateCounts();
    fetchSettings();
    // जब भी कार्ट या विशलिस्ट अपडेट हो, हेडर को पता चल जाए
    window.addEventListener("cartUpdated", updateCounts);
    window.addEventListener("wishlistUpdated", updateCounts);
    return () => {
      window.removeEventListener("cartUpdated", updateCounts);
      window.removeEventListener("wishlistUpdated", updateCounts);
    };
  }, []);

  return (
    <header className="bg-blue-600 sticky top-0 z-50 font-['Poppins'] shadow-lg">
      {/* Top Bar: Location & Services */}
      <div className="bg-blue-700/50 text-[10px] md:text-[12px] py-1.5 border-b border-white/10">
        <div className="container mx-auto px-4 md:px-10 flex justify-between items-center text-blue-50">
          <div className="flex space-x-4">
            <span className="cursor-pointer hover:text-yellow-400 font-bold transition-colors uppercase tracking-widest">Aaramdehi Plus</span>
            <span className="cursor-pointer hover:text-yellow-400 transition-colors hidden sm:inline">Premium Store</span>
          </div>
          <div className="flex items-center space-x-1 cursor-pointer group">
            <MapPin size={12} className="group-hover:text-yellow-400 transition-colors" />
            <span className="group-hover:text-yellow-400 transition-colors">Deliver to Saharanpur, 247001</span>
            <span className="text-yellow-400 font-bold ml-1 hover:underline text-[11px]">Change</span>
          </div>
        </div>
      </div>

      {/* Main Bar: Logo, Search, Account, Cart */}
      <div className="container mx-auto px-4 md:px-10 py-4 flex items-center justify-between gap-4 md:gap-8">
        {/* Logo */}
        <Link to="/" className="shrink-0">
          {siteLogo ? (
            <img 
              src={siteLogo} 
              onError={(e) => { e.target.src = LOGO_PLACEHOLDER; }}
              alt="Logo" 
              className="h-8 md:h-10 object-contain brightness-0 invert" />
          ) : (
            <span className="text-2xl font-black text-white tracking-tighter italic">Aaramdehi<span className="text-yellow-500">+</span></span>
          )}
        </Link>

        {/* Search Bar */}
        <div className="hidden md:flex flex-grow max-w-2xl relative">
          <input 
            type="text" 
            placeholder="Search for furniture, home decor and more..." 
            className="w-full bg-white border-none py-2.5 px-4 pl-11 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all text-sm shadow-inner"
          />
          <Search className="absolute left-4 top-3.5 text-gray-400" size={16} />
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-4 md:space-x-8 text-white">
          {/* Wishlist Icon */}
          <div 
            onClick={() => navigate('/wishlist')}
            className="flex flex-col items-center cursor-pointer hover:text-yellow-400 transition-colors relative group"
          >
            <Heart size={22} className="group-hover:fill-yellow-400 transition-all" />
            <span className="text-[10px] font-bold mt-0.5 hidden md:block">Wishlist</span>
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-yellow-400 text-blue-900 text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center border-2 border-blue-600">{wishlistCount}</span>
            )}
          </div>

          {/* User Account */}
          <div className="bg-white text-blue-600 px-5 py-2 rounded-lg font-black text-sm cursor-pointer hover:bg-blue-50 transition-colors hidden md:flex items-center gap-2">
            <User size={18} /> {userName}
          </div>

          {/* Cart Icon */}
          <div 
            onClick={() => navigate('/cart')}
            className="flex items-center space-x-2 cursor-pointer hover:text-yellow-400 transition-colors relative group"
          >
            <div className="relative">
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-blue-900 text-[9px] font-black rounded-full h-4.5 w-4.5 flex items-center justify-center border-2 border-blue-600 shadow-sm">
                    {cartCount}
                </span>
                )}
            </div>
            <span className="font-bold text-sm hidden md:block">Cart</span>
          </div>
        </div>
      </div>

      {/* Categories Bar (Icons & Text) */}
      <nav className="bg-white border-t border-gray-50 overflow-x-auto no-scrollbar scroll-smooth py-1">
        <div className="container mx-auto px-4 md:px-10 py-3 flex justify-center items-center min-w-[800px] gap-6">
          {dbCategories.map((item, index) => (
            <Link 
                to={`/products?category=${item.name}`} 
                key={index} 
                className="flex flex-col items-center group cursor-pointer space-y-2 shrink-0 transition-transform hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl group-hover:bg-blue-50 group-hover:shadow-md transition-all border border-transparent group-hover:border-blue-100 overflow-hidden">
                {item.icon?.startsWith('http') ? (
                  <img src={item.icon} alt={item.name} className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-300" />
                ) : (
                  <span className="group-hover:scale-110 transition-transform duration-300">
                    {item.icon || '🎁'}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-black text-gray-600 group-hover:text-blue-600 uppercase tracking-tighter">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Header;