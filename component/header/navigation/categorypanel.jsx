import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import { FiPlus, FiMinus } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Categorypanel = ({ isOpen, setIsopencatpanel, categories = [] }) => {
  const [openSubMenu, setOpenSubMenu] = useState(null);

  const toggleSubMenu = (index) => {
    setOpenSubMenu(openSubMenu === index ? null : index);
  };

  const DrawerList = (
    <Box sx={{ width: 300 }} role="presentation">
      <div className="p-5 bg-gray-900 text-white font-black text-xl uppercase tracking-tighter flex justify-between items-center">
        Aaramdehi Menu
      </div>

      <List className="p-0">
        {/* 1. Primary Navigation Links (Closing Drawer on Click) */}
        <ListItem disablePadding className="border-b border-gray-100">
          <Link to="/" className="w-full p-4 text-[14px] font-bold text-gray-800 hover:text-[#ff5252]" onClick={() => setIsopencatpanel(false)}>
            Home
          </Link>
        </ListItem>
        <ListItem disablePadding className="border-b border-gray-100">
          <Link to="/blog" className="w-full p-4 text-[14px] font-bold text-gray-800 hover:text-[#ff5252]" onClick={() => setIsopencatpanel(false)}>
            Blog
          </Link>
        </ListItem>

        <div className="px-4 py-2 bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Product Categories
        </div>

        {/* 2. Dynamic Categories */}
        {categories && categories.length > 0 ? categories.map((cat, index) => {
          const catName = typeof cat === 'string' ? cat : cat.name;
          if (!catName) return null;
          return (
          <div key={index} className="border-b border-gray-100">
            <ListItem disablePadding>
              <div 
                className="flex items-center justify-between w-full p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSubMenu(index)}
              >
                <span className={`text-[14px] font-bold ${openSubMenu === index ? 'text-[#ff5252]' : 'text-gray-800'}`}>
                  {catName}
                </span>
                <div className={openSubMenu === index ? 'text-[#ff5252]' : 'text-gray-400'}>
                  {openSubMenu === index ? <FiMinus size={18} /> : <FiPlus size={18} />}
                </div>
              </div>
            </ListItem>

            <div className={`overflow-hidden transition-all duration-300 ${openSubMenu === index ? 'max-h-[500px] bg-gray-50' : 'max-h-0'}`}>
              <ul className="pb-2">
                {(cat.subCategories || []).map((sub, i) => (
                  <li key={i}>
                    <Link 
                      to={`/products?category=${catName}&subcategory=${sub}`} 
                      className="block py-2.5 pl-10 pr-4 text-[13px] font-medium text-gray-600 hover:text-[#ff5252] hover:bg-white transition-all"
                      onClick={() => setIsopencatpanel(false)} 
                    >
                      {sub}
                    </Link>
                  </li>
                ))}
                {(!cat.subCategories || cat.subCategories.length === 0) && (
                  <li>
                    <Link 
                      to={`/products?category=${catName}`}
                      className="block py-2.5 pl-10 pr-4 text-[13px] font-medium text-gray-600 hover:text-[#ff5252] hover:bg-white transition-all"
                      onClick={() => setIsopencatpanel(false)}
                    >
                      View All {catName}
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}) : (
          <div className="p-10 text-center text-gray-400 text-xs italic">
            No categories found
          </div>
        )}
      </List>

      <Divider />
      
      <List>
        {[
          { text: 'My Account', link: '/account/profile' },
          { text: 'My Orders', link: '/orders' },
          { text: 'Support', link: '/support' }
        ].map((item) => (
          <ListItem key={item.text} disablePadding>
            <Link to={item.link} className="p-4 text-[13px] font-bold text-gray-700 hover:text-[#ff5252] w-full" onClick={() => setIsopencatpanel(false)}>
              {item.text}
            </Link>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer open={isOpen} onClose={() => setIsopencatpanel(false)}>
      {DrawerList}
    </Drawer>
  );
}

export default Categorypanel;