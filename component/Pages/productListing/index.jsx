import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../Sidebar'; 
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { AiFillStar, AiOutlineHeart, AiFillHeart, AiOutlineEye } from 'react-icons/ai';
import { FiShoppingCart } from 'react-icons/fi'; 
import { BsLightningCharge } from 'react-icons/bs'; 


const ALL_PRODUCTS_DATA = [
  // --- PILLOWS (1-15) ---
  { id: 1, name: "White Soft Microfiber Pillow (Pack of 2)", price: 949, oldPrice: 1599, rating: 4.2, reviews: "2,450", stock: 5, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/pillow/t/v/v/17-white-soft-microfiber-pillow-pack-of-2-17-27-2-p-2-m-p-2-original-imahfzhgzff9ay8h.jpeg" },
  { id: 2, name: "Satin Plain White Fiber Bolster (Single)", price: 849, oldPrice: 1599, rating: 4.5, reviews: "1,120", stock: 2, image: "https://rukminim2.flixcart.com/image/612/612/k7f26kw0/bolster/v/j/z/plain-bolster-white-1-bolster-white-satin-plain-white-fiber-original-imafpnzdqghvggym.jpeg" },
  { id: 3, name: "Memory Foam Orthopedic Pillow", price: 1299, oldPrice: 2499, rating: 4.8, reviews: "850", stock: 12, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/pillow/l/u/x/16-orthopaedic-memory-foam-pillow-for-neck-pain-relief-sleeping-original-imahfzhggh.jpeg" },
  { id: 4, name: "Luxury Hotel Collection King Pillow", price: 1100, oldPrice: 1999, rating: 4.7, reviews: "640", stock: 8, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/pillow/h/k/p/17-luxury-hotel-king-size-original-imahfzhg67.jpeg" },
  { id: 5, name: "Cooling Gel Infused Memory Foam Pillow", price: 1599, oldPrice: 2999, rating: 4.6, reviews: "320", stock: 4, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/pillow/g/e/l/cooling-gel-infused-original-imahfzhg88.jpeg" },
  { id: 6, name: "Organic Bamboo Fiber Pillow", price: 1350, oldPrice: 2100, rating: 4.4, reviews: "210", stock: 15, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/pillow/b/a/m/bamboo-fiber-soft-original-imahfzhg99.jpeg" },
  { id: 7, name: "Aaramdehi Signature Cloud Pillow", price: 999, oldPrice: 1799, rating: 4.9, reviews: "1,800", stock: 20, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/pillow/c/l/o/cloud-soft-white-original-imahfzhg11.jpeg" },
  { id: 8, name: "Firm Support Latex Pillow", price: 2200, oldPrice: 3500, rating: 4.3, reviews: "95", stock: 3, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/pillow/l/a/t/natural-latex-firm-original-imahfzhg22.jpeg" },
  { id: 9, name: "Anti-Snore Cervical Pillow", price: 1450, oldPrice: 2600, rating: 4.1, reviews: "430", stock: 6, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/pillow/s/n/o/anti-snore-design-original-imahfzhg33.jpeg" },
  { id: 10, name: "Pregnancy Body Support U-Pillow", price: 1899, oldPrice: 3200, rating: 4.7, reviews: "560", stock: 7, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/pillow/p/r/e/full-body-u-shaped-original-imahfzhg44.jpeg" },
  { id: 11, name: "Soft Silk Filled Luxury Pillow", price: 2999, oldPrice: 4999, rating: 4.9, reviews: "45", stock: 2, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/pillow/s/i/l/mulberry-silk-filled-original-imahfzhg55.jpeg" },
  { id: 12, name: "Aaramdehi Kids Soft Pillow (Small)", price: 499, oldPrice: 899, rating: 4.6, reviews: "1,200", stock: 25, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/pillow/k/i/d/kids-small-size-original-imahfzhg66.jpeg" },
  { id: 13, name: "Travel Neck Pillow (Memory Foam)", price: 599, oldPrice: 999, rating: 4.5, reviews: "3,100", stock: 40, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/pillow/t/r/a/neck-support-travel-original-imahfzhg77.jpeg" },
  { id: 14, name: "Down Alternative Plush Pillow", price: 1150, oldPrice: 1850, rating: 4.4, reviews: "180", stock: 9, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/pillow/d/o/w/down-alternative-original-imahfzhg00.jpeg" },
  { id: 15, name: "Hypoallergenic Pillow (Set of 4)", price: 1899, oldPrice: 3400, rating: 4.3, reviews: "780", stock: 5, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/pillow/h/y/p/pack-of-4-white-original-imahfzhg11.jpeg" },

  // --- BOLSTERS & CUSHIONS (16-30) ---
  { id: 16, name: "Velvet Round Bolster - Navy Blue", price: 749, oldPrice: 1299, rating: 4.5, reviews: "420", stock: 14, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/bolster/v/e/l/navy-blue-velvet-original-imahfzhg22.jpeg" },
  { id: 17, name: "Traditional Indian Diwan Bolster (Set of 2)", price: 1399, oldPrice: 2400, rating: 4.2, reviews: "150", stock: 8, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/bolster/d/i/w/diwan-set-bolster-original-imahfzhg33.jpeg" },
  { id: 18, name: "Decorative Sofa Cushion (16x16)", price: 299, oldPrice: 599, rating: 4.6, reviews: "900", stock: 50, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/cushion/s/o/f/decorative-floral-original-imahfzhg44.jpeg" },
  { id: 19, name: "Embroidered Luxury Cushion Cover", price: 450, oldPrice: 850, rating: 4.8, reviews: "230", stock: 30, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/cushion-cover/e/m/b/luxury-embroided-original-imahfzhg55.jpeg" },
  { id: 20, name: "Yoga Meditation Bolster (Long)", price: 1100, oldPrice: 1800, rating: 4.7, reviews: "85", stock: 10, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/bolster/y/o/g/yoga-meditation-long-original-imahfzhg66.jpeg" },
  { id: 21, name: "Aaramdehi Floor Cushion (Large)", price: 899, oldPrice: 1599, rating: 4.5, reviews: "340", stock: 12, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/cushion/f/l/o/floor-sitting-large-original-imahfzhg77.jpeg" },
  { id: 22, name: "Back Support Chair Cushion", price: 799, oldPrice: 1400, rating: 4.4, reviews: "1,500", stock: 18, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/cushion/b/a/c/back-support-office-chair-original-imahfzhg88.jpeg" },
  { id: 23, name: "Satin Bolster with Tassels", price: 950, oldPrice: 1650, rating: 4.3, reviews: "60", stock: 5, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/bolster/s/a/t/satin-with-tassels-original-imahfzhg99.jpeg" },
  { id: 24, name: "Round Velvet Floor Puff/Cushion", price: 1299, oldPrice: 2200, rating: 4.6, reviews: "110", stock: 7, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/cushion/r/o/u/round-velvet-puff-original-imahfzhg00.jpeg" },
  { id: 25, name: "Microbead Travel Pillow", price: 450, oldPrice: 799, rating: 4.1, reviews: "2,100", stock: 35, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/pillow/m/i/c/microbead-travel-original-imahfzhg11.jpeg" },
  { id: 26, name: "Cylindrical Bolster - Cotton Soft", price: 699, oldPrice: 1199, rating: 4.4, reviews: "280", stock: 15, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/bolster/c/y/l/cotton-soft-white-original-imahfzhg22.jpeg" },
  { id: 27, name: "Gold Leaf Printed Cushion Set", price: 1499, oldPrice: 2800, rating: 4.7, reviews: "140", stock: 9, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/cushion/g/o/l/gold-leaf-set-of-5-original-imahfzhg33.jpeg" },
  { id: 28, name: "Aaramdehi Wedge Pillow for Reading", price: 1650, oldPrice: 2999, rating: 4.8, reviews: "205", stock: 6, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/pillow/w/e/d/wedge-reading-support-original-imahfzhg44.jpeg" },
  { id: 29, name: "Sequined Party Cushion Covers", price: 550, oldPrice: 999, rating: 4.2, reviews: "310", stock: 22, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/cushion-cover/s/e/q/sequined-magic-original-imahfzhg55.jpeg" },
  { id: 30, name: "Neck Roll Pillow for Spine Care", price: 499, oldPrice: 899, rating: 4.5, reviews: "520", stock: 19, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/pillow/n/e/c/neck-roll-ortho-original-imahfzhg66.jpeg" },

  // --- OTHER BEDDING & MISC (31-40) ---
  { id: 31, name: "Waterproof Pillow Protectors (Set of 2)", price: 399, oldPrice: 799, rating: 4.6, reviews: "1,350", stock: 45, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/pillow-cover/w/a/t/waterproof-zipper-original-imahfzhg77.jpeg" },
  { id: 32, name: "Quilted Mattress Protector (Double Bed)", price: 1499, oldPrice: 2599, rating: 4.7, reviews: "2,800", stock: 11, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/mattress-protector/q/u/i/quilted-waterproof-original-imahfzhg88.jpeg" },
  { id: 33, name: "Weighted Blanket for Anxiety Relief", price: 3500, oldPrice: 5999, rating: 4.9, reviews: "120", stock: 4, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/blanket/w/e/i/weighted-calming-original-imahfzhg99.jpeg" },
  { id: 34, name: "Aaramdehi Satin Eye Mask & Pillow Set", price: 650, oldPrice: 1100, rating: 4.8, reviews: "560", stock: 28, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/eye-mask/s/a/t/satin-sleep-set-original-imahfzhg00.jpeg" },
  { id: 35, name: "Hand-Woven Cotton Throw Blanket", price: 1250, oldPrice: 1999, rating: 4.4, reviews: "190", stock: 13, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/blanket/h/a/n/handwoven-boho-throw-original-imahfzhg11.jpeg" },
  { id: 36, name: "Body Pillow with Cotton Cover", price: 1750, oldPrice: 2800, rating: 4.5, reviews: "240", stock: 8, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/pillow/b/o/d/long-body-pillow-original-imahfzhg22.jpeg" },
  { id: 37, name: "Premium Bed Runner - Velvet Touch", price: 899, oldPrice: 1600, rating: 4.3, reviews: "75", stock: 10, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/bed-runner/v/e/l/premium-velvet-original-imahfzhg33.jpeg" },
  { id: 38, name: "Microfiber Duvet Insert (All Season)", price: 2199, oldPrice: 3800, rating: 4.7, reviews: "630", stock: 6, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/blanket/d/u/v/all-season-quilt-original-imahfzhg44.jpeg" },
  { id: 39, name: "Luxury Bedspread with Pillow Shams", price: 3200, oldPrice: 5500, rating: 4.6, reviews: "55", stock: 3, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/bedspread/l/u/x/luxury-king-size-original-imahfzhg55.jpeg" },
  { id: 40, name: "Infant Head Shaping Pillow", price: 349, oldPrice: 699, rating: 4.4, reviews: "940", stock: 32, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/pillow/i/n/f/infant-head-support-original-imahfzhg66.jpeg" }
];

const ProductListing = () => {
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sortBy, setSortBy] = useState('relevance');
  const [page, setPage] = useState(1);
  const [wishlist, setWishlist] = useState([]);

  // Wishlist Logic
  const toggleWishlist = (e, id) => {
    e.preventDefault(); 
    e.stopPropagation(); // Link पर क्लिक होने से रोकता है
    setWishlist(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  // Filter, Sort & Pagination Logic
  const currentItems = useMemo(() => {
    let data = ALL_PRODUCTS_DATA.filter(product => product.price <= maxPrice);
    
    if (sortBy === 'lowToHigh') data = [...data].sort((a, b) => a.price - b.price);
    if (sortBy === 'highToLow') data = [...data].sort((a, b) => b.price - a.price);
    
    const startIndex = (page - 1) * 8;
    return data.slice(startIndex, startIndex + 8);
  }, [maxPrice, sortBy, page]);

  return (
    <div className="flex bg-[#f4f7f9] min-h-screen p-4 lg:p-8 gap-8">
      
      {/* --- SIDEBAR --- */}
      <aside className="hidden lg:block w-[280px] sticky top-24 h-fit">
         <Sidebar onPriceChange={(val) => setMaxPrice(val)} />
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 space-y-6">
        
        {/* Header Bar */}
        <div className="bg-white p-5 rounded-2xl shadow-sm flex justify-between items-center border border-gray-100">
          <h2 className="font-black text-blue-900 text-xl tracking-tight uppercase">Premium Collection</h2>
          <div className="flex gap-4">
             <select 
               onChange={(e) => {setSortBy(e.target.value); setPage(1);}}
               className="text-xs font-black bg-gray-50 border-none outline-none py-2 px-4 rounded-xl text-gray-600 cursor-pointer"
             >
               <option value="relevance">Popularity</option>
               <option value="lowToHigh">Price: Low to High</option>
               <option value="highToLow">Price: High to Low</option>
             </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {currentItems.map((item) => (
            <div key={item.id} className="group bg-white rounded-[30px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-blue-100 flex flex-col h-full relative">
              
              {/* Image Box */}
              <div className="h-64 bg-[#f8f9fb] p-6 relative flex items-center justify-center overflow-hidden">
                <Link to={`/product/${item.id}`} className="w-full h-full flex items-center justify-center">
                  <img 
                    src={item.image} 
                    className="max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700" 
                    alt={item.name}
                  />
                </Link>
                
                {/* Wishlist Button */}
                <button 
                  onClick={(e) => toggleWishlist(e, item.id)}
                  className="absolute top-5 right-5 z-20 transition-transform active:scale-150"
                >
                  {wishlist.includes(item.id) ? <AiFillHeart className="text-red-500 text-2xl" /> : <AiOutlineHeart className="text-gray-300 text-2xl hover:text-red-400" />}
                </button>

                {/* Badges */}
                {item.stock <= 5 && (
                  <div className="absolute top-5 left-5 bg-orange-100 text-orange-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                    Only {item.stock} left!
                  </div>
                )}

                {/* Hover Action Buttons */}
                <div className="absolute bottom-[-60px] group-hover:bottom-4 left-0 right-0 flex justify-center gap-2 transition-all duration-500">
                  <button className="bg-white p-3 rounded-full shadow-xl text-blue-900 hover:bg-blue-900 hover:text-white transition-all transform active:scale-90">
                    <AiOutlineEye size={20} />
                  </button>
                  <button className="bg-white p-3 rounded-full shadow-xl text-blue-900 hover:bg-blue-900 hover:text-white transition-all transform active:scale-90">
                    <FiShoppingCart size={18} />
                  </button>
                </div>
              </div>

              {/* Info Box */}
              <div className="p-6 flex flex-col flex-grow">
                <p className="text-[9px] text-blue-900 font-black uppercase tracking-[2px] mb-2">Aaramdehi Luxe</p>
                <Link to={`/product/${item.id}`}>
                  <h3 className="text-sm font-bold text-gray-800 line-clamp-2 h-10 group-hover:text-blue-900 transition-colors leading-tight">
                    {item.name}
                  </h3>
                </Link>
                
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex text-amber-400 text-xs">
                    {[...Array(5)].map((_, i) => <AiFillStar key={i} className={i < Math.floor(item.rating) ? 'fill-amber-400' : 'text-gray-100'} />)}
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">({item.reviews})</span>
                </div>

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

        {/* --- PAGINATION --- */}
        <div className="flex justify-center py-10 border-b border-gray-100">
          <Stack spacing={2}>
            <Pagination 
              count={Math.ceil(ALL_PRODUCTS_DATA.length / 8)} 
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              sx={{ 
                '& .MuiPaginationItem-root': { fontWeight: 'black' },
                '& .Mui-selected': { bgcolor: '#1e3a8a !important', color: 'white' } 
              }}
            />
          </Stack>
        </div>

        {/* --- POPULAR PRODUCTS (Now placed correctly at bottom) --- */}
        <div className="mt-12">
          <h3 className="text-xl font-black text-gray-800 mb-8 uppercase tracking-widest text-center">Trending This Week</h3>
          
        </div>

      </main>
    </div>
  );
};

export default ProductListing;