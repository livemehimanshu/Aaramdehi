import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../Sidebar'; 
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { AiFillStar, AiOutlineHeart, AiFillHeart, AiOutlineEye } from 'react-icons/ai';
import { FiShoppingCart } from 'react-icons/fi'; 
import { BsLightningCharge } from 'react-icons/bs'; 
import { ALL_PRODUCTS_DATA } from '../../../src/data/products';
import { addToRecentlyViewed } from '../../../src/data/recentlyViewedUtils';

// ===== PRODUCT LISTING PAGE =====
// Yeh page sare products ko grid format mein show karta hai
// Ismein filtering, sorting, pagination, wishlist, cart sab features hain

const ProductListing = () => {
  // --- STATE MANAGEMENT ---
  const [maxPrice, setMaxPrice] = useState(10000); // Max price filter
  const [sortBy, setSortBy] = useState('relevance'); // Sorting option
  const [page, setPage] = useState(1); // Current page number
  const [wishlist, setWishlist] = useState([]); // Wishlist mein jo items hain localStorage se load honge

  // --- LOAD WISHLIST FROM LOCALSTORAGE ON MOUNT ---
  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(savedWishlist);

    // Event listener: jab dusre component se wishlist update ho toh yahan bhi update ho
    const handleWishlistUpdate = () => {
      const updatedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      setWishlist(updatedWishlist);
    };

    window.addEventListener("wishlistUpdated", handleWishlistUpdate);
    return () => window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
  }, []);

  // Function: Product ko dekhne par recently viewed mein add karna
  const handleProductView = (product) => {
    addToRecentlyViewed(product);
  };

  // Function: Product ko cart mein add karna
  const handleAddToCart = (product) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const isExist = cart.find(item => item.id === product.id);

    if (isExist) {
      cart = cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
    } else {
      cart.push({ ...product, qty: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    alert(`${product.name} added to Aaramdehi cart!`);
  };

  // Function: Wishlist mein item add/remove karna localStorage se
  const toggleWishlist = (e, product) => {
    e.preventDefault(); 
    e.stopPropagation();

    // localStorage se wishlist nikalo
    let wishlistData = JSON.parse(localStorage.getItem("wishlist")) || [];
    
    // Check karo ke product already wishlist mein hai ya nahi
    const isInWishlist = wishlistData.some(item => item.id === product.id);

    if (isInWishlist) {
      // Agar already hai toh remove karo
      wishlistData = wishlistData.filter(item => item.id !== product.id);
    } else {
      // Agar nahi hai toh add karo pura product
      wishlistData.push(product);
    }

    // localStorage mein save karo
    localStorage.setItem("wishlist", JSON.stringify(wishlistData));
    
    // Update state aur event bhejo dusre components ko
    setWishlist(wishlistData);
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  // useMemo: Calculate jo products dikhane hain based on filter, sort, pagination
  const currentItems = useMemo(() => {
    // Pehle price filter apply karo
    let data = ALL_PRODUCTS_DATA.filter(product => product.price <= maxPrice);
    // Phir sorting apply karo
    if (sortBy === 'lowToHigh') data = [...data].sort((a, b) => a.price - b.price);
    if (sortBy === 'highToLow') data = [...data].sort((a, b) => b.price - a.price);
    // Phir pagination apply karo (8 products per page)
    const startIndex = (page - 1) * 8;
    return data.slice(startIndex, startIndex + 8);
  }, [maxPrice, sortBy, page]);

  return (
    <div className="flex bg-[#f4f7f9] min-h-screen p-4 lg:p-8 gap-8 mt-20">
      <aside className="hidden lg:block w-[280px] sticky top-24 h-fit">
         <Sidebar onPriceChange={(val) => setMaxPrice(val)} />
      </aside>

      <main className="flex-1 space-y-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm flex justify-between items-center border border-gray-100">
          <h2 className="font-black text-blue-900 text-xl tracking-tight uppercase">Premium Collection</h2>
          <select 
            onChange={(e) => {setSortBy(e.target.value); setPage(1);}}
            className="text-xs font-black bg-gray-50 border-none outline-none py-2 px-4 rounded-xl text-gray-600 cursor-pointer"
          >
            <option value="relevance">Popularity</option>
            <option value="lowToHigh">Price: Low to High</option>
            <option value="highToLow">Price: High to Low</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {currentItems.map((item) => (
            <div key={item.id} className="group bg-white rounded-[30px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-blue-100 flex flex-col h-full relative">
              <div className="h-64 bg-[#f8f9fb] p-6 relative flex items-center justify-center overflow-hidden">
                <Link 
                  to={`/product/${item.id}`} 
                  onClick={() => handleProductView(item)}
                  className="w-full h-full flex items-center justify-center">
                  <img src={item.image} className="max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700" alt={item.name}/>
                </Link>
                
                <button onClick={(e) => toggleWishlist(e, item)} className="absolute top-5 right-5 z-20">
                  {wishlist.some(w => w.id === item.id) ? <AiFillHeart className="text-red-500 text-2xl" /> : <AiOutlineHeart className="text-gray-300 text-2xl hover:text-red-400" />}
                </button>

                <div className="absolute bottom-[-60px] group-hover:bottom-4 left-0 right-0 flex justify-center gap-2 transition-all duration-500">
                  <button className="bg-white p-3 rounded-full shadow-xl text-blue-900 hover:bg-blue-900 hover:text-white transition-all transform active:scale-90">
                    <AiOutlineEye size={20} />
                  </button>
                  {/* YAHAN CLICK EVENT ADD KIYA HAI */}
                  <button 
                    onClick={() => handleAddToCart(item)}
                    className="bg-white p-3 rounded-full shadow-xl text-blue-900 hover:bg-blue-900 hover:text-white transition-all transform active:scale-90"
                  >
                    <FiShoppingCart size={18} />
                  </button>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <p className="text-[9px] text-blue-900 font-black uppercase tracking-[2px] mb-2">Aaramdehi Luxe</p>
                <Link 
                  to={`/product/${item.id}`}
                  onClick={() => handleProductView(item)}>
                  <h3 className="text-sm font-bold text-gray-800 line-clamp-2 h-10 group-hover:text-blue-900 transition-colors leading-tight">
                    {item.name}
                  </h3>
                </Link>
                
                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-2xl font-black text-gray-900 tracking-tighter">₹{item.price.toLocaleString()}</span>
                    <span className="text-[11px] text-gray-400 line-through font-bold">₹{item.oldPrice.toLocaleString()}</span>
                  </div>
                  <div className="bg-blue-50 text-blue-900 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all transform group-hover:rotate-12">
                    <BsLightningCharge size={20} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center py-10 border-b border-gray-100">
          <Pagination 
            count={Math.ceil(ALL_PRODUCTS_DATA.length / 8)} 
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </div>
      </main>
    </div>
  );
};

export default ProductListing;