import React, { useState, useEffect, useRef } from 'react';
import "../search/style.css";
import Button from '@mui/material/Button';
import { FaSearch } from "react-icons/fa";
import { FiX } from "react-icons/fi"; // क्लोज बटन के लिए

const Search = () => {
  // 1. डेमो डेटा (इसे आप बाद में अपनी API से बदल सकते हैं)
  const products = [
    { id: 1, name: "Luxury Microfiber Pillow", category: "Pillow", price: "949", image: "https://rukminim2.flixcart.com/image/1086/1086/xif0q/pillow/t/v/v/17-white-soft-microfiber-pillow-pack-of-2-17-27-2-p-2-m-p-2-original-imahfzhgzff9ay8h.jpeg?q=90" },
    { id: 2, name: "Premium White Bolster", category: "Bolster", price: "599", image: "https://rukminim2.flixcart.com/image/1086/1086/k7f26kw0/bolster/v/j/z/plain-bolster-white-1-bolster-white-satin-plain-white-fiber-original-imafpnzdqghvggym.jpeg?q=70" },
    { id: 3, name: "Soft Decorative Cushion", category: "Cushion", price: "349", image: "https://rukminim2.flixcart.com/image/1086/1086/xif0q/cushion/v/f/e/12-12-dori-cushion-with-filler-1-12-cushion-with-filler-original-imahyyzqfgy6gyh7.jpeg?q=90" }
  ];

  // 2. States
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  // 3. बाहर क्लिक करने पर ड्रॉपडाउन बंद करने का लॉजिक
  useEffect(() => {
    const closeSearch = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", closeSearch);
    return () => document.removeEventListener("mousedown", closeSearch);
  }, []);

  // 4. सर्च हैंडलर
  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length > 1) {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(value.toLowerCase()) || 
        p.category.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* --- Search Box (आपका ओरिजिनल स्टाइल) --- */}
      <div className="search-Box w-full md:w-[400px] lg:w-[500px] h-[50px] md:h-[40px] lg:h-[50px] bg-[#e5e5e5] rounded-[15px] relative p-2 flex items-center">
        <input 
          type="text" 
          placeholder='Search the product....' 
          className='w-[85%] h-[35px] md:h-[28px] lg:h-[35px] focus:outline-none bg-inherit px-2 text-[15px] md:text-[13px] lg:text-[15px]'
          value={query}
          onChange={handleSearch}
          onFocus={() => query.length > 1 && setShowDropdown(true)}
        />
        
        {/* क्लोज बटन: अगर कुछ टाइप किया है तो दिखेगा */}
        {query && (
            <FiX 
              className="mr-12 cursor-pointer text-gray-400 hover:text-red-500" 
              onClick={() => {setQuery(""); setShowDropdown(false);}} 
            />
        )}

        <Button className='!absolute top-[8px] md:top-[4px] lg:top-[8px] right-[8px] md:right-[4px] lg:right-[8px] z-50 !w-[37px] md:!w-[32px] lg:!w-[37px] !min-w-[37px] md:!min-w-[32px] lg:!min-w-[37px] h-[37px] md:h-[32px] lg:h-[37px] !rounded-full !text-black'>
          <FaSearch className='text-[#4e4e4e] text-[25px] md:text-[18px] lg:text-[25px]' />
        </Button>
      </div>

      {/* --- Suggestion Dropdown --- */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-[110%] left-0 w-full bg-white rounded-[15px] shadow-2xl border border-gray-100 z-[999] overflow-hidden">
          <div className="p-3 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b">
            Search Results for "{query}"
          </div>
          
          <div className="max-h-[350px] overflow-y-auto">
            {suggestions.map((item) => (
              <div 
                key={item.id}
                className="flex items-center gap-4 p-3 hover:bg-blue-50 cursor-pointer transition-all border-b border-gray-50 last:border-0 group"
                onClick={() => {
                   setQuery(""); 
                   setShowDropdown(false);
                   // यहाँ आप navigate(`/product/${item.id}`) कर सकते हैं
                }}
              >
                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  <img src={item.image} className="w-full h-full object-cover mix-blend-multiply" alt={item.name} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800 group-hover:text-blue-900">{item.name}</p>
                  <p className="text-[11px] text-gray-400">{item.category} • <span className="text-blue-900 font-bold">₹{item.price}</span></p>
                </div>
                <FaSearch className="text-gray-200 group-hover:text-blue-900" size={14} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results found */}
      {showDropdown && suggestions.length === 0 && (
          <div className="absolute top-[110%] left-0 w-full bg-white p-6 rounded-[15px] shadow-2xl text-center border border-gray-100 z-[999]">
              <p className="text-sm text-gray-400 italic">No items found matching "{query}"</p>
          </div>
      )}
    </div>
  );
}

export default Search;