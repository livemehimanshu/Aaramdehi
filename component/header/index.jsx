import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useCart } from '../../src/hooks/useCart'; // ✅ CartContext Hook import kiya
import toast from 'react-hot-toast';
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
const CartDrawer = lazy(() => import('../CartDrawer/CartDrawer'));
const WishlistDrawer = lazy(() => import('../WishlistDrawer/WishlistDrawer')); 
const SidebarMenu = lazy(() => import('../sidebar/Sidebar')); // ✅ Sidebar Menu import
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

  const safeParseJSON = (rawValue) => {
    if (typeof rawValue !== 'string' || !rawValue.trim() || rawValue === 'undefined' || rawValue === 'null') {
      return null;
    }
    try {
      return JSON.parse(rawValue);
    } catch (err) {
      console.warn('Invalid JSON stored in localStorage for userData:', err, rawValue);
      return null;
    }
  };

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
    let compare = [];
    try {
      const rawCompare = localStorage.getItem("compare");
      compare = rawCompare ? JSON.parse(rawCompare) : [];
    } catch (err) {
      console.warn('Invalid JSON stored in localStorage for compare:', err, localStorage.getItem("compare"));
      compare = [];
      localStorage.removeItem("compare");
    }
    setCompareCount(Array.isArray(compare) ? compare.length : 0); // Compare mein total items ka count
  };

  // Function: Logout
  const handleLogout = async () => {
    try {
      if (auth) await signOut(auth);
    } catch (error) {
      console.error("Firebase logout error:", error);
    } finally {
      try {
        const envApiUrl = import.meta.env.VITE_API_URL;
        const isProd = import.meta.env.PROD;
        const apiBase = (envApiUrl || (isProd ? 'https://aaramdehi.onrender.com/api' : '/api')).replace(/\/$/, "");
        await fetch(`${apiBase}/user/logout`, { method: 'GET', credentials: 'include' });
      } catch (error) {
        console.error("Backend logout error:", error);
      } finally {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        toast.success("Logged out successfully!");
        setUser(null);
        setShowProfileMenu(false);
        setIsSidebarOpen(false);
        navigate('/login');
      }
    }
  };

  // useEffect: Component load hone par aur jab cart/wishlist/compare update ho
  useEffect(() => {
    // Initial counts set karna
    updateCompareCount();
    
    // ✅ 1. Immediate Session Restore: Check local storage before Firebase async check
    const savedUserData = safeParseJSON(localStorage.getItem("userData"));
    if (savedUserData) {
      setUser(savedUserData);
    }

    const checkBackendSession = async () => {
      try {
        const envApiUrl = import.meta.env.VITE_API_URL;
        const isProd = import.meta.env.PROD;
        const apiBase = (envApiUrl || (isProd ? 'https://aaramdehi.onrender.com/api' : '/api')).replace(/\/$/, "");
        const response = await fetch(`${apiBase}/auth/me`, { credentials: 'include' });
        if ((response.status === 401 || response.status === 403) && localStorage.getItem('userData')) {
          localStorage.removeItem('userData');
          setUser(null);
          setShowProfileMenu(false);
        }
      } catch (error) {
        // A temporary network failure must not log the user out locally.
        console.warn('Backend session check failed:', error.message);
      }
    };
    checkBackendSession();
    const sessionCheckTimer = setInterval(checkBackendSession, 60 * 1000);
    window.addEventListener('focus', checkBackendSession);

    // ✅ 2. Safety Timeout: Reduced to 5 seconds for better UX
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    let unsubscribe = () => {};
    
    // Defer Firebase Auth check to idle time to prevent initial render blocking
    const authTimer = setTimeout(() => {
      if (auth) {
        setPersistence(auth, browserLocalPersistence)
          .catch((error) => console.error("Auth persistence error:", error.message));

        const firebaseUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            const savedUserData = safeParseJSON(localStorage.getItem("userData"));
            if (savedUserData) {
              setUser(savedUserData);
            } else {
              setUser({
                name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                email: firebaseUser.email,
                avatar: firebaseUser.photoURL
              });
            }
          } else {
            // Custom backend sessions use the HttpOnly cookie, not Firebase Auth.
            // Preserve the locally cached profile when Firebase has no session.
            const savedUserData = safeParseJSON(localStorage.getItem("userData"));
            if (savedUserData) {
              setUser(savedUserData);
            } else {
              setUser(null);
              setShowProfileMenu(false);
            }
          }
          setLoading(false);
        });

        unsubscribe = firebaseUnsubscribe;
      } else {
        setLoading(false);
      }
    }, 1000);

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
        const envApiUrl = import.meta.env.VITE_API_URL;
        const isProd = import.meta.env.PROD;
        const apiBase = (envApiUrl || (isProd ? 'https://aaramdehi.onrender.com/api' : '/api')).replace(/\/$/, "");
        const response = await fetch(`${apiBase}/settings/public`, {
          signal: AbortSignal.timeout(5000) // Reduced to 5s
        });
        const contentType = response.headers.get("content-type");
        if (response.ok && contentType && contentType.includes("application/json")) {
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
      const savedUserData = safeParseJSON(localStorage.getItem("userData"));
      if (savedUserData) setUser(savedUserData);
    };
    window.addEventListener("userDataUpdated", syncProfile);

    // Cleanup
    return () => {
      window.removeEventListener("compareUpdated", updateCompareCount);
      window.removeEventListener("userDataUpdated", syncProfile);
      window.removeEventListener('focus', checkBackendSession);
      clearInterval(sessionCheckTimer);
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Session restoring background check (non-blocking for immediate FCP performance)

  return (
    <>
      <header className='sticky top-0 z-[1000] bg-white shadow-sm'>
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
        <div className="header py-2 md:py-4 border-b border-gray-100">
          <div className="container mx-auto px-2 md:px-4 flex items-center justify-between gap-2 md:gap-4">
            
            {/* Mobile Hamburger Menu Icon */}
            <div className="md:hidden flex-shrink-0">
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                aria-label="Open menu navigation"
                className="p-1.5 text-gray-700 hover:text-blue-900 transition-colors"
              >
                <IoMenuOutline size={26} />
              </button>
            </div>

            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" aria-label="Aaramdehi Homepage" className="flex items-center gap-2 group/logo select-none">
                {siteLogo ? (
                  <div className="relative overflow-hidden rounded">
                    <img 
                      src={siteLogo} 
                      onError={(e) => { e.target.src = LOGO_PLACEHOLDER; }}
                      alt="Aaramdehi" 
                      className="h-8 md:h-10 object-contain transition-transform duration-300 group-hover/logo:scale-105" 
                    />
                    {/* Amazon-style shimmer highlight effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/logo:animate-[shimmer_1s_ease-in-out]" />
                  </div>
                ) : (
                  <div className="flex flex-col -space-y-0.5">
                    <h1 className="text-lg md:text-2xl font-black uppercase tracking-tighter leading-none text-slate-800 transition-colors duration-300 group-hover/logo:text-[#1A365D]">
                      Aaram<span className="text-red-600 transition-colors duration-300 group-hover/logo:text-red-500">dehi</span>
                    </h1>
                    <div className="flex items-center gap-0.5">
                      <p className="text-[8px] md:text-[9px] font-extrabold tracking-wider text-gray-500 italic">
                        Explore <span className="text-yellow-500 group-hover/logo:text-yellow-400 transition-colors duration-300">Luxe</span>
                      </p>
                      <span className="text-yellow-500 text-[10px] md:text-[11px] animate-pulse group-hover/logo:rotate-[360deg] group-hover/logo:scale-125 transition-all duration-700 inline-block origin-center">
                        ✦
                      </span>
                    </div>
                  </div>
                )}
              </Link>
            </div>

            {/* Search (hidden on very small screens) */}
            <div className="flex-1 min-w-0 max-w-full hidden sm:block">
              <Search />
            </div>

            {/* Icons & Auth */}
            <div className="flex items-center gap-0.5 md:gap-4 relative">
              
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
                    aria-label="User account profile menu"
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
              <div className="md:hidden">
                {user ? (
                  <button onClick={() => setIsSidebarOpen(true)} aria-label="Open sidebar profile" className='p-1'>
                    {user.avatar ? (
                      <img src={user.avatar} onError={(e)=>{e.target.src = "https://placehold.co/32x32?text=👤"}} alt="Profile" className='w-6 h-6 rounded-full object-cover' />
                    ) : (
                      <IoPersonOutline size={22} className='text-gray-700' />
                    )}
                  </button>
                ) : (
                  <Link to="/login" aria-label="Login page" className='p-1.5 inline-flex items-center'>
                    <IoPersonOutline size={22} className='text-gray-700' />
                  </Link>
                )}
              </div>


              <div className="flex items-center gap-0 md:gap-1">
                {/* Compare */}
                <Tooltip title="Compare">
                  <Link to="/compare" aria-label="Compare products" className='!p-1.5 md:!p-2 hidden md:flex items-center justify-center'>
                    <StyledBadge badgeContent={compareCount} color="error" overlap="circular">
                      <IoIosGitCompare size={20} className='text-gray-700' />
                    </StyledBadge>
                  </Link>
                </Tooltip>

                {/* Mobile Search Toggle */}
                <div className="sm:hidden">
                  <button onClick={() => setShowMobileSearch(!showMobileSearch)} aria-label="Toggle mobile search" className="p-1.5">
                    <IoSearchOutline size={22} className='text-gray-700' />
                  </button>
                </div>

                {/* Wishlist - Click to open Wishlist Drawer */}
                <Tooltip title="Wishlist">
                  <IconButton 
                    className='!p-1.5 md:!p-2' 
                    aria-label="Open wishlist"
                    onClick={toggleWishlistDrawer} // Wishlist Drawer Open logic
                  >
                    <StyledBadge badgeContent={wishlistCount} color="error" overlap="circular">
                      <CiHeart size={26} />
                    </StyledBadge>
                  </IconButton>
                </Tooltip>

                {/* Cart - Click to open Cart Drawer */}
                <Tooltip title="Cart">
                  <IconButton 
                    className='!p-1.5 md:!p-2'
                    aria-label="Open shopping cart"
                    onClick={toggleCartDrawer} // Drawer Open logic
                  >
                    <StyledBadge badgeContent={cartCount} color="error" overlap="circular">
                      <IoCartOutline size={26} />
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
      <Suspense fallback={null}>
        {isCartOpen && (
          <CartDrawer 
            isOpen={isCartOpen} 
            onClose={() => setIsCartOpen(false)} 
          />
        )}

        {/* --- Wishlist Drawer Panel --- */}
        {isWishlistOpen && (
          <WishlistDrawer 
            isOpen={isWishlistOpen} 
            onClose={() => setIsWishlistOpen(false)} 
          />
        )}

        {/* --- Universal Mobile Sidebar (Slide from Left) --- */}
        {isSidebarOpen && (
          <SidebarMenu 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
            user={user} 
            handleLogout={handleLogout} 
          />
        )}
      </Suspense>
    </>
  )
}

export default Header;