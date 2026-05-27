import React, { useState, useEffect, useRef, useMemo } from 'react';
import "../search/style.css";
import Button from '@mui/material/Button';
import { FaSearch } from "react-icons/fa";
import { FiX } from "react-icons/fi"; // क्लोज बटन के लिए
import { IoTimeOutline } from "react-icons/io5"; // History icon
import { useNavigate } from 'react-router-dom';
import { Loader2, Search as SearchIcon } from 'lucide-react'; 
import { useProductSearch } from '../../src/utils/SearchEngine';

const Search = () => {
  const navigate = useNavigate();

  // 2. States
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [latency, setLatency] = useState("0ms");
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("searchHistory");
    return saved ? JSON.parse(saved) : [];
  });
  const searchRef = useRef(null);
  
  // ✅ Local session cache to prevent redundant API calls
  const localCache = useRef({});

  // AI Search Hook
  const searchEngine = useProductSearch();

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

  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      const trimmedQuery = query.trim().toLowerCase();
      if (trimmedQuery.length > 0) {
        // 1. Check Local Cache First
        if (localCache.current[trimmedQuery]) {
          setSuggestions(localCache.current[trimmedQuery].results);
          setLatency(localCache.current[trimmedQuery].latency);
          setShowDropdown(true);
          return;
        }

        setLoading(true);
        if (typeof searchEngine === 'function') {
          const resultData = await searchEngine(trimmedQuery);
          localCache.current[trimmedQuery] = resultData; // Save to cache
          setSuggestions(resultData.results);
          setLatency(resultData.latency);
        }
        setLoading(false);
        setShowDropdown(true);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 500); // 500ms ka wait (jab user likhna band karega)

    return () => clearTimeout(debounceTimer); // Purane timer ko saaf karo agar user ne phir se type kiya
  }, [query]);

  const handleSearch = (e) => {
    setQuery(e.target.value);
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
          onFocus={() => setShowDropdown(true)}
        />
        
        {/* क्लोज बटन: अगर कुछ टाइप किया है तो दिखेगा */}
        {query && (
            <FiX 
              className="mr-12 cursor-pointer text-gray-400 hover:text-red-500" 
              onClick={() => {setQuery(""); setShowDropdown(false);}} 
            />
        )}

        {loading && (
            <Loader2 className="animate-spin text-gray-400 mr-2" size={18} />
        )}

        <Button className='!absolute top-[8px] md:top-[4px] lg:top-[8px] right-[8px] md:right-[4px] lg:right-[8px] z-50 !w-[37px] md:!w-[32px] lg:!w-[37px] !min-w-[37px] md:!min-w-[32px] lg:!min-w-[37px] h-[37px] md:h-[32px] lg:h-[37px] !rounded-full !text-black'>
          <FaSearch className='text-[#4e4e4e] text-[25px] md:text-[18px] lg:text-[25px]' />
        </Button>
      </div>

      {/* --- Suggestion Dropdown --- */}
      {showDropdown && (
        <div className="absolute top-[110%] left-0 w-full bg-white rounded-[15px] shadow-2xl border border-gray-100 z-[999] overflow-hidden">
          
          {/* ✅ केस 1: अगर कुछ टाइप नहीं किया है, तो 'Recent Searches' दिखाएं */}
          {!query && history.length > 0 && (
            <div className="p-2">
              <div className="flex justify-between items-center px-3 py-2">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Recent</span>
                <button onClick={clearHistory} className="text-[10px] font-bold text-rose-500 hover:underline">Clear</button>
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

          {/* ✅ केस 2: सर्च रिजल्ट्स (सिर्फ तभी जब query टाइप की गई हो) */}
          {query && suggestions.length > 0 && (
            <>
          <div className="p-3 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b">
            Results for "{query}" <span className="float-right font-normal lowercase">{latency}</span>
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
                   // Backend key handle karein (id ya _id)
                   navigate(`/product/${item.id || item._id}`);
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
      {showDropdown && query && suggestions.length === 0 && !loading && (
          <div className="absolute top-[110%] left-0 w-full bg-white p-6 rounded-[15px] shadow-2xl text-center border border-gray-100 z-[999]">
              <p className="text-sm text-gray-400 italic">No items found matching "{query}"</p>
          </div>
      )}
    </div>
  );
}

export default Search;