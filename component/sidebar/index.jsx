import React, { useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Slider from '@mui/material/Slider';
import { FiChevronDown, FiChevronLeft } from 'react-icons/fi';

const Sidebar = ({ onPriceChange }) => { // onPriceChange प्रॉप जोड़ा गया है
  const [priceRange, setPriceRange] = useState([0, 10000]);

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
    // पैरेंट कंपोनेंट को मैक्सिमम प्राइस (index 1) भेजें
    if (onPriceChange) {
      onPriceChange(newValue[1]);
    }
  };

  const filterSections = [
    { title: "COLOR", options: ["White", "Blue", "Red", "Beige"] },
    { title: "FILLING MATERIAL", options: ["Fiber", "Cotton", "Memory Foam"] },
    { title: "PACK OF", options: ["Pack of 1", "Pack of 2", "Pack of 4"] },
    { title: "EXTERNAL MATERIAL", options: ["Cotton", "Satin", "Velvet"] },
    { title: "PATTERN", options: ["Solid", "Printed", "Striped"] },
    { title: "DISCOUNT", options: ["10% or more", "20% or more", "50% or more"] },
  ];

  return (
    <div className="bg-white shadow-sm border rounded-sm w-full font-sans overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold text-gray-800">Filters</h2>
      </div>

      <div className="p-4 border-b">
        <h3 className="text-[12px] font-bold text-gray-500 uppercase mb-3">Categories</h3>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600 cursor-pointer hover:text-blue-600">
            <FiChevronLeft className="mr-1" /> Home Furnishings
          </div>
          <div className="text-sm font-bold text-gray-900 ml-8">Pillows</div>
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
                control={<Checkbox size="small" sx={{ '&.Mui-checked': { color: '#2874f0' } }} />}
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