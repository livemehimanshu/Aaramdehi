import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import Categorypanel from './categorypanel';
import IconButton from '@mui/material/IconButton';
import { IoIosMenu, IoIosArrowDown } from "react-icons/io";

const Navbar = ({ categories = [] }) => {
  const [isOpenCatPanel, setIsopencatpanel] = useState(false);

  // आइकन रेंडर करने का फंक्शन
  const getIcon = (cat) => {
    if (cat.icon?.startsWith('http')) {
      return <img 
        src={cat.icon} 
        alt={cat.name} 
        className="w-6 h-6 object-contain" 
        onError={(e) => { e.target.src = "🎁"; }} />;
    }
    return <span className="text-lg">{cat.icon || '🎁'}</span>;
  };

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
                  if (!cat.name) return null;
                  return (
                    <li key={index} className='list-none py-2 group relative'>
                      <div className="flex flex-col items-center cursor-pointer">
                        <Link to={`/products?category=${cat.name}`} className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-blue-50 transition-all border border-transparent group-hover:border-blue-100 group-hover:shadow-sm">
                            {getIcon(cat)}
                          </div>
                        </Link>
                      </div>

                      {/* ✅ Sub-Category Dropdown on Hover */}
                      {cat.subCategories?.length > 0 && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                          <div className="bg-white shadow-2xl border border-gray-100 rounded-xl p-4 min-w-[180px]">
                            <div className="text-[10px] font-black uppercase text-gray-400 mb-2 border-b pb-1">{cat.name}</div>
                            <ul className="flex flex-col gap-1">
                              {cat.subCategories.map((sub, sIdx) => (
                                <li key={sIdx}>
                                  <Link to={`/products?category=${sub}`} className="text-[12px] text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded-md block transition-all font-bold uppercase">
                                    {sub}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
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