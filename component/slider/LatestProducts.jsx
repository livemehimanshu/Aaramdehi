import React, { useState, useEffect, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { IoClose, IoStar, IoStarOutline, IoHeartOutline, IoHeart, IoSyncOutline } from "react-icons/io5";
import ProductCard from './ProductCard';
import { ALL_PRODUCTS_DATA } from '../../src/data/products';
import { addToRecentlyViewed } from '../../src/data/recentlyViewedUtils';

// Swiper Styles
import 'swiper/css';
import 'swiper/css/navigation';

// ===== LATEST PRODUCTS SECTION =====
// Home page par jo latest/newest products dikhte hain
// ProductCard component use karta hai aur quick modal bhi hai

const LatestProducts = () => {
  // --- STATES ---
  const [selectedProduct, setSelectedProduct] = useState(null); // Modal mein jo product show hona hai
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal open/close
  const [quantity, setQuantity] = useState(1); // Modal mein select quantity
  const [isInWishlist, setIsInWishlist] = useState(false); // Check if product in wishlist
  const [isInCompare, setIsInCompare] = useState(false); // Check if product in compare

  // Real products database se data aaya hai
  const products = ALL_PRODUCTS_DATA;

  // --- WISHLIST SYNC (Product ko wishlist mein check karna) ---
  const syncWishlistState = useCallback(() => {
    if (!selectedProduct) return;
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    const isPresent = wishlist.some(item => String(item.id) === String(selectedProduct.id));
    setIsInWishlist(isPresent);
  }, [selectedProduct]);

  // --- COMPARE SYNC (Product ko compare mein check karna) ---
  const syncCompareState = useCallback(() => {
    if (!selectedProduct) return;
    const compare = JSON.parse(localStorage.getItem("compare")) || [];
    const isPresent = compare.some(item => String(item.id) === String(selectedProduct.id));
    setIsInCompare(isPresent);
  }, [selectedProduct]);

  // useEffect: Modal khulne par wishlist aur compare status check karna
  useEffect(() => {
    if (isModalOpen) {
      syncWishlistState();
      syncCompareState();
    }
  }, [isModalOpen, syncWishlistState, syncCompareState]);

  // Event listeners for live updates
  useEffect(() => {
    window.addEventListener("wishlistUpdated", syncWishlistState);
    window.addEventListener("compareUpdated", syncCompareState);
    return () => {
      window.removeEventListener("wishlistUpdated", syncWishlistState);
      window.removeEventListener("compareUpdated", syncCompareState);
    };
  }, [syncWishlistState, syncCompareState]);

  // --- Modal Handler ---
  const handleOpenModal = (product) => {
    // Track recently viewed
    addToRecentlyViewed(product);
    setSelectedProduct(product);
    setQuantity(1);
    setIsModalOpen(true);
  };

  const handleIncrement = () => setQuantity(q => q + 1);
  const handleDecrement = () => quantity > 1 && setQuantity(q => q - 1);

  // Add to Cart Handler
  const handleAddToCart = () => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const productWithQty = { ...selectedProduct, qty: quantity };
    const isExist = cart.find(item => item.id === selectedProduct.id);

    if (isExist) {
      cart = cart.map(item => 
        item.id === selectedProduct.id ? { ...item, qty: item.qty + quantity } : item
      );
    } else {
      cart.push(productWithQty);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    alert(`${selectedProduct.name} added to cart!`);
    setIsModalOpen(false);
  };

  // --- WISHLIST TOGGLE HANDLER ---
  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      const isPresent = wishlist.some(item => String(item.id) === String(selectedProduct.id));

      if (isPresent) {
        wishlist = wishlist.filter(item => String(item.id) !== String(selectedProduct.id));
        console.log("❌ Removed from Wishlist:", selectedProduct.name);
      } else {
        wishlist.push({
          id: selectedProduct.id,
          name: selectedProduct.name,
          brand: selectedProduct.brand || "Aaramdehi",
          price: selectedProduct.price || selectedProduct.newPrice || 0,
          image: selectedProduct.image,
          rating: selectedProduct.rating || 5
        });
        console.log("❤️ Added to Wishlist:", selectedProduct.name);
      }

      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      window.dispatchEvent(new Event("wishlistUpdated"));
      syncWishlistState();
    } catch (error) {
      console.error("Wishlist error:", error);
    }
  };

  // --- COMPARE TOGGLE HANDLER ---
  const handleToggleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      let compare = JSON.parse(localStorage.getItem("compare")) || [];
      const isPresent = compare.some(item => String(item.id) === String(selectedProduct.id));

      // Maximum 3 products constraint
      if (!isPresent && compare.length >= 3) {
        alert("⚠️ Maximum 3 products allowed for comparison!");
        return;
      }

      if (isPresent) {
        compare = compare.filter(item => String(item.id) !== String(selectedProduct.id));
        console.log("⚖️ Removed from Compare:", selectedProduct.name);
      } else {
        compare.push({
          id: selectedProduct.id,
          name: selectedProduct.name,
          brand: selectedProduct.brand || "Aaramdehi",
          price: selectedProduct.price || selectedProduct.newPrice || 0,
          oldPrice: selectedProduct.oldPrice || 0,
          image: selectedProduct.image,
          rating: selectedProduct.rating || 5,
          category: selectedProduct.category || "Uncategorized"
        });
        console.log("⚖️ Added to Compare:", selectedProduct.name);
      }

      localStorage.setItem("compare", JSON.stringify(compare));
      window.dispatchEvent(new Event("compareUpdated"));
      syncCompareState();
    } catch (error) {
      console.error("Compare error:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 font-sans relative">
      
      {/* --- WATCH BANNER --- */}
      <div className="w-full bg-black rounded-xl overflow-hidden mb-10 flex items-center justify-between p-6 md:p-10 text-white relative">
        <div className="flex items-center gap-6">
          <img 
            src="https://images.unsplash.com/photo-1546868871-70c122467d8b?q=80&w=200" 
            alt="Smart Watch" 
            className="w-20 md:w-32 object-contain"
          />
          <div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter italic">WATCH</h2>
            <p className="text-[10px] md:text-sm text-gray-400 mt-2 max-w-[200px]">
              M6 Smart Band 2.3 - Fitness Band <br />
              Men's and Women's Health Tracking, Red Strap
            </p>
          </div>
        </div>
        
        <div className="hidden lg:flex gap-2">
            <img src="https://images.unsplash.com/photo-1508685096489-7aac29625a6b?q=80&w=100" className="w-16 h-16 rounded-full border border-gray-700 p-1" alt="watch" />
            <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=100" className="w-16 h-16 rounded-full border border-gray-700 p-1" alt="watch" />
        </div>
      </div>

      {/* --- HEADER WITH NAVIGATION --- */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Latest Products</h2>
        
        <div className="flex gap-2">
          <button className="latest-prev p-2 border rounded-full hover:bg-black hover:text-white transition-all">
            <FiChevronLeft size={20} />
          </button>
          <button className="latest-next p-2 border rounded-full hover:bg-black hover:text-white transition-all">
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* --- PRODUCT SWIPER --- */}
      <Swiper
        modules={[Navigation]}
        navigation={{
          nextEl: '.latest-next',
          prevEl: '.latest-prev',
        }}
        spaceBetween={20}
        slidesPerView={1}
        breakpoints={{
          480: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 5 },
        }}
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            {/* Click Wrapper to open Modal */}
            <div onClick={() => handleOpenModal(product)} className="cursor-pointer">
                <ProductCard product={product} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* --- QUICK VIEW MODAL SECTION --- */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-5xl rounded-sm shadow-2xl relative flex flex-col md:flex-row overflow-hidden max-h-[90vh] animate-in fade-in zoom-in duration-300">
            
            <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-2xl text-gray-400 hover:text-red-500 z-50 bg-gray-100 rounded-full p-1"><IoClose /></button>

            <div className="md:w-1/2 p-10 bg-[#f9f9f9] flex items-center justify-center border-r">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="max-h-[350px] object-contain transition-transform duration-500 hover:scale-110" />
            </div>

            <div className="md:w-1/2 p-10 overflow-y-auto">
              <h1 className="text-2xl font-black text-gray-900 leading-tight mb-2 uppercase tracking-tighter">{selectedProduct.name}</h1>
              
              <div className="flex items-center gap-4 mb-5 border-b pb-4 text-yellow-400">
                <div className="flex">
                    {[...Array(5)].map((_, i) => (i < Math.floor(selectedProduct.rating || 4) ? <IoStar key={i} /> : <IoStarOutline key={i} />))}
                </div>
                <span className="text-gray-400 text-[10px] font-black uppercase mt-1 tracking-widest">(Latest Release)</span>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-black text-red-500">₹{selectedProduct.price || selectedProduct.newPrice}</span>
                <span className="text-xl text-gray-200 line-through font-bold">₹{selectedProduct.oldPrice}</span>
              </div>

              <p className="text-sm text-gray-500 leading-relaxed mb-8">{selectedProduct.description || "Premium quality product from our latest collection."}</p>

              {/* Functional Quantity */}
              <div className="flex gap-4 mb-8">
                <div className="flex items-center border border-gray-200 h-14 bg-white">
                  <button onClick={handleDecrement} className="px-5 h-full hover:bg-gray-50 font-black border-r text-gray-400">－</button>
                  <span className="w-12 text-center font-black">{quantity}</span>
                  <button onClick={handleIncrement} className="px-5 h-full hover:bg-gray-50 font-black border-l text-gray-400">＋</button>
                </div>
                
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-red-500 text-white h-14 px-8 font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-xl shadow-red-500/20 active:translate-y-1">
                  Add to Cart
                </button>
              </div>

              <div className="flex gap-8 border-t pt-6">
                <button 
                  onClick={handleToggleWishlist}
                  className={`flex items-center gap-2 text-[10px] font-black uppercase transition-all tracking-widest ${
                    isInWishlist ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                  }`}
                >
                  {isInWishlist ? <IoHeart size={16}/> : <IoHeartOutline size={16}/>}
                  {isInWishlist ? 'Remove Wishlist' : 'Add Wishlist'}
                </button>
                <button 
                  onClick={handleToggleCompare}
                  className={`flex items-center gap-2 text-[10px] font-black uppercase transition-all tracking-widest ${
                    isInCompare ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'
                  }`}
                >
                  <IoSyncOutline size={16}/> 
                  {isInCompare ? 'Remove Compare' : 'Add Compare'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LatestProducts;