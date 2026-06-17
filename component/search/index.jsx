import React, { useState, useEffect, useRef } from 'react';
import "../search/style.css";
import Button from '@mui/material/Button';
import { FaSearch } from "react-icons/fa";
import { FiX } from "react-icons/fi"; // क्लोज बटन के लिए
import { IoTimeOutline } from "react-icons/io5"; // History icon
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react'; 
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
    if (!term.trim()) return;
    const newHistory = [term.trim(), ...history.filter(h => h !== term.trim())].slice(0, 5);
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
      
      // ✅ FIX: Agar query bohot chhoti hai (jaise "xs"), toh length >= 1 check rakhein taaki API hit ho
      if (trimmedQuery.length > 0) {
        // 1. Check Local Cache First
        if (localCache.current[trimmedQuery]) {
          setSuggestions(localCache.current[trimmedQuery].results || []);
          setLatency(localCache.current[trimmedQuery].latency || "0ms");
          setShowDropdown(true);
          return;
        }

        setLoading(true);
        try {
          if (typeof searchEngine === 'function') {
            const resultData = await searchEngine(trimmedQuery);
            
            console.log(`🔍 Search results for "${trimmedQuery}":`, resultData);
            console.log(`📊 Results count: ${resultData?.results?.length || 0}`);

            // ✅ ROBUST FIX: Handle all possible data formats
            let finalResults = [];
            
            if (resultData && Array.isArray(resultData.results)) {
              finalResults = resultData.results;
              console.log(`✓ Using resultData.results format`);
            } else if (resultData && Array.isArray(resultData.data)) {
              finalResults = resultData.data;
              console.log(`✓ Using resultData.data format`);
            } else if (Array.isArray(resultData)) {
              finalResults = resultData;
              console.log(`✓ Using direct array format`);
            } else if (resultData?.data?.data && Array.isArray(resultData.data.data)) {
              finalResults = resultData.data.data;
              console.log(`✓ Using nested resultData.data.data format`);
            }

            console.log(`📋 Final extracted results (${finalResults.length} items):`, finalResults);

            // ✅ Format mapping for safety, including category, sellingPrice, thumbnail
            const resultsArray = Array.isArray(finalResults) ? finalResults : [];
            const formattedResults = resultsArray.map(item => ({
              ...item,
              id: item.id || item._id || item.productId,
              title: item.title || item.name || item.productName || "Unnamed Product",
              category: item.category || item.subCategory || "",
              sellingPrice: item.sellingPrice || item.price || 0,
              thumbnail: item.thumbnail || item.image || ""
            }));

            const structuredData = {
              results: formattedResults,
              latency: resultData?.latency || "0ms"
            };

            console.log(`✅ Formatted ${formattedResults.length} results for UI:`, formattedResults);
            localCache.current[trimmedQuery] = structuredData; // Save to cache
            setSuggestions(structuredData.results);
            setLatency(structuredData.latency);
          }
        } catch (err) {
          console.error("Instant Search Error:", err);
        } finally {
          setLoading(false);
          setShowDropdown(true);
        }
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 300); // Keep 300ms debounce for faster results

    return () => clearTimeout(debounceTimer); // Purane timer ko saaf karo agar user ne phir se type kiya
  }, [query]);

  // ✅ NEW: Jab user pure query likh kar Enter maare ya search icon click kare
  const triggerSearchPage = (searchFormQuery) => {
    const finalQuery = searchFormQuery || query;
    if (finalQuery.trim()) {
      saveToHistory(finalQuery.trim());
      setShowDropdown(false);
      navigate(`/products?search=${encodeURIComponent(finalQuery.trim())}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    triggerSearchPage();
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      {/* --- Search Box (आपका ओरिजिनल स्टाइल) --- */}
      <form onSubmit={handleSubmit} className="search-Box w-full h-[50px] md:h-[40px] lg:h-[50px] bg-[#e5e5e5] rounded-[15px] relative p-2 flex items-center">
        <input 
          type="text" 
          placeholder='Search the product....' 
          className='w-[75%] h-[35px] md:h-[28px] lg:h-[35px] focus:outline-none bg-inherit px-2 text-[15px] md:text-[13px] lg:text-[15px] text-black'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
        />
        
        <div className="absolute right-[55px] md:right-[45px] lg:right-[55px] flex items-center gap-2">
          {query && (
              <FiX 
                className="cursor-pointer text-gray-500 hover:text-red-500 text-lg" 
                onClick={() => { setQuery(""); setSuggestions([]); setShowDropdown(false); }} 
              />
          )}

          {loading && (
              <Loader2 className="animate-spin text-gray-500" size={18} />
          )}
        </div>

        <Button 
          type="submit"
          onClick={() => triggerSearchPage()}
          className='!absolute top-[6px] md:top-[4px] lg:top-[6px] right-[8px] md:right-[4px] lg:right-[8px] z-50 !w-[37px] md:!w-[32px] lg:!w-[37px] !min-w-[37px] md:!min-w-[32px] lg:!min-w-[37px] h-[37px] md:h-[32px] lg:h-[37px] !rounded-full !text-black'
        >
          <FaSearch className='text-[#4e4e4e] text-[20px] md:text-[16px] lg:text-[20px]' />
        </Button>
      </form>

      {/* --- Suggestion Dropdown --- */}
      {showDropdown && (
        <div className="absolute top-[110%] left-0 w-full bg-white rounded-[15px] shadow-2xl border border-gray-100 z-[999] overflow-hidden">
          
          {/* ✅ केस 1: अगर कुछ टाइप नहीं किया है, तो 'Recent Searches' दिखाएं */}
          {!query && history.length > 0 && (
            <div className="p-2">
              <div className="flex justify-between items-center px-3 py-2">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Recent</span>
                <button type="button" onClick={clearHistory} className="text-[10px] font-bold text-rose-500 hover:underline">Clear</button>
              </div>
              {history.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer rounded-lg group"
                  onClick={() => {
                    setQuery(item);
                    triggerSearchPage(item);
                  }}
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
                key={item.id || item._id}
                className="flex items-center gap-4 p-3 hover:bg-blue-50 cursor-pointer transition-all border-b border-gray-50 last:border-0 group"
                onClick={() => {
                   saveToHistory(item.title);
                   setQuery("");
                   setShowDropdown(false);
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
                  <p className="text-sm font-bold text-gray-800 group-hover:text-blue-900">{item.title || item.name || "Unnamed Product"}</p>
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