import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import Categorypanel from './categorypanel';
import { HiMiniBars3CenterLeft, HiMiniBars3 } from "react-icons/hi2";
import { IoIosArrowRoundDown, IoIosArrowForward } from "react-icons/io";

const Navbar = () => {
  const [isOpenCatPanel, setIsopencatpanel] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState(null);

  const toggleMobileSubmenu = (index) => {
    setOpenMobileSubmenu((current) => (current === index ? null : index));
  };

  // Categories Data
  const categories = [
    {
      title: "Handicraft Home Furnishings",
      subItems: ["Handicraft Cushions", "Handicraft Bolster", "Handicraft King Size Bed Sheet", "Handicraft Queen Size Bed Sheet", "Rectangle Handicraft Table Cloth"]
    },
    {
      title: "Satin Cushions",
      subItems: ["Take A Nap Satin Cushion", "Bouncy Satin Cushion", "Hard Satin Cushion", "Soft Satin Cushion", "EasePuff Satin Cushion"]
    },
    {
      title: "Satin Bolsters",
      subItems: ["Bouncy Satin Bolster", "Hard Satin Bolster", "Soft Satin Bolster", "Vibrant Satin Bolster"]
    },
    {
      title: "Satin Pillows",
      subItems: ["Amazing Satin Pillow", "Brazeel Big Satin Pillow", "Brazeel Small Satin Pillow", "Ease Puff Satin Pillow", "Paris Big Satin Pillow"]
    },
    {
      title: "Cotton Pillows",
      subItems: ["Cozy Gold Embroidered Cotton Pillows", "Cozy Gold Soft Cotton Pillows", "Harmony Cotton Pillow", "Relaxed Nap Plain Cotton Pillow", "Relaxed Nap Printed Cotton Pillow"]
    },
    {
      title: "Bed Sheets",
      subItems: ["3D Bed Sheet", "5D Bed sheet", "Cotton Bed Sheet", "Embroidered Bed Sheet", "Satin Bed Sheet"]
    },
    {
      title: "Floor Door Mat",
      subItems: ["Anti Slip Door Mat", "Designer Door Mat"]
    }
  ];

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
              {categories.map((cat, index) => (
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

                  {categories.map((cat, index) => (
                    <li key={index} className='list-none border-b pb-2'>
                      <button
                        type="button"
                        onClick={() => toggleMobileSubmenu(index)}
                        className="w-full flex items-center justify-between text-left text-gray-700 hover:text-red-500 font-semibold"
                        aria-expanded={openMobileSubmenu === index}
                        aria-controls={`mobile-cat-${index}`}
                      >
                        {cat.title}
                        <IoIosArrowForward className={`transition-transform ${openMobileSubmenu === index ? 'rotate-90' : ''}`} />
                      </button>
                      {openMobileSubmenu === index && (
                        <ul id={`mobile-cat-${index}`} className="mt-2 pl-4 flex flex-col gap-1">
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