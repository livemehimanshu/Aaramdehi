import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Sidebar from '../../sidebar/index.jsx'; 
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { AiFillStar, AiOutlineHeart, AiFillHeart, AiOutlineEye, AiOutlineRight } from 'react-icons/ai';
import { FiShoppingCart } from 'react-icons/fi'; 
import { BsLightningCharge } from 'react-icons/bs'; 
import { addToRecentlyViewed } from '../../../src/data/recentlyViewedUtils';
import AaramdehiAdBanner from '../../header/AaramdehiAdBanner'; // Ad Banner import kiya
import toast from 'react-hot-toast';
import HomeBanner from '../../banneradds/HomeBanner'; // Import HomeBanner
import SEO from '../../header/SEO'; // SEO Component Import Kiya
import { getAllProductsAPI, getActiveCategoriesAPI } from '../../../src/api/authAndAdminApi';
// Yeh page sare products ko grid format mein show karta hai
// Ismein filtering, sorting, pagination, wishlist, cart sab features hain

const PLACEHOLDER_IMAGE = "https://placehold.co/400x400?text=Product+Not+Found";

const ProductListing = ({ forcedCategory }) => {
  // --- STATE MANAGEMENT ---
  const [products, setProducts] = useState([]); // Database products
  const [categories, setCategories] = useState([]); // Database categories
  const [searchParams, setSearchParams] = useSearchParams();
  
  // ✅ READ PARAMS FROM URL DYNAMICALLY
  const categoryParam = searchParams.get('category');
  const subCategoryParam = searchParams.get('subCategory');

  const [selectedCategory, setSelectedCategory] = useState(forcedCategory || categoryParam || 'All');
  const [selectedSubCategory, setSelectedSubCategory] = useState(subCategoryParam || null);
  const [activeFilters, setActiveFilters] = useState({ brands: [], rating: 0, inStock: false });
  const [loading, setLoading] = useState(true);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [sortBy, setSortBy] = useState('relevance');
  const [page, setPage] = useState(1);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    // --- FETCH DATA ON MOUNT ---
    // --- FETCH CATEGORIES FROM DATABASE ---
    const loadCategories = async () => {
      try {
        const res = await getActiveCategoriesAPI();
        
        if (res && (res.success || res.data) && Array.isArray(res.data)) {
          setCategories(res.data);
        } else if (Array.isArray(res)) {
          setCategories(res);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    loadCategories();

    // --- LOAD WISHLIST FROM LOCALSTORAGE ---
    const savedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(savedWishlist);

    // Event listener: jab dusre component se wishlist update ho toh yahan bhi update ho (for wishlist icon)
    const handleWishlistUpdate = () => {
      const updatedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      setWishlist(updatedWishlist);
    };

    window.addEventListener("wishlistUpdated", handleWishlistUpdate);
    return () => window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
  }, []);

  useEffect(() => {
    // --- FETCH PRODUCTS WHEN URL PARAMS CHANGE ---
    const loadProducts = async () => {
      try {
        setLoading(true);
        const currentCategory = forcedCategory || categoryParam || 'All';
        const currentSubCategory = subCategoryParam || undefined;

        // Update UI states based on current params
        setSelectedCategory(currentCategory);
        setSelectedSubCategory(currentSubCategory);
        setPage(1); // Reset to first page

        // ✅ IMPROVED API CALL: Only send params if they're not 'All'
        const res = await getAllProductsAPI({ 
          category: currentCategory !== 'All' ? currentCategory : undefined,
          subCategory: currentSubCategory,
          limit: 100 
        });

        console.log(`✅ Products fetched for Category: ${currentCategory}, SubCategory: ${currentSubCategory}`, res);
        
        if (res && res.success && Array.isArray(res.data)) {
          setProducts(res.data);
        } else if (Array.isArray(res)) {
          setProducts(res);
        } else {
          console.warn("Unexpected API response structure:", res);
          setProducts([]);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [forcedCategory, categoryParam, subCategoryParam, searchParams]);

  // Debugging: Log data whenever it changes
  useEffect(() => {
    if (categories.length > 0) {
      console.log("✅ Categories loaded in ProductListing:", categories);
    }
  }, [categories]);

  // Function: Product ko dekhne par recently viewed mein add karna
  const handleProductView = (product) => {
    addToRecentlyViewed(product);
  };

  // Function: Product ko cart mein add karna
  const handleAddToCart = (product) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const productId = product._id || product.id; // Prioritize _id from Firebase, fallback to id
    const isExist = cart.find(item => String(item.id) === String(productId)); // Compare with item.id in cart

    if (isExist) {
      cart = cart.map(item => String(item.id) === String(productId) ? { ...item, qty: (item.qty || 1) + 1 } : item); // Use item.id for consistency in cart array
    } else {
      cart.push({ ...product, qty: 1, id: productId, price: product.sellingPrice || product.price || product.newPrice || product.oldPrice || 0 }); // Consistent ID: Use id for cart, and ensure price is captured
      if (cart[cart.length - 1].price === 0) {
        console.warn("Product added to cart with 0 price from ProductListing:", product.name, "Original product:", product);
          }
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    toast.success(`${product.name} added to cart!`);
  };

  // Function: Wishlist mein item add/remove karna localStorage se
  const toggleWishlist = (e, product) => {
    e.preventDefault(); 
    e.stopPropagation();

    // localStorage se wishlist nikalo
    let wishlistData = JSON.parse(localStorage.getItem("wishlist")) || [];
    const productId = product._id || product.id;
    
    const isInWishlist = wishlistData.some(item => String(item.id) === String(productId)); // Compare with item.id in wishlist

    if (isInWishlist) {
      // Agar already hai toh remove karo
      wishlistData = wishlistData.filter(item => String(item.id) !== String(productId)); // Use item.id for consistency in wishlist array
      toast.error("Removed from wishlist");
    } else {
      const productToSave = { // Ensure id is present for wishlist
        id: productId,
        name: product.name,
        brand: product.brand || "Aaramdehi",
        price: product.sellingPrice || product.price || product.newPrice || product.oldPrice || 0, // Robust price selection
        oldPrice: product.mrp || product.oldPrice || 0,
        rating: product.rating || 5,
        image: product.thumbnail || (product.images && product.images[0]?.url) || product.image, // Robust image selection
        category: product.category || "Uncategorized"
      };
      wishlistData.push(productToSave);
      toast.success("Added to wishlist!");
      if (wishlistData[wishlistData.length - 1].price === 0) {
        console.warn("Product added to wishlist with 0 price from ProductListing:", product.name, "Original product:", product);
      }
    }

    // localStorage mein save karo
    localStorage.setItem("wishlist", JSON.stringify(wishlistData));
    
    // Update state aur event bhejo dusre components ko
    setWishlist(wishlistData);
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  // Filter Handler for Sidebar
  const handleFilterChange = (type, value, checked) => {
    setPage(1); // Reset to first page on filter change
    if (type === 'brand') {
      setActiveFilters(prev => ({
        ...prev,
        brands: checked ? [...prev.brands, value] : prev.brands.filter(b => b !== value)
      }));
    } else if (type === 'rating') {
      setActiveFilters(prev => ({ ...prev, rating: checked ? value : 0 }));
    } else if (type === 'availability') {
      setActiveFilters(prev => ({ ...prev, inStock: checked }));
    }
  };

  // 1. Pehle data ko filter aur sort karo (Pagination se pehle)
  const filteredData = useMemo(() => {
    let data = products;

    // ✅ Stock Availability Filter
    if (activeFilters.inStock) {
      data = data.filter(p => p.stock > 0);
    }

    // ✅ Brand Filter
    if (activeFilters.brands.length > 0) {
      data = data.filter(p => activeFilters.brands.includes(p.brand));
    }

    // ✅ Rating Filter
    if (activeFilters.rating > 0) {
      data = data.filter(p => (p.ratings?.average || 0) >= activeFilters.rating);
    }

    // ✅ Improved Filtering: 'All' ko skip karein aur strings ko trim/lowercase match karein
    // ✅ Sub-Category Filter (High Priority)
    if (selectedSubCategory) {
      data = data.filter(product => {
        const subCatName = String(product.subCategory || "");
        return subCatName.trim().toLowerCase() === selectedSubCategory.trim().toLowerCase();
      });
    } 
    // ✅ Main Category Filter
    else if (selectedCategory && selectedCategory !== 'All') {
      data = data.filter(product => {
        const catName = typeof product.category === 'object' ? product.category?.name : String(product.category);
        return catName?.trim().toLowerCase() === selectedCategory.trim().toLowerCase();
      });
    }

    // 2. Price filter apply karo
    data = data.filter(product => Number(product.sellingPrice || product.price) <= maxPrice);
    // Phir sorting apply karo
    if (sortBy === 'lowToHigh') data = [...data].sort((a, b) => (a.sellingPrice || a.price) - (b.sellingPrice || b.price));
    if (sortBy === 'highToLow') data = [...data].sort((a, b) => (b.sellingPrice || b.price) - (a.sellingPrice || a.price));
    if (sortBy === 'newest') data = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return data;
  }, [products, selectedCategory, selectedSubCategory, maxPrice, sortBy, activeFilters]);

  // 2. Ab current page ke items nikalo
  const currentItems = useMemo(() => {
    const startIndex = (page - 1) * 8;
    return filteredData.slice(startIndex, startIndex + 8);
  }, [filteredData, page]);

  return (
    <div className="flex bg-[#f4f7f9] min-h-screen p-4 lg:p-8 gap-8 mt-20">
      {/* ✅ SEO Optimizer implementation */}
      <SEO 
        title={selectedCategory === 'All' ? 'Premium Furniture Collection' : `${selectedCategory} Collection`}
        description={`Explore the best ${selectedCategory} at Aaramdehi. Quality furniture designed for comfort and elegance.`}
        keywords={`${selectedCategory}, Aaramdehi furniture, home decor online`}
      />

      <aside className="hidden lg:block w-[280px] sticky top-24 h-fit">
         <Sidebar 
            categories={categories} 
            selectedCategory={selectedCategory}
            onCategoryChange={(cat) => {
              // साइडबार से कैटेगरी बदलने पर URL अपडेट करें
              const newParams = new URLSearchParams(searchParams);
              if (cat === 'All') {
                newParams.delete('category');
              } else {
                newParams.set('category', cat);
              }
              newParams.delete('subCategory'); // कैटेगरी बदलते ही सब-कैटेगरी क्लियर करें
              setSearchParams(newParams);
            }} 
            onPriceChange={(val) => setMaxPrice(val)} 
            onFilterChange={handleFilterChange}
         />
      </aside>

      <main className="flex-1 space-y-6">
        {/* ✅ CATEGORY Page Banner (Moved inside main for better alignment) */}
        <HomeBanner section="category" />

        {/* ✅ Dynamic Ad Banner */}
        <AaramdehiAdBanner />

        {/* ✅ Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            <Link to="/" className="hover:text-blue-600 transition">Home</Link>
            <AiOutlineRight size={10} />
            <span className="text-gray-800">{selectedCategory}</span>
        </nav>

        <div className="bg-white p-5 rounded-2xl shadow-sm flex justify-between items-center border border-gray-100">
          {/* ✅ Dynamic Title: Selected category ke hisaab se change hoga */}
          <h2 className="font-black text-blue-900 text-xl tracking-tight uppercase">
            {selectedCategory === 'All' ? 'Premium Collection' : selectedCategory}
          </h2>
          
          <select 
            onChange={(e) => {setSortBy(e.target.value); setPage(1);}}
            className="text-xs font-black bg-gray-50 border-none outline-none py-2 px-4 rounded-xl text-gray-600 cursor-pointer"
          >
            <option value="relevance">Popularity</option>
            <option value="newest">Newest First</option>
            <option value="lowToHigh">Price: Low to High</option>
            <option value="highToLow">Price: High to Low</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {currentItems.map((item) => (
            <div key={item._id || item.id} className="group bg-white rounded-[30px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-blue-100 flex flex-col h-full relative">
              <div className="h-64 bg-[#f8f9fb] p-6 relative flex items-center justify-center overflow-hidden">
                <Link 
                  to={`/product/${item._id || item.id}`} 
                  onClick={() => handleProductView(item)}
                  className="w-full h-full flex items-center justify-center">
                  <img 
                    src={item.thumbnail || item.image || PLACEHOLDER_IMAGE} 
                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                    className="max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700" 
                    alt={item.name}
                  />
                </Link>
                
                <button onClick={(e) => toggleWishlist(e, item)} className="absolute top-5 right-5 z-20">
                  {wishlist.some(w => String(w.id) === String(item._id || item.id)) ? <AiFillHeart className="text-red-500 text-2xl" /> : <AiOutlineHeart className="text-gray-300 text-2xl hover:text-red-400" />}
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
                <p className="text-[9px] text-blue-900 font-black uppercase tracking-[2px] mb-2">
                  {/* Display populated category name or string fallback */}
                  {typeof item.category === 'object' 
                    ? item.category?.name 
                    : (item.category || "Aaramdehi Luxe")
                  }
                </p>
                <Link 
                  to={`/product/${item._id || item.id}`}
                  onClick={() => handleProductView(item)}>
                  <h3 className="text-sm font-bold text-gray-800 line-clamp-2 h-10 group-hover:text-blue-900 transition-colors leading-tight">
                    {item.name}
                  </h3>
                </Link>
                
                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-2xl font-black text-gray-900 tracking-tighter">₹{(item.sellingPrice || item.price || item.newPrice || 0).toLocaleString()}</span>
                    <span className="text-[11px] text-gray-400 line-through font-bold">₹{(item.mrp || item.oldPrice || 0).toLocaleString()}</span>
                    {/* ✅ Bank Offer Text */}
                    <span className="text-[9px] font-bold text-emerald-600 mt-1 uppercase">Extra ₹50 Off on UPI</span>
                  </div>
                  <div className="bg-blue-50 text-blue-900 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all transform group-hover:rotate-12">
                    <BsLightningCharge size={20} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        <div className="flex justify-center py-10 border-b border-gray-100">
          {/* ✅ Dynamic Pagination: Filtered data ki length use karein */}
          <Pagination 
            count={Math.ceil(filteredData.length / 8)} 
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