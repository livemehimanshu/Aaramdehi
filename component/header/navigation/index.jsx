import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import Categorypanel from './categorypanel';
import { HiMiniBars3CenterLeft } from "react-icons/hi2";
import { IoIosArrowRoundDown, IoIosArrowForward } from "react-icons/io";

// --- बदला गया: अब डेटा आपकी Central फ़ाइल से आ रहा है ---
import { categoriesData } from '../../categorydata/categoryData';

const Navbar = () => {
  const [isOpenCatPanel, setIsopencatpanel] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState(null);

  const toggleMobileSubmenu = (index) => {
    setOpenMobileSubmenu((current) => (current === index ? null : index));
  };

  // --- बदला गया: 'const categories = [...]' को यहाँ से हटा दिया गया है ---

  return (
    <>
      <nav className="bg-white shadow-md p-3 md:p-0 relative">
        <div className="container mx-auto flex items-center justify-between">
          
          {/* Category Button Section */}
          <div className="w-[250px]">
            <Button className='!text-black gap-2 !py-4 w-full !justify-start' onClick={() => setIsopencatpanel(!isOpenCatPanel)}>
              <HiMiniBars3CenterLeft className='text-[18px]' />
              Shop By Category
            </Button>
          </div>

          {/* Desktop Navigation */}
          <div className="flex-grow relative">
            <ul className="hidden md:flex items-center gap-1">
              <li className='list-none'>
                <Link to='/' className="link"><Button className='!text-black'>Home</Button></Link>
              </li>

              {/* Dynamic Dropdowns */}
              {/* --- बदला गया: अब 'categoriesData' पर map चल रहा है --- */}
              {categoriesData.map((cat, index) => (
                <li key={index} className='list-none relative group py-4'>
                  <Button className='!text-black group-hover:!text-[#ff5252] !capitalize'>
                    {cat.title} <IoIosArrowRoundDown className='ml-1' />
                  </Button>
                  
                  {/* Submenu (Hidden by default, shown on hover) */}
                  <ul className="absolute top-full left-0 min-w-[200px] bg-white shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    {cat.subItems.map((sub, i) => (
                      <li key={i} className="border-b last:border-0">
                        <Link to="/" className="block px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 hover:text-[#ff5252]">
                          {sub}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>

            {/* Mobile Navigation (visible when menu is open) */}
            {isMobileMenuOpen && (
              <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-lg z-40">
                <ul className="flex flex-col gap-1 p-4">
                  <li className='list-none border-b pb-2'>
                    <Link to='/' className="block text-base font-semibold text-gray-700 hover:text-red-500">
                      Home
                    </Link>
                  </li>

                  {/* --- बदला गया: मोबाइल मेनू भी 'categoriesData' का इस्तेमाल कर रहा है --- */}
                  {categoriesData.map((cat, index) => (
                    <li key={index} className='list-none border-b pb-2'>
                      <button
                        type="button"
                        onClick={() => toggleMobileSubmenu(index)}
                        className="w-full flex items-center justify-between text-left text-gray-700 hover:text-red-500 font-semibold"
                        aria-expanded={openMobileSubmenu === index}
                      >
                        {cat.title}
                        <IoIosArrowForward className={`transition-transform ${openMobileSubmenu === index ? 'rotate-90' : ''}`} />
                      </button>
                      {openMobileSubmenu === index && (
                        <ul className="mt-2 pl-4 flex flex-col gap-1">
                          {cat.subItems.map((sub) => (
                            <li key={sub}>
                              <Link to="/" className="block text-sm text-gray-600 hover:text-red-500">
                                {sub}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>
      </nav>

      <Categorypanel isOpen={isOpenCatPanel} setIsopencatpanel={setIsopencatpanel} />
    </>
  );
};

export default Navbar;