import React, { useState, useEffect, useRef, useMemo } from 'react';
import "../search/style.css";
import Button from '@mui/material/Button';
import { FaSearch } from "react-icons/fa";
import { FiX } from "react-icons/fi"; // क्लोज बटन के लिए
import { IoTimeOutline } from "react-icons/io5"; // History icon
import { Loader2 } from 'lucide-react'; // ✅ Fix: Import missing Loader icon
import { useProductSearch } from '../../Aaramdehi/src/utils/SearchEngine';
import { useNavigate } from 'react-router-dom';

const Search = () => {
  const navigate = useNavigate();
  // 2. States
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("searchHistory");
    return saved ? JSON.parse(saved) : [];
  });
  const [latency, setLatency] = useState("0ms");
  const searchRef = useRef(null);

  // 1. Products Data
  const products = useMemo(() => [
    { id: 1, title: "Luxury Microfiber Pillow", category: "Pillow", sellingPrice: "949", thumbnail: "https://rukminim2.flixcart.com/image/1086/1086/xif0q/pillow/t/v/v/17-white-soft-microfiber-pillow-pack-of-2-17-27-2-p-2-m-p-2-original-imahfzhgzff9ay8h.jpeg?q=90", is_essential: true },
    { id: 2, title: "Premium White Bolster", category: "Bolster", sellingPrice: "599", thumbnail: "https://rukminim2.flixcart.com/image/1086/1086/k7f26kw0/bolster/v/j/z/plain-bolster-white-1-bolster-white-satin-plain-white-fiber-original-imafpnzdqghvggym.jpeg?q=70", is_essential: false },
    { id: 3, title: "Soft Decorative Cushion", category: "Cushion", sellingPrice: "349", thumbnail: "https://rukminim2.flixcart.com/image/1086/1086/xif0q/cushion/v/f/e/12-12-dori-cushion-with-filler-1-12-cushion-with-filler-original-imahyyzqfgy6gyh7.jpeg?q=90", is_essential: false }
  ], []);

  // 2. Initialize Search Engine Hook
  const searchEngine = useProductSearch(products);

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

  const saveToHistory = (term) => {
    const newHistory = [term, ...history.filter(h => h !== term)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("searchHistory");
  };

  // 4. सर्च हैंडलर
  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim().length > 0 && typeof searchEngine === 'function') {
      const { results, latency: searchLatency } = searchEngine(value);
      setSuggestions(results);
      setShowDropdown(true);
      setLatency(searchLatency);
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
          onFocus={() => query.length > 0 && setShowDropdown(true)}
        />
        
        {/* क्लोज बटन: अगर कुछ टाइप किया है तो दिखेगा */}
        {query && (
            <FiX 
              className="mr-12 cursor-pointer text-gray-400 hover:text-red-500" 
              onClick={() => {setQuery(""); setShowDropdown(false);}} 
            />
        )}

        {loading && (
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
        )}

        <Button className='!absolute top-[8px] md:top-[4px] lg:top-[8px] right-[8px] md:right-[4px] lg:right-[8px] z-50 !w-[37px] md:!w-[32px] lg:!w-[37px] !min-w-[37px] md:!min-w-[32px] lg:!min-w-[37px] h-[37px] md:h-[32px] lg:h-[37px] !rounded-full !text-black'>
          <FaSearch className='text-[#4e4e4e] text-[25px] md:text-[18px] lg:text-[25px]' />
        </Button>
      </div>

      {/* --- Suggestion Dropdown --- */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-[110%] left-0 w-full bg-white rounded-[15px] shadow-2xl border border-gray-100 z-[999] overflow-hidden">
          
          {/* Recent Searches Logic */}
          {!query && history.length > 0 && (
            <div className="p-2">
              <div className="flex justify-between items-center px-3 py-2">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Recent Searches</span>
                <button onClick={clearHistory} className="text-[10px] font-bold text-red-500 hover:underline">Clear All</button>
              </div>
              {history.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer rounded-lg group"
                  onClick={() => setQuery(item)}
                >
                  <IoTimeOutline className="text-gray-400 group-hover:text-blue-600" />
                  <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600">{item}</span>
                </div>
              ))}
            </div>
          )}

          {query && suggestions.length > 0 && (
            <>
          <div className="p-3 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b">
            Search Results for "{query}" <span className="float-right font-normal lowercase">{latency}</span>
          </div>
          
          <div className="max-h-[350px] overflow-y-auto">
            {suggestions.map((item) => (
              <div 
                key={item.id}
                className="flex items-center gap-4 p-3 hover:bg-blue-50 cursor-pointer transition-all border-b border-gray-50 last:border-0 group"
                onClick={() => {
                   saveToHistory(item.title);
                   setQuery(""); 
                   setShowDropdown(false);
                   navigate(`/product/${item.id}`);
                }}
              >
                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  <img 
                    src={item.thumbnail || "https://placehold.co/100x100?text=No+Image"} 
                    onError={(e) => { e.target.src = "https://placehold.co/100x100?text=Not+Found"; }}
                    className="w-full h-full object-cover mix-blend-multiply" 
                    alt={item.title} 
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800 group-hover:text-blue-900">{item.title}</p>
                  <p className="text-[11px] text-gray-400">{item.category} • <span className="text-blue-900 font-bold">₹{item.sellingPrice}</span></p>
                </div>
                <FaSearch className="text-gray-200 group-hover:text-blue-900" size={14} />
              </div>
            ))}
          </div>
          </>
          )}
        </div>
      )}

      {/* No Results found */}
      {showDropdown && query && suggestions.length === 0 && (
          <div className="absolute top-[110%] left-0 w-full bg-white p-6 rounded-[15px] shadow-2xl text-center border border-gray-100 z-[999]">
              <p className="text-sm text-gray-400 italic">No items found matching "{query}"</p>
          </div>
      )}
    </div>
  );
}

export default Search;