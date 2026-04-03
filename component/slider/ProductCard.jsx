import React, { useState, useEffect, useCallback } from 'react';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import { IoHeart } from 'react-icons/io5';

const ProductCard = ({ product, onOpenModal }) => {
  const [isAdded, setIsAdded] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // --- 1. WISHLIST SYNC LOGIC ---
  const syncWishlist = useCallback(() => {
    if (!product) return;
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    // String comparison safe rehta hai hamesha
    const isPresent = wishlist.some(item => String(item.id) === String(product.id));
    setIsInWishlist(isPresent);
  }, [product]);

  useEffect(() => {
    syncWishlist();
    // Modal ya Header se change ho toh card update ho jaye
    window.addEventListener("wishlistUpdated", syncWishlist);
    return () => window.removeEventListener("wishlistUpdated", syncWishlist);
  }, [syncWishlist]);

  // --- 2. TOGGLE WISHLIST (Fix) ---
  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Yeh sabse zaruri hai taaki card ka modal na khul jaye

    try {
      let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      const isPresent = wishlist.some(item => String(item.id) === String(product.id));

      if (isPresent) {
        wishlist = wishlist.filter(item => String(item.id) !== String(product.id));
      } else {
        // Wahi keys use karein jo modal mein kar rahe hain
        wishlist.push({
          id: product.id,
          name: product.name,
          brand: product.brand || "Aaramdehi",
          price: product.price || product.newPrice || 0,
          image: product.image,
          rating: product.rating || 5
        });
      }

      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      
      // Sabko batao ki update ho gaya hai
      window.dispatchEvent(new Event("wishlistUpdated"));
      syncWishlist(); // Local update
    } catch (err) {
      console.error("Wishlist error in Card:", err);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const isExist = cart.find(item => String(item.id) === String(product.id));

    if (isExist) {
      cart = cart.map(item => String(item.id) === String(product.id) ? { ...item, qty: (item.qty || 1) + 1 } : item);
    } else {
      cart.push({ ...product, qty: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div 
      className="group bg-white rounded-sm p-4 relative transition-all duration-300 border border-transparent hover:border-gray-100 hover:shadow-xl h-full flex flex-col overflow-hidden cursor-pointer"
      onClick={() => onOpenModal && onOpenModal(product)} 
    >
      {/* WISHLIST BUTTON - Z-Index aur Event Handling yahan fix hai */}
      <button 
        type="button"
        onClick={handleToggleWishlist}
        className="absolute top-3 right-3 z-[100] p-2 rounded-full bg-white/90 shadow-md transition-all active:scale-75 hover:bg-gray-50 border border-gray-100"
      >
        {isInWishlist ? (
          <IoHeart size={20} className="text-red-500 scale-110" />
        ) : (
          <FiHeart size={20} className="text-gray-300 hover:text-red-500" />
        )}
      </button>

      <div className="relative aspect-square mb-4 flex items-center justify-center p-2 bg-gray-50/10 rounded">
        <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain transform group-hover:scale-105 transition-all duration-500" />
      </div>

      <div className="flex flex-col flex-grow text-left">
        <h4 className="text-[10px] text-gray-400 font-black uppercase mb-1 tracking-widest">{product.brand || "Aaramdehi"}</h4>
        <h3 className="text-[13px] text-gray-900 font-bold leading-tight mb-2 line-clamp-2 group-hover:text-blue-600">
          {product.name}
        </h3>
        <div className="mt-auto">
          <span className="text-[16px] font-black">₹{(product.price || product.newPrice || 0).toLocaleString()}</span>
        </div>
      </div>

      <div className="mt-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
        <button 
          onClick={handleAddToCart}
          className={`w-full py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${
            isAdded ? 'bg-green-600 text-white' : 'bg-blue-900 text-white hover:bg-black'
          }`}
        >
          <FiShoppingCart className="inline mr-2" />
          {isAdded ? 'Added' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;