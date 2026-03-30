import React from 'react'
import { Link } from "react-router-dom";
import Search from "../search";
import Navigation from './navigation';
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { IoCartOutline, IoPersonOutline } from "react-icons/io5"; // Person Icon जोड़ा गया
import { IoIosGitCompare } from "react-icons/io";
import { CiHeart } from "react-icons/ci";
import Tooltip from '@mui/material/Tooltip';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 13,
    border: `2px solid white`,
    padding: '0 4px',
    backgroundColor: '#dc2626',
    color: 'white'
  },
}));

const Header = () => {
  return (
    <>
      <header className='sticky top-0 z-50 bg-white shadow-sm'>
        {/* --- TOP STRIP (Mobile पर छुपा दिया गया है) --- */}
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
            
            {/* Logo: Mobile पर साइज छोटा किया गया है */}
            <div className="flex-shrink-0">
              <Link to="/" className="block">
                <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none">Aaramdehi</h1>
                <p className="text-[7px] md:text-[8px] font-bold tracking-[2px] md:tracking-[3px] text-gray-400 uppercase">Comfort Redefined</p>
              </Link>
            </div>

            {/* Search: टैबलेट/डेस्कटॉप पर दिखेगा, मोबाइल पर Navigation के अंदर या नीचे रख सकते हैं */}
            <div className="flex-1 max-w-[600px] hidden sm:block">
              <Search />
            </div>

            {/* Icons & Auth */}
            <div className="flex items-center gap-1 md:gap-4">
              
              {/* Desktop Login / Register (Text) */}
              <div className='hidden lg:flex items-center gap-1 text-[13px] font-bold uppercase'>
                <Link to='/login' className='hover:text-red-600 transition'>Login</Link>
                <span className='text-gray-300'>/</span>
                <Link to='/register' className='hover:text-red-600 transition'>Register</Link>
              </div>

              {/* Mobile/Tablet Login Icon (सिर्फ छोटे डिवाइस पर दिखेगा) */}
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
                {/* Compare: मोबाइल पर ज्यादा भीड़ न हो इसलिए इसे md:flex रखा है */}
                <Tooltip title="Compare">
                  <IconButton className='!p-1.5 md:!p-2 hidden md:flex'>
                    <StyledBadge badgeContent={0} showZero>
                      <IoIosGitCompare size={22} />
                    </StyledBadge>
                  </IconButton>
                </Tooltip>

                <Tooltip title="Wishlist">
                  <IconButton className='!p-1.5 md:!p-2'>
                    <StyledBadge badgeContent={0} showZero>
                      <CiHeart size={24} />
                    </StyledBadge>
                  </IconButton>
                </Tooltip>

                <Tooltip title="Cart">
                  <IconButton className='!p-1.5 md:!p-2'>
                    <StyledBadge badgeContent={4} color="error">
                      <IoCartOutline size={24} />
                    </StyledBadge>
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Mobile Search: मोबाइल पर सर्च बार को लोगो के नीचे दिखाने के लिए (Optional) */}
          <div className="px-4 mt-3 sm:hidden">
            <Search />
          </div>
        </div>

        <Navigation />
      </header>
    </>
  )
}
export default Header;