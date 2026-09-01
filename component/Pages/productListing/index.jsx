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
import { optimizeImage, getResponsiveImageAttributes } from '../../../src/utils/imageOptimizer';
// Yeh page sare products ko grid format mein show karta hai
// Ismein filtering, sorting, pagination, wishlist, cart sab features hain

const PLACEHOLDER_IMAGE = "https://placehold.co/400x400?text=Product+Not+Found";

const NEW_DAYS = Number(import.meta.env.VITE_NEW_DAYS || 7);

const isProductNew = (createdAt, days = NEW_DAYS) => {
  if (!createdAt) return false;
  let ts;
  if (typeof createdAt === 'string' || typeof createdAt === 'number') ts = new Date(createdAt);
  else if (createdAt.seconds) ts = new Date(createdAt.seconds * 1000);
  else if (createdAt.toDate) ts = createdAt.toDate();
  else return false;
  const diff = Date.now() - ts.getTime();
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
};

const ProductListing = ({ forcedCategory }) => {
  // --- STATE MANAGEMENT ---
  const [products, setProducts] = useState([]); // Database products
  const [categories, setCategories] = useState([]); // Database categories
  const [searchParams, setSearchParams] = useSearchParams();
  
  // ✅ READ PARAMS FROM URL DYNAMICALLY
  const categoryParam = searchParams.get('category');
  const subCategoryParam = searchParams.get('subCategory');
  const searchParam = searchParams.get('search'); // Extract search query
  
  // ✅ CANONICAL FIX: Build canonical URL without query params (for duplicate prevention)
  const getCanonicalUrl = () => {
    if (searchParam) {
      return `https://www.aaramdehi.co.in/products?search=${encodeURIComponent(searchParam)}`;
    }
    if (categoryParam) {
      return `https://www.aaramdehi.co.in/products?category=${encodeURIComponent(categoryParam)}`;
    }
    return 'https://www.aaramdehi.co.in/products';
  };

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
        const currentSearch = searchParam || undefined;

        // Update UI states based on current params
        setSelectedCategory(currentCategory);
        setSelectedSubCategory(currentSubCategory);
        setPage(1); // Reset to first page

        // ✅ Passing search parameter to API
        const response = await getAllProductsAPI({
          category: currentCategory !== 'All' ? currentCategory : undefined,
          subCategory: currentSubCategory,
          search: currentSearch,
          limit: 100
        });

        console.log(`📡 Raw API response [Search: ${currentSearch || 'None'}]:`, response);

        // ✅ ROBUST CHECK: Ensure productsData is always a clean array
        let productsData = [];
        if (response?.data?.data && Array.isArray(response.data.data)) {
          productsData = response.data.data;
          console.log(`✅ Extracted from response.data.data (${productsData.length} items)`);
        } else if (Array.isArray(response?.data)) {
          productsData = response.data;
          console.log(`✅ Extracted from response.data (${productsData.length} items)`);
        } else if (Array.isArray(response)) {
          productsData = response;
          console.log(`✅ Extracted from direct array (${productsData.length} items)`);
        } else {
          console.warn(`⚠️ No array found in response, defaulting to empty array`);
          productsData = [];
        }

        console.log(`📊 Products loaded [Search: "${currentSearch || 'All'}"]:`, {
          count: productsData.length,
          items: productsData.slice(0, 2)
        });
        setProducts(productsData);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [forcedCategory, categoryParam, subCategoryParam, searchParam, searchParams]);

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

  const pageTitle = searchParam
    ? `Search Results for ${searchParam} | Aaramdehi`
    : selectedCategory === 'All'
      ? 'Premium Furniture & Home Decor Collection | Aaramdehi'
      : `${selectedCategory} Collection | Aaramdehi`;

  const pageDescription = searchParam
    ? `Browse search results for ${searchParam} at Aaramdehi and discover premium furniture and decor.`
    : `Explore ${selectedCategory === 'All' ? 'premium furniture and home decor' : selectedCategory} at Aaramdehi with elegant designs, comfort, and quality craftsmanship.`;

  const pageKeywords = [selectedCategory, 'Aaramdehi', 'furniture', 'home decor', 'online shopping']
    .filter(Boolean)
    .join(', ');

  // ✅ Generate BreadcrumbList Schema for navigation
  const breadcrumbSchema = useMemo(() => {
    const breadcrumbs = [
      { position: 1, name: 'Home', item: 'https://www.aaramdehi.co.in' },
      { position: 2, name: 'Products', item: 'https://www.aaramdehi.co.in/products' }
    ];
    
    if (selectedCategory && selectedCategory !== 'All') {
      breadcrumbs.push({
        position: 3,
        name: selectedCategory,
        item: `https://www.aaramdehi.co.in/products?category=${encodeURIComponent(selectedCategory)}`
      });
    }
    
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map(b => ({
        "@type": "ListItem",
        "position": b.position,
        "name": b.name,
        "item": b.item
      }))
    };
  }, [selectedCategory]);

  // ✅ Generate ItemList + CollectionPage Schema for search results
  const collectionSchema = useMemo(() => {
    if (filteredData.length === 0) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": pageTitle,
      "description": pageDescription,
      "url": `https://www.aaramdehi.co.in/products${searchParam ? `?search=${encodeURIComponent(searchParam)}` : categoryParam ? `?category=${encodeURIComponent(categoryParam)}` : ''}`,
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": currentItems.map((product, index) => ({
          "@type": "Product",
          "position": index + 1,
          "name": product.name,
          "description": product.description || product.shortDescription || '',
          "image": product.thumbnail || product.images?.[0]?.url || product.image || '',
          "url": `https://www.aaramdehi.co.in/product/${product.slug || product._id || product.id}`,
          "brand": {
            "@type": "Brand",
            "name": product.brand || "Aaramdehi"
          },
          "offers": {
            "@type": "Offer",
            "price": product.sellingPrice || product.price || 0,
            "priceCurrency": "INR",
            "availability": (product.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
          },
          ...(product.ratings?.average || product.rating) && {
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": product.ratings?.average || product.rating || 5,
              "ratingCount": Array.isArray(product.reviews) ? product.reviews.length : 0,
              "bestRating": "5",
              "worstRating": "1"
            }
          }
        }))
      }
    };
  }, [filteredData, currentItems, pageTitle, pageDescription, searchParam, categoryParam]);

  // ✅ Combine BreadcrumbList + CollectionPage schemas using @graph
  const allSchemas = useMemo(() => {
    if (!collectionSchema) return breadcrumbSchema;
    return {
      "@context": "https://schema.org",
      "@graph": [breadcrumbSchema, collectionSchema]
    };
  }, [breadcrumbSchema, collectionSchema]);

  return (
    <div className="flex bg-[#f4f7f9] min-h-screen p-4 lg:p-8 gap-8 mt-20">
      {/* ✅ SEO Optimizer implementation with canonical URL + Schema markup */}
      <SEO 
        title={pageTitle}
        description={pageDescription}
        keywords={pageKeywords}
        ogUrl={`https://www.aaramdehi.co.in/products${searchParam ? `?search=${encodeURIComponent(searchParam)}` : categoryParam ? `?category=${encodeURIComponent(categoryParam)}` : ''}`}
        path="/products"
        schemaType="Schema.org Collection"
        schemaData={allSchemas}
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
        <AaramdehiAdBanner products={filteredData} categoryName={selectedCategory} />

        {/* ✅ Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
            <Link to="/" className="hover:text-blue-600 transition">Home</Link>
            <AiOutlineRight size={10} />
            <span className="text-gray-800">{selectedCategory}</span>
        </nav>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="font-black text-blue-900 text-xl tracking-tight uppercase">
                {searchParam ? `Search Results for "${searchParam}"` : 
                 (selectedCategory === 'All' ? 'Premium Collection' : selectedCategory)}
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Explore premium furniture, bedding, and decor curated for comfort, style, and everyday living.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link to="/ar-studio" className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 transition hover:bg-blue-100">Try AR Studio</Link>
                <Link to="/compare" className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-gray-700 transition hover:bg-gray-50">Compare Products</Link>
                <Link to="/blog" className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-gray-700 transition hover:bg-gray-50">Read Inspiration</Link>
              </div>
            </div>
            
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
      </div>

      {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {currentItems.map((item) => (
              <div key={item._id || item.id} className="group mc-card rounded-[18px] overflow-hidden transition-all duration-500 border border-transparent hover:border-blue-50 flex flex-col h-full relative">
              <div className="h-64 bg-gradient-to-br from-white to-[#fbfbfd] p-6 relative flex items-center justify-center overflow-hidden">
                {isProductNew(item.createdAt) && (
                  <div className="absolute left-3 top-3 z-40 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg">
                    JUST IN
                  </div>
                )}
                <Link 
                  to={`/product/${item.slug || item._id || item.id}`} 
                  onClick={() => handleProductView(item)}
                  className="w-full h-full flex items-center justify-center">
                  <img 
                    {...getResponsiveImageAttributes(item.thumbnail || item.image || PLACEHOLDER_IMAGE, [300, 500, 800], "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw", true)}
                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; e.target.srcset = ''; }}
                    width="400"
                    height="400"
                    loading="lazy"
                    decoding="async"
                    className="max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700" 
                    alt={`${item.name || 'Product'} thumbnail`}
                  />
                </Link>
                
                <button onClick={(e) => toggleWishlist(e, item)} className="absolute top-5 right-5 z-20" aria-label="Toggle Wishlist">
                  {wishlist.some(w => String(w.id) === String(item._id || item.id)) ? <AiFillHeart className="text-red-500 text-2xl" /> : <AiOutlineHeart className="text-gray-300 text-2xl hover:text-red-400" />}
                </button>

                <div className="absolute bottom-[-60px] group-hover:bottom-4 left-0 right-0 flex justify-center gap-2 transition-all duration-500">
                  <button className="bg-white p-3 rounded-full shadow-xl text-blue-900 hover:bg-blue-900 hover:text-white transition-all transform active:scale-90" aria-label="Quick View">
                    <AiOutlineEye size={20} />
                  </button>
                  {/* YAHAN CLICK EVENT ADD KIYA HAI */}
                  <button 
                    onClick={() => handleAddToCart(item)}
                    className="bg-white p-3 rounded-full shadow-xl text-blue-900 hover:bg-blue-900 hover:text-white transition-all transform active:scale-90"
                    aria-label="Add to Cart"
                  >
                    <FiShoppingCart size={18} />
                  </button>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-[1px] mb-2">
                  {/* Display populated category name or string fallback */}
                  {typeof item.category === 'object' 
                    ? item.category?.name 
                    : (item.category || "Aaramdehi Luxe")
                  }
                </p>
                <Link 
                  to={`/product/${item.slug || item._id || item.id}`}
                  onClick={() => handleProductView(item)}>
                  <h3 title={item.name} className="text-sm mc-serif font-medium text-gray-800 line-clamp-2 group-hover:text-gray-900 transition-colors leading-snug">
                    {item.name}
                  </h3>
                </Link>
                
                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-2xl font-black text-gray-900 tracking-tighter">₹{(item.sellingPrice || item.price || item.newPrice || 0).toLocaleString()}</span>
                    <span className="text-[11px] text-gray-500 line-through font-bold">₹{(item.mrp || item.oldPrice || 0).toLocaleString()}</span>
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