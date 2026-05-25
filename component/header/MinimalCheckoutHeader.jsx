import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IoSearchOutline, IoPersonOutline, IoEllipsisVerticalOutline, IoCartOutline, IoCheckmarkOutline, IoChevronDown } from "react-icons/io5";
import { useCart } from '../../src/hooks/useCart';
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';

// Badge styling for cart count
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

const MinimalCheckoutHeader = ({ currentStep = 2 }) => {
  const navigate = useLocation();
  const { cartCount } = useCart();
  const [searchValue, setSearchValue] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Load user profile from localStorage
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail') || 'Guest User';
    const userName = userEmail.split('@')[0] || 'User';
    setUserProfile({
      name: userName.charAt(0).toUpperCase() + userName.slice(1),
      email: userEmail
    });
  }, []);

  // ✅ Manual updateCartCount removed. cartCount is now live from useCart().

  // Handle search
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      navigate(`/product?search=${searchValue}`);
    }
  };

  // Stepper configuration
  const steps = [
    { id: 1, label: 'Address', completed: currentStep > 1 },
    { id: 2, label: 'Order Summary', completed: currentStep > 2, active: currentStep === 2 },
    { id: 3, label: 'Payment', completed: false, active: currentStep === 3 }
  ];

  return (
    <div className="bg-white">
      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4 py-3">
            
            {/* Left: Logo */}
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-2xl font-black text-red-500 uppercase tracking-tighter">Aaramdehi</h1>
            </Link>

            {/* Center: Search Bar (Hidden on small screens) */}
            <div className="hidden sm:flex flex-1 max-w-md mx-4">
              <div className="w-full relative">
                <IoSearchOutline className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search for Products, Brands and More"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyPress={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200 transition-all"
                />
              </div>
            </div>

            {/* Right: User Profile, More, Cart */}
            <div className="flex items-center gap-1 md:gap-3">
              
              {/* User Profile Dropdown */}
              <div className="hidden md:block relative">
                <button
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowMoreMenu(false);
                  }}
                  className="flex items-center gap-1 px-3 py-2 text-gray-700 hover:text-red-500 transition-colors"
                >
                  <IoPersonOutline size={18} />
                  <span className="text-xs font-bold uppercase truncate">
                    {userProfile?.name || 'User'}
                  </span>
                  <IoChevronDown size={14} />
                </button>

                {/* Profile Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 w-48">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900">{userProfile?.name}</p>
                      <p className="text-xs text-gray-600">{userProfile?.email}</p>
                    </div>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      My Account
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      My Orders
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100">
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile User Icon */}
              <button className="md:hidden p-2 hover:bg-gray-50 rounded">
                <IoPersonOutline size={20} className="text-gray-700" />
              </button>

              {/* More Menu */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowMoreMenu(!showMoreMenu);
                    setShowProfileMenu(false);
                  }}
                  className="p-2 hover:bg-gray-50 rounded transition-colors"
                >
                  <IoEllipsisVerticalOutline size={20} className="text-gray-700" />
                </button>

                {/* More Dropdown Menu */}
                {showMoreMenu && (
                  <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 w-44">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Help Center
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Track Order
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100">
                      Settings
                    </button>
                  </div>
                )}
              </div>

              {/* Cart Icon */}
              <Link to="/checkout" className="p-2 hover:bg-gray-50 rounded transition-colors">
                <StyledBadge badgeContent={cartCount} color="error">
                  <IoCartOutline size={20} className="text-gray-700" />
                </StyledBadge>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Stepper Section */}
      <div className="border-b border-gray-100 bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center max-w-2xl mx-auto">
            
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm md:text-base transition-all ${
                      step.active
                        ? 'bg-blue-600 text-white'
                        : step.completed
                        ? 'bg-green-50 text-green-600 border-2 border-green-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {step.completed && !step.active ? (
                      <IoCheckmarkOutline size={20} />
                    ) : (
                      step.id
                    )}
                  </div>
                  
                  {/* Step Label */}
                  <p
                    className={`text-xs md:text-sm font-bold uppercase tracking-widest mt-2 transition-colors ${
                      step.active
                        ? 'text-blue-600'
                        : step.completed
                        ? 'text-green-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>

                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 md:mx-4 transition-colors ${
                      step.completed
                        ? 'bg-green-600'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar (shown only on small screens) */}
      <div className="sm:hidden bg-gray-50 border-b border-gray-100 p-3">
        <div className="relative">
          <IoSearchOutline className="absolute left-3 top-3 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search Products"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyPress={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200 transition-all"
          />
        </div>
      </div>
    </div>
  );
};

export default MinimalCheckoutHeader;
