import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import { FiPlus, FiMinus } from 'react-icons/fi';
import { Link } from 'react-router-dom';

// --- बदला गया: डेटा अब central फ़ाइल से आ रहा है ---
import { categoriesData } from '../../categorydata/categoryData';

const Categorypanel = ({ isOpen, setIsopencatpanel }) => {
  // यह स्टेट ट्रैक करेगी कि Drawer के अंदर कौन सी कैटेगरी खुली है
  const [openSubMenu, setOpenSubMenu] = useState(null);

  const toggleSubMenu = (index) => {
    setOpenSubMenu(openSubMenu === index ? null : index);
  };

  const DrawerList = (
    <Box sx={{ width: 300 }} role="presentation">
      {/* Drawer Header */}
      <div className="p-4 bg-[#ff5252] text-white font-bold text-lg">
        Shop By Category
      </div>

      <List className="p-0">
        {categoriesData.map((cat, index) => (
          <div key={index} className="border-b border-gray-100">
            {/* Main Category Row */}
            <ListItem disablePadding>
              <div className="flex items-center justify-between w-full p-3 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleSubMenu(index)}
              >
                <span className={`text-[14px] font-medium ${openSubMenu === index ? 'text-[#ff5252]' : 'text-gray-800'}`}>
                  {cat.title}
                </span>
                
                {/* Plus/Minus Icon */}
                <div className={openSubMenu === index ? 'text-[#ff5252]' : 'text-gray-400'}>
                  {openSubMenu === index ? <FiMinus size={18} /> : <FiPlus size={18} />}
                </div>
              </div>
            </ListItem>

            {/* Sub-Items (Accordion Effect) */}
            <div className={`overflow-hidden transition-all duration-300 ${openSubMenu === index ? 'max-h-[500px] bg-gray-50' : 'max-h-0'}`}>
              <ul className="pb-2">
                {cat.subItems.map((sub, i) => (
                  <li key={i}>
                    <Link 
                      to="/" 
                      className="block py-2 pl-8 pr-4 text-[13px] text-gray-600 hover:text-[#ff5252] hover:bg-gray-100"
                      onClick={() => setIsopencatpanel(false)} // लिंक क्लिक होते ही Drawer बंद हो जाए
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
      
      {/* Bottom Static Links (Optional: Like Help, My Account etc.) */}
      <List>
        {['All Mail', 'Support', 'Terms'].map((text) => (
          <ListItem key={text} disablePadding>
            <div className="p-3 text-[14px] text-gray-700 hover:text-[#ff5252] cursor-pointer w-full">
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