import React, { useState, useEffect } from 'react';
import { IoCloseOutline, IoTrashOutline } from "react-icons/io5";
import { MdCompareArrows } from "react-icons/md";

/**
 * CompareDrawer Component
 * Mobile Friendly: Full width on small screens, 380px on desktop
 * Features: Auto-sync with localStorage, Touch optimization, Smooth transitions
 */
const CompareDrawer = ({ isOpen, onClose }) => {
  const [compareItems, setCompareItems] = useState([]);

  // useEffect: LocalStorage se data load karna aur event listener set karna
  useEffect(() => {
    const loadCompare = () => {
      const compare = JSON.parse(localStorage.getItem("compare")) || [];
      setCompareItems(compare);
    };

    loadCompare();

    // Custom event listener taaki jab product add ho, drawer update ho jaye
    window.addEventListener("compareUpdated", loadCompare);

    return () => {
      window.removeEventListener("compareUpdated", loadCompare);
    };
  }, [isOpen]);

  // Handler: Single item remove karna
  const removeFromCompare = (id) => {
    const updatedCompare = compareItems.filter(item => item.id !== id);
    setCompareItems(updatedCompare);
    localStorage.setItem("compare", JSON.stringify(updatedCompare));
    window.dispatchEvent(new Event("compareUpdated"));
  };

  // Handler: Puri list clear karna
  const clearCompare = () => {
    if (window.confirm("Are you sure you want to clear the comparison list?")) {
      setCompareItems([]);
      localStorage.setItem("compare", JSON.stringify([]));
      window.dispatchEvent(new Event("compareUpdated"));
    }
  };

  return (
    <>
      {/* 1. DARK OVERLAY (Mobile Friendly) */}
      <div 
        className={`fixed inset-0 bg-black/60 z-[1000] backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={onClose}
      />

      {/* 2. SIDE PANEL (Responsive Width) */}
      <div className={`fixed top-0 right-0 h-[100dvh] w-full sm:max-w-[380px] bg-white z-[1001] shadow-2xl transform transition-transform duration-500 ease-in-out flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        {/* HEADER SECTION */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100 shrink-0 bg-white">
          <div className="flex items-center gap-2">
             <div className="bg-blue-50 p-1.5 rounded-full">
                <MdCompareArrows className="text-blue-900" size={20} />
             </div>
             <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">
               Compare ({compareItems.length})
             </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-all active:scale-90"
            aria-label="Close Drawer"
          >
            <IoCloseOutline size={28} className="text-gray-400" />
          </button>
        </div>

        {/* MIDDLE CONTENT: SCROLLABLE LIST */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/30">
          {compareItems.length > 0 ? (
            <div className="space-y-3">
              {compareItems.map((item) => (
                <div 
                  key={item.id} 
                  className="flex gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm relative group animate-in slide-in-from-right-4 duration-300"
                >
                  {/* Product Image */}
                  <div className="w-20 h-24 bg-gray-50 rounded flex-shrink-0 border border-gray-100 flex items-center justify-center p-2">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="max-w-full max-h-full object-contain mix-blend-multiply" 
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1 min-w-0 pr-6 flex flex-col justify-center">
                    <span className="text-[9px] font-black text-blue-900 uppercase tracking-widest mb-1 opacity-60">
                      {item.brand}
                    </span>
                    <h3 className="text-[12px] font-bold text-gray-800 leading-snug line-clamp-2 mb-2 italic">
                      {item.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-red-500 font-black text-sm">
                        ₹{(item.price || item.newPrice || 0).toLocaleString()}
                      </p>
                      <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold">
                        ★ {item.rating}
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button 
                    onClick={() => removeFromCompare(item.id)} 
                    className="absolute right-2 top-2 p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <IoTrashOutline size={18} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* EMPTY STATE */
            <div className="h-full flex flex-col items-center justify-center text-center p-10">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                 <MdCompareArrows size={48} className="text-blue-200" />
              </div>
              <h3 className="text-lg font-black text-gray-800 uppercase tracking-tighter">Your list is empty</h3>
              <p className="text-[11px] text-gray-400 mt-2 leading-relaxed max-w-[220px] font-medium">
                Add at least two products to compare their features and prices.
              </p>
              <button 
                onClick={onClose}
                className="mt-8 bg-blue-900 text-white px-8 py-3 rounded-sm font-black uppercase text-[10px] tracking-[2px] shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
              >
                Explore Products
              </button>
            </div>
          )}
        </div>

        {/* BOTTOM SECTION: STICKY FOOTER */}
        {compareItems.length > 0 && (
          <div className="p-5 bg-white border-t border-gray-100 shadow-[0_-15px_30px_rgba(0,0,0,0.05)] shrink-0">
            <div className="flex justify-between items-center mb-5 px-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Selected Items</span>
                <span className="text-xl font-black text-blue-900">{compareItems.length}</span>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={clearCompare}
                className="flex-1 border-2 border-red-50 text-red-500 py-4 rounded-sm font-black uppercase text-[10px] tracking-[2px] hover:bg-red-50 active:bg-red-100 transition-all"
              >
                Clear All
              </button>
              <button 
                onClick={() => {
                  // Link to comparison page logic here
                  onClose();
                }}
                className="flex-[2] bg-blue-900 text-white py-4 rounded-sm font-black uppercase text-[10px] tracking-[2px] hover:bg-black active:scale-[0.98] transition-all shadow-xl shadow-blue-900/20"
              >
                Compare Now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CUSTOM CSS FOR SCROLLBAR & ANIMATION */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-in { animation: fadeInScale 0.3s ease-out forwards; }
        
        /* Fix for mobile browser address bar */
        @supports (-webkit-touch-callout: none) {
          .h-screen { height: -webkit-fill-available; }
        }
      `}</style>
    </>
  );
};

export default CompareDrawer;