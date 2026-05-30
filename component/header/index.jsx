import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useCart } from '../../src/hooks/useCart'; // ✅ CartContext Hook import kiya
import Search from "../search";
import Navigation from './navigation';
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { 
  IoMenuOutline,
  IoCartOutline, 
  IoPersonOutline, 
  IoLogOutOutline, 
  IoSearchOutline,
  IoBagHandleOutline,
  IoSettingsOutline,
  IoLocationOutline,
  IoCardOutline,
  IoWalletOutline,
  IoStarOutline,
  IoCloseOutline,
  IoChevronForwardOutline,
  IoTicketOutline
} from "react-icons/io5";
import { IoIosGitCompare } from "react-icons/io";
import { CiHeart } from "react-icons/ci";
// ✅ Firebase Auth imports add karein
import { auth } from '../../src/api/firebase.js';
import { onAuthStateChanged, setPersistence, browserLocalPersistence, signOut } from "firebase/auth";
import Tooltip from '@mui/material/Tooltip';
import CartDrawer from '../CartDrawer/CartDrawer';
import WishlistDrawer from '../WishlistDrawer/WishlistDrawer'; 
import SidebarMenu from '../sidebar/Sidebar'; // ✅ Sidebar Menu import
import { getActiveCategoriesAPI } from '../../src/api/authAndAdminApi';

// ===== HEADER COMPONENT =====
// Yeh top header hai jismein logo, search, login, cart, wishlist sab dikhta hai
// Ismein CartDrawer open/close logic bhi hai

const LOGO_PLACEHOLDER = "https://placehold.co/200x100?text=Aaramdehi";

// Badge ka style customize - cart icon pe red circle number show karne ke liye
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 13,
    border: `2px solid white`,
    padding: '0 4px',
    backgroundColor: '#dc2626', // Red color
    color: 'white'
  },
}));

const Header = ({ hideNav = false }) => {
  const navigate = useNavigate();
  // ✅ पुराना तरीका हटाया: window.addEventListener और मैन्युअल localStorage
  // ✅ नया तरीका जोड़ा: सीधे CartContext से लाइव काउंट्स उठाना
  const { cartCount, wishlistCount, isCartOpen, setIsCartOpen } = useCart();

  // --- STATE MANAGEMENT ---
  const [loading, setLoading] = useState(true); // ✅ Loading state add kiya
  const [isWishlistOpen, setIsWishlistOpen] = useState(false); // Wishlist drawer open/close
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // ✅ Left Sidebar state
  const [compareCount, setCompareCount] = useState(0); // Compare mein kitne items hain
  const [user, setUser] = useState(null); // Logged in user data
  const [navCategories, setNavCategories] = useState([]); // Navigation bar ke liye categories
  const [showProfileMenu, setShowProfileMenu] = useState(false); // Profile dropdown menu
  const [siteLogo, setSiteLogo] = useState(null); // Dynamic site logo
  const [showMobileSearch, setShowMobileSearch] = useState(false); // Mobile search toggle

  // Function: Cart drawer ko toggle karna (open/close)
  const toggleCartDrawer = () => {
    if (setIsCartOpen) {
      // Use functional update to ensure we have the latest state
      setIsCartOpen(prev => !prev); 
      setIsWishlistOpen(false);
    }
  };

  // Function: Wishlist drawer ko toggle karna (open/close)
  const toggleWishlistDrawer = () => {
    setIsWishlistOpen(!isWishlistOpen);
    if (typeof setIsCartOpen === 'function') setIsCartOpen(false);
  };

  // Function: Compare mein items ki count update karna
  // Jab product add/remove hote toh compare count change ho
  const updateCompareCount = () => {
    const compare = JSON.parse(localStorage.getItem("compare")) || [];
    setCompareCount(compare.length); // Compare mein total items ka count
  };

  // Function: Logout
  const handleLogout = async () => {
    try {
      const apiBase = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, ""); 

      // ✅ 1. Sign out from Firebase
      await signOut(auth);

      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      // ✅ baseURL handle karega, yahan extra '/api' na lagayein
      await fetch(`${apiBase}/user/logout`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Logout API error:", error);
    }

    // ✅ Client-side state aur storage clear karna
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setUser(null);
    setShowProfileMenu(false);
    navigate('/login');
  };

  // useEffect: Component load hone par aur jab cart/wishlist/compare update ho
  useEffect(() => {
    // Initial counts set karna
    updateCompareCount();
    
    // ✅ 1. Immediate Session Restore: Check local storage before Firebase async check
    const savedUserData = localStorage.getItem("userData");
    const savedToken = localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (savedUserData && savedToken) {
      try { 
        setUser(JSON.parse(savedUserData)); 
      } catch (e) { 
        console.error("Session restore error:", e); 
      }
    }

    // ✅ 2. Safety Timeout: Reduced to 5 seconds for better UX
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 5000);
    
    // ✅ 1. Firebase Auth Persistence setup ('local' ensures session stays after refresh)
    setPersistence(auth, browserLocalPersistence)
      .catch((error) => console.error("Auth persistence error:", error.message));

    // ✅ 2. Auth state change ko listen karna (Official Firebase Listener)
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Agar Firebase user mil gaya, toh localStorage se detailed data fetch karein
        const userDataStr = localStorage.getItem("userData");
        if (userDataStr) {
          setUser(JSON.parse(userDataStr));
        } else {
          // Fallback: Agar localStorage khali hai toh basic Firebase data use karein
          setUser({
            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            email: firebaseUser.email,
            avatar: firebaseUser.photoURL
          });
        }
      } else {
        // ✅ Fix: Don't clear if custom Node.js JWT exists
        const currentToken = localStorage.getItem("accessToken") || localStorage.getItem("token");
        if (!currentToken) {
          localStorage.removeItem("userData");
          setUser(null);
          setShowProfileMenu(false);
        }
      }
      setLoading(false); 
      clearTimeout(safetyTimer);
    });

    // Fetch categories for navigation
    const fetchNavCategories = async () => {
      try {
        const res = await getActiveCategoriesAPI();
        if (res && res.success && Array.isArray(res.data)) {
          setNavCategories(res.data);
        } else if (Array.isArray(res)) {
          setNavCategories(res);
        }
      } catch (error) {
        console.error("Error fetching navigation categories:", error);
      }
    };
    fetchNavCategories();

    // Fetch site settings (Logo)
    const fetchSettings = async () => {
      try {
        const apiBase = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
        const response = await fetch(`${apiBase}/settings/public`, {
          signal: AbortSignal.timeout(5000) // Reduced to 5s
        });
        if (response.ok) {
          const result = await response.json();
          if (result && result.success && result.data) {
            setSiteLogo(result.data.logo || result.data.LOGO || null);
          }
        }
      } catch (error) {
        console.error("Error fetching site logo:", error);
      }
    };
    fetchSettings();

    // Jab "compareUpdated" event fire hote hain tab count update karna
    window.addEventListener("compareUpdated", updateCompareCount);

    // ✅ Listen for profile updates from the Profile Page
    const syncProfile = () => {
      const userDataStr = localStorage.getItem("userData");
      if (userDataStr) setUser(JSON.parse(userDataStr));
    };
    window.addEventListener("userDataUpdated", syncProfile);

    // Cleanup
    return () => {
      window.removeEventListener("compareUpdated", updateCompareCount);
      window.removeEventListener("userDataUpdated", syncProfile);
      unsubscribe(); // Listener cleanup
    };
  }, []);

  // ✅ 3. Premature redirection ya UI flashes rokne ke liye loading check
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Restoring Session...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className='sticky top-0 z-50 bg-white shadow-sm'>
        {/* --- TOP STRIP --- */}
        <div className="top-strip py-2 border-b border-gray-200 hidden md:block">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-between text-gray-500 gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-[12px] font-medium">Get up to 50% off new season items!</p>
                <Link to="/seller/register" className='text-[12px] font-bold text-blue-600 hover:underline'>Become a Seller</Link>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <select className="bg-transparent text-[12px] font-bold outline-none cursor-pointer border-none">
                    <option>English</option>
                    <option>Hindi</option>
                </select>
                <Link to="/help-center" className='text-[12px] hover:text-red-600 transition'>Help center</Link>
                <Link to="/order-tracking" className='text-[12px] hover:text-red-600 transition'>Order Tracking</Link>
              </div>
            </div>
          </div>
        </div>

        {/* --- MAIN HEADER --- */}
        <div className="header py-3 md:py-4 border-b border-gray-100">
          <div className="container mx-auto px-4 flex items-center justify-between gap-3 md:gap-4">
            
            {/* Mobile Hamburger Menu Icon */}
            <div className="md:hidden flex-shrink-0">
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="p-1 text-gray-700 hover:text-blue-900 transition-colors"
              >
                <IoMenuOutline size={30} />
              </button>
            </div>

            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center gap-2 group">
                {siteLogo ? (
                  <img 
                    src={siteLogo} 
                    onError={(e) => { e.target.src = LOGO_PLACEHOLDER; }}
                    alt="Aaramdehi" 
                    className="h-8 md:h-10 object-contain" />
                ) : (
                  <div className="flex flex-col">
                    <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none text-gray-800">Aaramdehi</h1>
                    <p className="text-[7px] md:text-[8px] font-bold tracking-[2px] md:tracking-[3px] text-gray-400 uppercase">Comfort Redefined</p>
                  </div>
                )}
              </Link>
            </div>

            {/* Search (hidden on very small screens) */}
            <div className="flex-1 min-w-0 max-w-full hidden sm:block">
              <Search />
            </div>

            {/* Icons & Auth */}
            <div className="flex items-center gap-1 md:gap-4 relative">
              
              {/* Auth - show text on sm+; collapse on mobile */}
              {!user ? (
                <div className='hidden sm:flex items-center gap-3 text-[13px] font-black uppercase tracking-tight'>
                  <IoPersonOutline size={20} className='text-gray-700' />
                  <Link to='/login' className='hover:text-red-600 transition'>Login</Link>
                  <span className='text-gray-300'>/</span>
                  <Link to='/signup' className='hover:text-red-600 transition'>Signup</Link>
                </div>
              ) : (
                <div className='hidden md:flex items-center gap-3'>
                  <button 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className='flex items-center gap-2 hover:text-red-600 transition'
                  >
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        onError={(e) => { e.target.src = "https://placehold.co/32x32?text=👤"; }}
                        alt="Profile" 
                        className='w-8 h-8 rounded-full object-cover' />
                    ) : (
                      <IoPersonOutline size={24} className='text-gray-700' />
                    )}
                    <span className='text-[13px] font-bold hidden sm:inline'>{user.name?.split(' ')[0]}</span>
                  </button>
                </div>
              )}

              {/* Profile Dropdown Menu (Universal for Desktop & Mobile) */}
              {user && showProfileMenu && (
                <div className='absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-48'>
                  <div className='p-3 border-b border-gray-200'>
                    <p className='text-sm font-bold'>{user.name}</p>
                    <p className='text-xs text-gray-500'>{user.email}</p>
                    {user.role === 'ADMIN' && <p className='text-xs text-red-600 font-bold mt-1'>✓ Admin</p>}
                  </div>
                  
                  {/* Admin Panel Link - Only for Admins */}
                  {user.role === 'ADMIN' && (
                    <>
                      <Link to='/admin' onClick={() => setShowProfileMenu(false)} className='block px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 border-b border-gray-200'>📊 Admin Panel</Link>
                    </>
                  )}
                  
                  <Link to='/account/profile' onClick={() => setShowProfileMenu(false)} className='block px-4 py-2.5 text-sm hover:bg-gray-50'>My Profile</Link>
                  <Link to='/orders' onClick={() => setShowProfileMenu(false)} className='block px-4 py-2.5 text-sm hover:bg-gray-50'>My Orders</Link>
                  <Link to='/wishlist' onClick={() => setShowProfileMenu(false)} className='block px-4 py-2.5 text-sm hover:bg-gray-50'>My Wishlist</Link>
                  <Link to='/account/profile' onClick={() => setShowProfileMenu(false)} className='block px-4 py-2.5 text-sm hover:bg-gray-50'>Settings</Link>
                  <button 
                    onClick={handleLogout}
                    className='w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 border-t border-gray-200 text-red-600 font-bold flex items-center gap-2'
                  >
                    <IoLogOutOutline size={16} />
                    Logout
                  </button>
                </div>
              )}

              {/* Mobile login/profile icon (visible on small screens) */}
              <div className="md:hidden ml-2">
                {user ? (
                  <button onClick={() => setIsSidebarOpen(true)} className='p-1'>
                    {user.avatar ? (
                      <img src={user.avatar} onError={(e)=>{e.target.src = "https://placehold.co/32x32?text=👤"}} alt="Profile" className='w-7 h-7 rounded-full object-cover' />
                    ) : (
                      <IoPersonOutline size={20} className='text-gray-700' />
                    )}
                  </button>
                ) : (
                  <Link to="/login" className='p-1 inline-flex items-center'>
                    <IoPersonOutline size={20} className='text-gray-700' />
                  </Link>
                )}
              </div>


              <div className="flex items-center gap-0 md:gap-1">
                {/* Compare */}
                <Tooltip title="Compare">
                  <Link to="/compare" className='!p-1.5 md:!p-2 hidden md:flex items-center justify-center'>
                    <StyledBadge badgeContent={compareCount} color="error">
                      <IoIosGitCompare size={22} className='text-gray-700' />
                    </StyledBadge>
                  </Link>
                </Tooltip>

                {/* Mobile Search Toggle */}
                <div className="sm:hidden">
                  <button onClick={() => setShowMobileSearch(!showMobileSearch)} className="p-2">
                    <IoSearchOutline size={20} className='text-gray-700' />
                  </button>
                </div>

                {/* Wishlist - Click to open Wishlist Drawer */}
                <Tooltip title="Wishlist">
                  <IconButton 
                    className='!p-1.5 md:!p-2' 
                    onClick={toggleWishlistDrawer} // Wishlist Drawer Open logic
                  >
                    <StyledBadge badgeContent={wishlistCount} color="error">
                      <CiHeart size={24} />
                    </StyledBadge>
                  </IconButton>
                </Tooltip>

                {/* Cart - Click to open Cart Drawer */}
                <Tooltip title="Cart">
                  <IconButton 
                    className='!p-1.5 md:!p-2'
                    onClick={toggleCartDrawer} // Drawer Open logic
                  >
                    <StyledBadge badgeContent={cartCount} color="error">
                      <IoCartOutline size={24} />
                    </StyledBadge>
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          </div>

        </div>

        {/* Mobile Search Bar (toggle) */}
        {showMobileSearch && (
          <div className="sm:hidden px-4 py-2 border-b border-gray-100 bg-white">
            <div className="max-w-full">
              <Search />
            </div>
          </div>
        )}

        {!hideNav && <Navigation categories={navCategories} />} {/* ✅ Categories pass kiye */}
      </header>

      {/* --- Cart Drawer Panel --- */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />

      {/* --- Wishlist Drawer Panel --- */}
      <WishlistDrawer 
        isOpen={isWishlistOpen} 
        onClose={() => setIsWishlistOpen(false)} 
      />

      {/* --- Universal Mobile Sidebar (Slide from Left) --- */}
      <SidebarMenu 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        user={user} 
        handleLogout={handleLogout} 
      />
    </>
  )
}

export default Header;