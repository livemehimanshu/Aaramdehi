import React, { useState } from 'react';
import { FiPlus, FiMinus } from 'react-icons/fi';
import { IoIosArrowForward } from "react-icons/io";

// --- बदला गया: अब हम डेटा को आपकी बनाई हुई नई फ़ाइल से ला रहे हैं ---
import { categoriesData } from '../categorydata/categoryData'; 

const Sidebar = () => {
  // --- बदला गया: 'const categories = [...]' को यहाँ से हटा दिया गया है क्योंकि अब डेटा ऊपर Import हो रहा है ---

  const [openCategory, setOpenCategory] = useState(null);

  const toggleCategory = (index) => {
    setOpenCategory(openCategory === index ? null : index);
  };

  return (
    <div className="w-full bg-white font-sans text-[#212121] border shadow-sm">
      <div className="p-4 border-b bg-gray-50">
        <h2 className="text-lg font-bold uppercase text-gray-700 tracking-wide">Filters</h2>
      </div>

      {/* --- CATEGORIES SECTION --- */}
      <div className="p-2">
        <h3 className="text-[12px] font-bold uppercase text-gray-400 mb-4 px-2 mt-2">Product Categories</h3>
        
        <div className="space-y-1">
          {/* --- बदला गया: 'categories.map' की जगह अब 'categoriesData.map' का इस्तेमाल हो रहा है --- */}
          {categoriesData.map((cat, index) => (
            <div key={index} className="border-b last:border-0 border-gray-100 pb-1">
              
              {/* Main Item Row */}
              <div 
                className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50 rounded-md transition-all group"
                onClick={() => toggleCategory(index)}
              >
                <span className={`text-sm font-medium transition-colors ${openCategory === index ? 'text-[#ff5252]' : 'text-gray-700'}`}>
                  {cat.title}
                </span>
                
                {/* Plus/Minus Icon Button */}
                <div className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 group-hover:border-[#ff5252] group-hover:text-[#ff5252]">
                  {openCategory === index ? (
                    <FiMinus className="text-[14px]" />
                  ) : (
                    <FiPlus className="text-[14px]" />
                  )}
                </div>
              </div>

              {/* Sub-Items (Accordion Content) */}
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openCategory === index ? 'max-h-[500px] opacity-100 mt-1' : 'max-h-0 opacity-0'
                }`}
              >
                <ul className="pl-4 pr-2 space-y-1 pb-2">
                  {cat.subItems.map((sub, i) => (
                    <li 
                      key={i} 
                      className="text-[13px] text-gray-500 hover:text-[#ff5252] cursor-pointer flex items-center py-1.5 transition-colors"
                    >
                      <IoIosArrowForward className="mr-1 text-[10px]" />
                      {sub}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- PRICE RANGE --- */}
      <div className="p-4 border-t mt-4">
        <h3 className="text-[12px] font-bold uppercase text-gray-400 mb-6">Price</h3>
        <input type="range" className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#ff5252]" min="0" max="5000" />
        <div className="flex items-center justify-between mt-4">
          <div className="border p-1 px-3 text-[13px] rounded bg-white w-20 text-center">Min</div>
          <span className="text-gray-400 text-sm">to</span>
          <div className="border p-1 px-3 text-[13px] rounded bg-white w-24 font-bold text-center">₹5000+</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;