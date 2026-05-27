import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import Categorypanel from './categorypanel';
import IconButton from '@mui/material/IconButton'; // Import IconButton
import { IoIosArrowRoundDown, IoIosArrowForward, IoIosMenu, IoIosClose } from "react-icons/io"; // HiMiniBars3CenterLeft is no longer used

const Navbar = ({ categories = [] }) => {
  const [isOpenCatPanel, setIsopencatpanel] = useState(false);

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-100 p-2 md:p-0 relative z-40">
        <div className="container mx-auto flex items-center justify-between">
          
          {/* 1. Standardized Menu Icon (Category Trigger) */}
          <div className="flex-shrink-0">
            <Button className='!text-black gap-2 !py-4 !px-4' onClick={() => setIsopencatpanel(true)}>
              <IoIosMenu className='text-[24px]' />
              <span className="hidden lg:inline font-black uppercase text-[12px] tracking-widest">Shop By Category</span>
            </Button>
          </div>

          {/* 2. Navigation Section (Horizontal Categories) */}
          <div className="flex-grow relative overflow-hidden">
            <ul className="hidden md:flex items-center gap-1 overflow-x-auto no-scrollbar whitespace-nowrap px-4">
              <li className='list-none'>
                <Link to='/' className="link"><Button className='!text-black font-bold uppercase text-[12px]'>Home</Button></Link>
              </li>

              {categories && categories.length > 0 ? (
                categories.map((cat, index) => {
                  const catName = typeof cat === 'string' ? cat : cat.name;
                  if (!catName) return null;
                  return (
                    <li key={index} className='list-none py-4'>
                      <Link to={`/products?category=${catName}`} className="link">
                        <Button className='!text-black hover:!text-[#ff5252] !capitalize font-bold text-[12px]'>
                          {catName}
                        </Button>
                      </Link>
                    </li>
                  );
                })
              ) : null}

              {/* --- ADDED: BLOG OPTION FOR DESKTOP --- */}
              <li className='list-none'>
                <Link to='/blog' className="link">
                  <Button className='!text-black hover:!text-[#ff5252] font-bold uppercase text-[12px]'>Blog</Button>
                </Link>
              </li>
            </ul>

            {/* Mobile Menu Toggle Button */}
          </div>

          {/* Mobile View Toggle */}
          <div className="md:hidden flex items-center">
             <IconButton onClick={() => setIsopencatpanel(true)} className="!text-black">
                <IoIosMenu size={28} />
             </IconButton>
          </div>
        </div>
      </nav>

      <Categorypanel isOpen={isOpenCatPanel} setIsopencatpanel={setIsopencatpanel} categories={categories} />
    </>
  );
};

export default Navbar;