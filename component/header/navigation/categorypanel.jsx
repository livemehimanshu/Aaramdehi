import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import { FiPlus, FiMinus } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { categoriesData } from '../../categorydata/categoryData';

const Categorypanel = ({ isOpen, setIsopencatpanel }) => {
  const [openSubMenu, setOpenSubMenu] = useState(null);

  const toggleSubMenu = (index) => {
    setOpenSubMenu(openSubMenu === index ? null : index);
  };

  const DrawerList = (
    <Box sx={{ width: 300 }} role="presentation">
      <div className="p-4 bg-[#ff5252] text-white font-bold text-lg uppercase tracking-wider">
        Shop By Category
      </div>

      <List className="p-0">
        {categoriesData.map((cat, index) => (
          <div key={index} className="border-b border-gray-100">
            <ListItem disablePadding>
              <div 
                className="flex items-center justify-between w-full p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSubMenu(index)}
              >
                <span className={`text-[14px] font-bold ${openSubMenu === index ? 'text-[#ff5252]' : 'text-gray-800'}`}>
                  {cat.title}
                </span>
                <div className={openSubMenu === index ? 'text-[#ff5252]' : 'text-gray-400'}>
                  {openSubMenu === index ? <FiMinus size={18} /> : <FiPlus size={18} />}
                </div>
              </div>
            </ListItem>

            <div className={`overflow-hidden transition-all duration-300 ${openSubMenu === index ? 'max-h-[500px] bg-gray-50' : 'max-h-0'}`}>
              <ul className="pb-2">
                {cat.subItems.map((sub, i) => (
                  <li key={i}>
                    {/* YAHAN BADLAV KIYA HAI: Route ko dynamic banaya */}
                    <Link 
                      to={`/products/${sub.toLowerCase().replace(/\s+/g, '-')}`} 
                      className="block py-2.5 pl-10 pr-4 text-[13px] font-medium text-gray-600 hover:text-[#ff5252] hover:bg-white transition-all"
                      onClick={() => setIsopencatpanel(false)} 
                    >
                      {sub}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </List>

      <Divider />
      
      <List>
        {['My Account', 'Support', 'Terms & Conditions'].map((text) => (
          <ListItem key={text} disablePadding>
            <div className="p-4 text-[13px] font-bold text-gray-700 hover:text-[#ff5252] cursor-pointer w-full transition-colors">
              {text}
            </div>
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