import React, { useState } from 'react';
import { Rating } from '@mui/material';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';

// ===== PRODUCT CARD COMPONENT =====
// Yeh ek single product card hai jo Popular/Latest Products mein dikhta hai
// Ismein add to cart button aur wishlist button hote hain

const ProductCard = ({ product }) => {
  // State: Jab user "Add to Cart" dabe toh "Added" show hone ke liye
  const [isAdded, setIsAdded] = useState(false);

  // Function: Product ko cart mein add karna
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // localStorage se existing cart data lao
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    // Check karo kya yeh product pehle se cart mein hai?
    const isExist = cart.find(item => item.id === product.id);

    if (isExist) {
      // Agar hai toh quantity increase karo
      cart = cart.map(item => 
        item.id === product.id ? { ...item, qty: item.qty + 1 } : item
      );
    } else {
      // Agar nahi hai toh naya product add karo qty=1 ke saath
      cart.push({ ...product, qty: 1 });
    }

    // localStorage mein updated cart save karo
    localStorage.setItem("cart", JSON.stringify(cart));
    // Event trigger karo Header ko notify karne ke liye (badge update hone ke liye)
    window.dispatchEvent(new Event("cartUpdated"));
    
    // Green "Added" state dikhao 1.5 seconds ke liye
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className="group bg-white rounded-sm p-4 relative transition-all duration-300 cursor-pointer hover:shadow-[0_2px_12px_0_rgba(0,0,0,0.16)] border border-transparent hover:border-gray-100 h-full flex flex-col">
      
      {/* Wishlist Icon */}
      <button className="absolute top-3 right-3 z-10 text-gray-300 hover:text-red-500 transition-colors">
        <FiHeart size={18} />
      </button>

      {/* Image Section */}
      <div className="relative overflow-hidden aspect-[3/4] mb-4 flex items-center justify-center">
        <img 
          src={product.image} 
          alt={product.name} 
          className="max-w-full max-h-full object-contain transform transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-grow">
        {/* Brand Name - Flipkart uses Gray & Small */}
        <h4 className="text-[12px] text-gray-400 font-medium uppercase mb-1 tracking-tight">
          {product.brand}
        </h4>
        
        {/* Product Title - Flipkart uses dark gray & normal weight */}
        <h3 className="text-[14px] text-[#212121] leading-tight mb-2 group-hover:text-[#2874f0] line-clamp-2 min-h-[35px]">
          {product.name}
        </h3>
        
        {/* Rating Section */}
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-[#388e3c] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
            {product.rating} <span className="text-[10px]">★</span>
          </div>
          <span className="text-gray-400 text-[12px] font-medium">(1,234)</span>
        </div>

        {/* Pricing Section - The most important part for UI */}
        <div className="flex items-center gap-2 mt-auto">
          <span className="text-[16px] font-bold text-[#212121]">
            ₹{product.newPrice}
          </span>
          <span className="text-[13px] text-gray-400 line-through">
            ₹{product.oldPrice}
          </span>
          <span className="text-[13px] font-bold text-[#388e3c]">
            60% off
          </span>
        </div>
      </div>

      {/* Size/Variants - Optional but looks good on hover */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-4 flex gap-2">
        <button 
          onClick={handleAddToCart}
          className={`flex-1 py-2 px-3 rounded-sm text-[12px] font-bold uppercase tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
            isAdded 
              ? 'bg-green-500 text-white' 
              : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
          }`}
        >
          <FiShoppingCart size={14} />
          {isAdded ? 'Added ✓' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;