import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IoArrowBack, IoTrashOutline, IoAdd } from "react-icons/io5";
import { FiShoppingCart } from "react-icons/fi";

// ===== COMPARE PAGE COMPONENT =====
// Yeh page full width mein comparison show karta hai
// Ismein sab products ke details side-by-side dikhte hain

const ComparePage = () => {
  const [compareItems, setCompareItems] = useState([]);

  useEffect(() => {
    // localStorage se compare data lana
    const loadCompare = () => {
      const compare = JSON.parse(localStorage.getItem("compare")) || [];
      setCompareItems(compare);
    };

    loadCompare();

    // Jab kisi aur component se compare update ho
    window.addEventListener("compareUpdated", loadCompare);

    return () => {
      window.removeEventListener("compareUpdated", loadCompare);
    };
  }, []);

  // Function: Compare se product remove karna
  const removeFromCompare = (id) => {
    const updated = compareItems.filter(item => item.id !== id);
    setCompareItems(updated);
    localStorage.setItem("compare", JSON.stringify(updated));
    window.dispatchEvent(new Event("compareUpdated"));
  };

  // Function: Product ko cart mein move karna
  const addToCart = (product) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const isExist = cart.find(item => item.id === product.id);

    if (isExist) {
      cart = cart.map(item =>
        item.id === product.id ? { ...item, qty: item.qty + 1 } : item
      );
    } else {
      cart.push({ ...product, qty: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    alert(`${product.name} added to cart!`);
  };

  if (compareItems.length === 0) {
    return (
      <div className="min-h-[80vh] bg-gradient-to-b from-gray-50 to-white flex items-center justify-center mt-20 px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-3xl font-black text-gray-900 mb-3">Nothing to Compare</h2>
          <p className="text-gray-600 mb-6 max-w-md">
            Select products to compare and see them side-by-side with all their specifications
          </p>
          <Link 
            to="/products"
            className="inline-flex items-center gap-2 bg-blue-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-800 transition"
          >
            <IoArrowBack /> Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen mt-20 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-gray-900 uppercase tracking-tight">
              📊 Compare Products
            </h1>
            <p className="text-gray-600 mt-2">
              Comparing <span className="font-bold text-blue-900">{compareItems.length}</span> products
            </p>
          </div>
          <Link 
            to="/products"
            className="flex items-center gap-2 bg-blue-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-800 transition"
          >
            <IoArrowBack /> Back
          </Link>
        </div>

        {/* Comparison Table - Horizontal Scroll */}
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
          <div className="min-w-[800px]">
            
            {/* Product Images Row */}
            <div className="border-b border-gray-200 p-6">
              <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${compareItems.length}, 1fr)` }}>
                <div className="font-bold text-gray-600 text-sm uppercase">Product</div>
                {compareItems.map((item) => (
                  <div key={item.id} className="text-center">
                    <div className="w-full h-40 bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm line-clamp-2">
                      {item.name}
                    </h3>
                    <button
                      onClick={() => removeFromCompare(item.id)}
                      className="mt-2 text-red-500 hover:text-red-700 text-sm font-bold flex items-center justify-center gap-1 w-full"
                    >
                      <IoTrashOutline size={14} /> Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Brand Row */}
            <div className="border-b border-gray-200 bg-gray-50 p-6">
              <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${compareItems.length}, 1fr)` }}>
                <div className="font-bold text-gray-600 text-sm uppercase">Brand</div>
                {compareItems.map((item) => (
                  <div key={item.id} className="text-gray-900 font-semibold">
                    {item.brand}
                  </div>
                ))}
              </div>
            </div>

            {/* Price Row */}
            <div className="border-b border-gray-200 p-6">
              <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${compareItems.length}, 1fr)` }}>
                <div className="font-bold text-gray-600 text-sm uppercase">Price</div>
                {compareItems.map((item) => (
                  <div key={item.id}>
                    <div className="text-2xl font-black text-gray-900">
                      ₹{(item.price || item.newPrice || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400 line-through">
                      ₹{(item.oldPrice || 0).toLocaleString()}
                    </div>
                    <div className="text-green-600 font-bold text-sm mt-1">
                      {item.oldPrice && item.price ? Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100) : 0}% off
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating Row */}
            <div className="border-b border-gray-200 bg-gray-50 p-6">
              <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${compareItems.length}, 1fr)` }}>
                <div className="font-bold text-gray-600 text-sm uppercase">Rating</div>
                {compareItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <div className="bg-green-600 text-white font-bold px-2 py-1 rounded text-sm">
                      {item.rating} ⭐
                    </div>
                    <span className="text-gray-600 text-xs">(1,234 reviews)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Row */}
            <div className="border-b border-gray-200 p-6">
              <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${compareItems.length}, 1fr)` }}>
                <div className="font-bold text-gray-600 text-sm uppercase">Category</div>
                {compareItems.map((item) => (
                  <div key={item.id} className="text-gray-900 font-semibold">
                    {item.category}
                  </div>
                ))}
              </div>
            </div>

            {/* Add to Cart Row */}
            <div className="bg-gray-50 p-6 border-t border-gray-200">
              <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${compareItems.length}, 1fr)` }}>
                <div className="font-bold text-gray-600 text-sm uppercase">Action</div>
                {compareItems.map((item) => (
                  <div key={item.id}>
                    <button
                      onClick={() => addToCart(item)}
                      className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-800 transition"
                    >
                      <FiShoppingCart size={18} />
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Shop?</h3>
          <p className="text-gray-600 mb-6">
            Add products to your cart and proceed to checkout
          </p>
          <Link 
            to="/products"
            className="inline-block bg-blue-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-800 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ComparePage;
