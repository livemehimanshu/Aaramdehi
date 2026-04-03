import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import Search from "../search";
import Navigation from './navigation';
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { IoCartOutline, IoPersonOutline } from "react-icons/io5";
import { IoIosGitCompare } from "react-icons/io";
import { CiHeart } from "react-icons/ci";
import Tooltip from '@mui/material/Tooltip';
import CartDrawer from '../CartDrawer/CartDrawer';
import WishlistDrawer from '../WishlistDrawer/WishlistDrawer'; 

// ===== HEADER COMPONENT =====
// Yeh top header hai jismein logo, search, login, cart, wishlist sab dikhta hai
// Ismein CartDrawer open/close logic bhi hai

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

const Header = () => {
  // --- STATE MANAGEMENT ---
  const [isCartOpen, setIsCartOpen] = useState(false); // Cart drawer open/close
  const [isWishlistOpen, setIsWishlistOpen] = useState(false); // Wishlist drawer open/close
  const [cartCount, setCartCount] = useState(0); // Cart mein kitne items hain
  const [wishlistCount, setWishlistCount] = useState(0); // Wishlist mein kitne items hain
  const [compareCount, setCompareCount] = useState(0); // Compare mein kitne items hain

  // Function: Cart drawer ko toggle karna (open/close)
  const toggleCartDrawer = () => {
    setIsCartOpen(!isCartOpen);
    setIsWishlistOpen(false); // Wishlist ko close karna agar open tha
  };

  // Function: Wishlist drawer ko toggle karna (open/close)
  const toggleWishlistDrawer = () => {
    setIsWishlistOpen(!isWishlistOpen);
    setIsCartOpen(false); // Cart ko close karna agar open tha
  };

  // Function: Cart mein items ki count update karna
  // Jab product add/remove hote hauction toh count change ho
  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartCount(cart.length); // Cart mein total items ka count
  };

  // Function: Wishlist mein items ki count update karna
  // Jab product add/remove hote toh wishlist count change ho
  const updateWishlistCount = () => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlistCount(wishlist.length); // Wishlist mein total items ka count
  };

  // Function: Compare mein items ki count update karna
  // Jab product add/remove hote toh compare count change ho
  const updateCompareCount = () => {
    const compare = JSON.parse(localStorage.getItem("compare")) || [];
    setCompareCount(compare.length); // Compare mein total items ka count
  };

  // useEffect: Component load hone par aur jab cart/wishlist/compare update ho
  useEffect(() => {
    // Initial counts set karna
    updateCartCount();
    updateWishlistCount();
    updateCompareCount();

    // Jab "cartUpdated" event fire hote hain tab count update karna
    window.addEventListener("cartUpdated", updateCartCount);
    
    // Jab "wishlistUpdated" event fire hote hain tab count update karna
    window.addEventListener("wishlistUpdated", updateWishlistCount);

    // Jab "compareUpdated" event fire hote hain tab count update karna
    window.addEventListener("compareUpdated", updateCompareCount);

    // Cleanup
    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
      window.removeEventListener("wishlistUpdated", updateWishlistCount);
      window.removeEventListener("compareUpdated", updateCompareCount);
    };
  }, []);

  return (
    <>
      <header className='sticky top-0 z-50 bg-white shadow-sm'>
        {/* --- TOP STRIP --- */}
        <div className="top-strip py-2 border-b border-gray-200 hidden md:block">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between text-gray-500">
              <p className="text-[12px] font-medium">Get up to 50% off new season items, limited only</p>
              <div className="flex gap-4">
                <Link to="/help-center" className='text-[12px] hover:text-red-600 transition'>Help center</Link>
                <Link to="/order-tracking" className='text-[12px] hover:text-red-600 transition'>Order Tracking</Link>
              </div>
            </div>
          </div>
        </div>

        {/* --- MAIN HEADER --- */}
        <div className="header py-3 md:py-4 border-b border-gray-100">
          <div className="container mx-auto px-4 flex items-center justify-between gap-3 md:gap-4">
            
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="block">
                <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none text-gray-800">Aaramdehi</h1>
                <p className="text-[7px] md:text-[8px] font-bold tracking-[2px] md:tracking-[3px] text-gray-400 uppercase">Comfort Redefined</p>
              </Link>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-[600px] hidden sm:block">
              <Search />
            </div>

            {/* Icons & Auth */}
            <div className="flex items-center gap-1 md:gap-4">
              
              <div className='hidden lg:flex items-center gap-1 text-[13px] font-bold uppercase'>
                <Link to='/login' className='hover:text-red-600 transition'>Login</Link>
                <span className='text-gray-300'>/</span>
                <Link to='/register' className='hover:text-red-600 transition'>Register</Link>
              </div>

              {/* Mobile Person Icon */}
              <div className="lg:hidden">
                <Tooltip title="Login">
                  <Link to="/login">
                    <IconButton className='!p-2'>
                      <IoPersonOutline size={22} className="text-gray-700" />
                    </IconButton>
                  </Link>
                </Tooltip>
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

          <div className="px-4 mt-3 sm:hidden">
            <Search />
          </div>
        </div>

        <Navigation />
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
    </>
  )
}

export default Header;