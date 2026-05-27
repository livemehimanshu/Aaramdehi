import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllProductsAPI } from '../../src/api/authAndAdminApi';
import { AiFillStar, AiOutlineHeart, AiFillHeart, AiOutlineEye } from 'react-icons/ai';
import { FiShoppingCart } from 'react-icons/fi';
import { BsLightningCharge } from 'react-icons/bs';
import { useCart } from '../../src/hooks/useCart'; // ✅ useCart Hook import kiya
import toast from 'react-hot-toast'; // ✅ Professional notifications

// ✅ Elite Product Skeleton Loader Component
const ProductSkeleton = () => (
  <div className="bg-white rounded-[30px] overflow-hidden border border-gray-100 animate-pulse flex flex-col h-full shadow-sm min-h-[400px]">
    <div className="h-64 bg-gray-100"></div>
    <div className="p-6 flex flex-col flex-grow space-y-4">
      <div className="h-3 w-20 bg-gray-50 rounded"></div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-gray-50 rounded"></div>
        <div className="h-4 w-2/3 bg-gray-50 rounded"></div>
      </div>
      <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-24 bg-gray-50 rounded"></div>
          <div className="h-2 w-16 bg-gray-50 rounded"></div>
        </div>
        <div className="w-10 h-10 bg-gray-50 rounded-xl"></div>
      </div>
    </div>
  </div>
);

const PopularProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ Direct Context Access (Phase 2 Migration)
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();

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
  }, []);

  // Placeholder for add to cart (similar to ProductListing)
  const onAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      ...product,
      id: product._id || product.id,
      price: product.sellingPrice || product.price || 0,
      image: product.thumbnail || (product.images && product.images[0]?.url) || product.image
    }, 1);
    
    toast.success(`${product.name} added to Aaramdehi cart!`);
  };

  // Placeholder for toggle wishlist (similar to ProductListing)
  const onToggleWishlist = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const productId = product._id || product.id;

    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
      toast.success("Removed from wishlist");
    } else {
      addToWishlist({
        id: productId,
        name: product.name,
        brand: product.brand || "Aaramdehi",
        price: product.sellingPrice || product.price || 0,
        image: product.thumbnail || (product.images && product.images[0]?.url) || product.image
      });
      toast.success("Added to favorites ❤️");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 my-8">
        <div className="h-8 w-64 bg-gray-100 rounded mx-auto mb-10 animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
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
                className="w-full h-full flex items-center justify-center">
                <img src={item.thumbnail || 'https://placehold.co/300x300?text=No+Image'} className="max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700" alt={item.name}/>
              </Link>
              <button onClick={(e) => onToggleWishlist(e, item)} className="absolute top-5 right-5 z-20">
                {isInWishlist(item._id || item.id) ? <AiFillHeart className="text-red-500 text-2xl" /> : <AiOutlineHeart className="text-gray-300 text-2xl hover:text-red-400" />}
              </button>
              <div className="absolute bottom-[-60px] group-hover:bottom-4 left-0 right-0 flex justify-center gap-2 transition-all duration-500">
                <Link to={`/product/${item._id}`} className="bg-white p-3 rounded-full shadow-xl text-blue-900 hover:bg-blue-900 hover:text-white transition-all transform active:scale-90 flex items-center justify-center">
                  <AiOutlineEye size={20} />
                </Link>
                <button // Event handler ko update kiya
                  onClick={(e) => onAddToCart(e, item)}
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
                  <span className="text-2xl font-black text-gray-900 tracking-tighter">₹{(item.sellingPrice || item.price).toLocaleString()}</span>
                  <span className="text-[11px] text-gray-400 line-through font-bold">₹{(item.mrp || item.oldPrice).toLocaleString()}</span>
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