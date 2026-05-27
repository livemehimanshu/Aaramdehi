import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllProductsAPI } from '../../src/api/authAndAdminApi';
import { AiFillStar, AiOutlineHeart, AiFillHeart, AiOutlineEye } from 'react-icons/ai';
import { FiShoppingCart } from 'react-icons/fi';
import { BsLightningCharge } from 'react-icons/bs';
import { addToRecentlyViewed } from '../../src/data/recentlyViewedUtils'; // Assuming this utility exists

const PopularProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]); // For wishlist icons

  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        setLoading(true);
        // Fetch products sorted by 'views' (most popular) and limit to 8
        const res = await getAllProductsAPI({ sort: '-views', limit: 8 });
        if (res && res.success && Array.isArray(res.data)) {
          setProducts(res.data);
        } else if (Array.isArray(res)) {
          setProducts(res);
        }
      } catch (error) {
        console.error("Error fetching popular products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularProducts();

    // Load wishlist from localStorage for icon state
    const savedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(savedWishlist);

    const handleWishlistUpdate = () => {
      const updatedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      setWishlist(updatedWishlist);
    };
    window.addEventListener("wishlistUpdated", handleWishlistUpdate);
    return () => window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
  }, []);

  const handleProductView = (product) => {
    addToRecentlyViewed(product); // Assuming this utility exists
  };

  // Placeholder for add to cart (similar to ProductListing)
  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const productId = product._id || product.id;
    const isExist = cart.find(item => String(item.id) === String(productId));

    if (isExist) {
      cart = cart.map(item =>
        String(item.id) === String(productId) ? { ...item, qty: (item.qty || 1) + 1 } : item
      );
    } else {
      const price = product.sellingPrice || product.price || product.newPrice || 0;
      cart.push({ ...product, qty: 1, id: productId, price });
      if (price === 0) console.warn("PopularProducts: Cart price 0");
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // Placeholder for toggle wishlist (similar to ProductListing)
  const toggleWishlist = (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    let wishlistData = JSON.parse(localStorage.getItem("wishlist")) || [];
    const productId = product._id || product.id;
    const isInWishlist = wishlistData.some(item => String(item.id) === String(productId));

    if (isInWishlist) {
      wishlistData = wishlistData.filter(item => String(item.id) !== String(productId));
    } else {
      const price = product.sellingPrice || product.price || product.newPrice || 0;
      wishlistData.push({
        id: productId,
        name: product.name,
        brand: product.brand || "Aaramdehi",
        price: price,
        image: product.thumbnail || (product.images && product.images[0]?.url) || product.image,
        rating: product.rating || 5
      });
      if (price === 0) console.warn("PopularProducts: Wishlist price 0");
    }
    localStorage.setItem("wishlist", JSON.stringify(wishlistData));
    setWishlist(wishlistData);
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading Popular Products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return <div className="container mx-auto p-4 text-center text-gray-500">No Popular Products found.</div>;
  }

  return (
    <div className="container mx-auto p-4 my-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Best Sellers in Home Decor</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((item) => (
          <div key={item._id} className="group bg-white rounded-[30px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-blue-100 flex flex-col h-full relative">
            <div className="h-64 bg-[#f8f9fb] p-6 relative flex items-center justify-center overflow-hidden">
              <Link
                to={`/product/${item._id}`}
                onClick={() => handleProductView(item)}
                className="w-full h-full flex items-center justify-center">
                  <img src={item.thumbnail || (item.images && item.images[0]?.url) || item.image || 'https://via.placeholder.com/150'} className="max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700" alt={item.name}/>
              </Link>
              <button onClick={(e) => toggleWishlist(e, item)} className="absolute top-5 right-5 z-20">
                {wishlist.some(w => String(w.id) === String(item._id || item.id)) ? <AiFillHeart className="text-red-500 text-2xl" /> : <AiOutlineHeart className="text-gray-300 text-2xl hover:text-red-400" />}
              </button>
              <div className="absolute bottom-[-60px] group-hover:bottom-4 left-0 right-0 flex justify-center gap-2 transition-all duration-500">
                <button className="bg-white p-3 rounded-full shadow-xl text-blue-900 hover:bg-blue-900 hover:text-white transition-all transform active:scale-90">
                  <AiOutlineEye size={20} />
                </button>
                <button
                  onClick={(e) => handleAddToCart(e, item)}
                  className="bg-white p-3 rounded-full shadow-xl text-blue-900 hover:bg-blue-900 hover:text-white transition-all transform active:scale-90"
                >
                  <FiShoppingCart size={18} />
                </button>
              </div>
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <p className="text-[9px] text-blue-900 font-black uppercase tracking-[2px] mb-2">
                {typeof item.category === 'object' ? item.category?.name : (item.category || "Aaramdehi Luxe")}
              </p>
              <Link
                to={`/product/${item._id}`}
                onClick={() => handleProductView(item)}>
                <h3 className="text-sm font-bold text-gray-800 line-clamp-2 h-10 group-hover:text-blue-900 transition-colors leading-tight">
                  {item.name}
                </h3>
              </Link>
              <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-gray-900 tracking-tighter">₹{(item.sellingPrice || item.price || item.newPrice || 0).toLocaleString()}</span>
                  <span className="text-[11px] text-gray-400 line-through font-bold">₹{(item.mrp || item.oldPrice || 0).toLocaleString()}</span>
                </div>
                <div className="bg-blue-50 text-blue-900 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all transform group-hover:rotate-12">
                  <BsLightningCharge size={20} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularProducts;