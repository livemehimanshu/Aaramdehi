import React, { useState, useEffect } from 'react';
import { IoCloseOutline, IoTrashOutline } from "react-icons/io5";
import { FiShoppingCart } from "react-icons/fi";
import { Link } from 'react-router-dom';
import { useCart } from '../../src/hooks/useCart';

// ===== WISHLIST DRAWER COMPONENT =====
const WishlistDrawer = ({ isOpen, onClose }) => {
  const { wishlist, removeFromWishlist, addToCart } = useCart();

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      />

      {/* Side Panel */}
      <div className={`fixed top-0 right-0 h-full w-full sm:max-w-[380px] bg-white z-[101] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 uppercase tracking-tight">My Wishlist ({wishlist.length})</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <IoCloseOutline size={28} className="text-gray-500" />
          </button>
        </div>

        {/* Wishlist Items List */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {wishlist.length > 0 ? (
            wishlist.map((item) => (
              <div key={item.id || item._id} className="flex gap-4 border-b border-gray-50 pb-4 mb-4">
                <div className="w-20 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  <img 
                    src={item.thumbnail || (item.images && item.images[0]?.url) || item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-[13px] font-semibold text-gray-700 leading-tight">{item.name}</h3>
                      <button
                        onClick={() => removeFromWishlist(item._id || item.id)}
                        className="text-gray-400 hover:text-red-500 transition"
                        title="Remove from wishlist"
                      >
                        <IoTrashOutline size={18} />
                      </button>
                    </div>
                    <p className="text-orange-600 font-bold mt-1">₹{(item.price || item.newPrice || 0).toLocaleString()}</p>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => {
                      addToCart(item);
                      removeFromWishlist(item.id || item._id);
                      alert(`${item.name} moved to cart!`);
                    }}
                    className="flex items-center justify-center gap-2 mt-2 bg-blue-50 text-blue-900 px-3 py-1.5 rounded text-[11px] font-bold hover:bg-blue-100 transition-colors"
                  >
                    <FiShoppingCart size={14} />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <p className="mt-2">Your wishlist is empty</p>
              <p className="text-[12px] text-gray-300 mt-1">Add items to save for later</p>
            </div>
          )}
        </div>

        {/* Bottom Section (Sticky) */}
        {wishlist.length > 0 && (
          <div className="p-5 bg-gray-50 border-t border-gray-100">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-gray-600 font-medium">
                <span>Total Items:</span>
                <span className="text-gray-900 font-bold">{wishlist.length}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Link 
                to="/products"
                onClick={onClose}
                className="w-full bg-blue-900 text-white py-3 rounded font-bold uppercase text-[12px] tracking-widest hover:bg-blue-800 shadow-lg shadow-blue-100 transition-all text-center"
              >
                Continue Shopping
              </Link>
              <button 
                onClick={onClose} 
                className="w-full text-gray-500 py-2 text-[11px] uppercase font-bold hover:text-gray-800 transition"
              >
                Keep Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default WishlistDrawer;
