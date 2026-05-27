import React, { useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Slider from '@mui/material/Slider';
import { FiChevronDown, FiChevronLeft, FiStar } from 'react-icons/fi';

const Sidebar = ({ categories, selectedCategory, onCategoryChange, onPriceChange, onFilterChange }) => { 
  // Ab Sidebar saare props receive kar raha hai
  const [priceRange, setPriceRange] = useState([0, 10000]);

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
    // पैरेंट कंपोनेंट को मैक्सिमम प्राइस (index 1) भेजें
    if (onPriceChange) {
      onPriceChange(newValue[1]);
    }
  };

  const filterSections = [
    { id: "brand", title: "BRAND", options: ["Aaramdehi Premium", "Satin Luxe", "Cotton Soft", "Decor Master"] },
    { id: "material", title: "MATERIAL", options: ["Satin", "Cotton", "Memory Foam", "Velvet"] },
    { id: "discount", title: "DISCOUNT", options: ["10% or more", "20% or more", "50% or more"] },
  ];

  return (
    <div className="bg-white shadow-sm border rounded-sm w-full font-sans overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold text-gray-800">Filters</h2>
      </div>

      <div className="p-4 border-b">
        <h3 className="text-[12px] font-bold text-gray-500 uppercase mb-3">Categories</h3>
        <div className="space-y-2">
          {/* 1. All Products / Root Category Option */}
          <div 
            onClick={() => onCategoryChange('All')}
            className={`flex items-center text-sm cursor-pointer hover:text-blue-600 transition-colors ${selectedCategory === 'All' ? 'text-blue-600 font-bold' : 'text-gray-600'}`}
          >
            <FiChevronLeft className="mr-1" /> All Collections
          </div>

          {/* 2. Dynamic Categories from Database */}
          <div className="flex flex-col gap-2 mt-2">
            {categories && categories.length > 0 ? (
              categories.map((cat) => (
                <div 
                  key={cat._id}
                  onClick={() => onCategoryChange(cat.name)}
                  className={`text-sm ml-8 cursor-pointer hover:text-blue-600 transition-all ${selectedCategory === cat.name ? 'font-bold text-gray-900' : 'text-gray-500'}`}
                >
                  {cat.name}
                </div>
              ))
            ) : (
              <p className="text-[10px] ml-8 text-gray-400 italic">No categories found</p>
            )}
          </div>
        </div>
      </div>

      {/* Price Slider Section */}
      <div className="p-4 border-b">
        <h3 className="text-[12px] font-bold text-gray-500 uppercase mb-4">Price</h3>
        <div className="px-2">
          <Slider
            value={priceRange}
            onChange={handlePriceChange}
            valueLabelDisplay="auto"
            min={0}
            max={10000}
            sx={{ color: '#2874f0' }}
          />
          <div className="flex items-center justify-between gap-2 mt-2">
            <div className="border p-1 text-xs w-full text-center rounded-sm">Min</div>
            <span className="text-gray-400 text-xs">to</span>
            <div className="border p-1 text-xs w-full text-center font-bold rounded-sm">₹{priceRange[1]}+</div>
          </div>
        </div>
      </div>

      {/* Ratings Filter */}
      <div className="p-4 border-b">
        <h3 className="text-[12px] font-bold text-gray-500 uppercase mb-3">Customer Ratings</h3>
        <div className="space-y-2">
          {[4, 3, 2].map((star) => (
            <label key={star} className="flex items-center gap-2 cursor-pointer group">
              <Checkbox 
                size="small" 
                onChange={(e) => onFilterChange('rating', star, e.target.checked)}
                sx={{ p: 0, '&.Mui-checked': { color: '#2874f0' } }} 
              />
              <span className="text-sm text-gray-700 flex items-center gap-1">
                {star} <FiStar className="fill-amber-400 text-amber-400" size={14} /> & Above
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Availability Toggle */}
      <div className="p-4 border-b bg-gray-50/50">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-[12px] font-bold text-gray-800 uppercase tracking-tighter">Exclude Out of Stock</span>
          <input 
            type="checkbox" 
            className="w-4 h-4 accent-blue-600" 
            onChange={(e) => onFilterChange('availability', null, e.target.checked)}
          />
        </label>
      </div>
    
      {filterSections.map((section, index) => (
        <Accordion key={index} disableGutters elevation={0} square className="border-b before:hidden">
          <AccordionSummary expandIcon={<FiChevronDown className="text-gray-400" />}>
            <span className="text-[12px] font-bold text-gray-800 uppercase">{section.title}</span>
          </AccordionSummary>
          <AccordionDetails className="pt-0">
            {section.options.map((option, i) => (
              <FormControlLabel
                key={i}
                className="w-full"
                control={<Checkbox size="small" sx={{ '&.Mui-checked': { color: '#2874f0' } }} 
                onChange={(e) => onFilterChange(section.id, option, e.target.checked)} />}
                label={<span className="text-sm text-gray-700">{option}</span>}
              />
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
};

export default Sidebar;