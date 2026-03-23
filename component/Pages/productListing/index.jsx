import React, { useState } from 'react';
import { FiStar, FiChevronDown, FiChevronUp, FiSearch } from 'react-icons/fi';
// 'form' को 'from' में बदल दिया और 'sidebar' को 'Sidebar' (Capital S) किया
import Sidebar from '../../sidebar';

const ProductPage = () => {
  const [openSections, setOpenSections] = useState({
    price: true,
    texture: true,
    ratings: true
  });

  // आपके aaramdehi प्रोजेक्ट के प्रोडक्ट्स
  const products = [
    { id: 1, name: "White Soft Microfiber Pillow", price: 599, oldPrice: 1299, rating: 4.2, reviews: "2,450", image: "https://via.placeholder.com/200", discount: "53% off" },
    { id: 2, name: "Satin Plain White Fiber Bolster", price: 849, oldPrice: 1599, rating: 4.5, reviews: "1,120", image: "https://via.placeholder.com/200", discount: "46% off" },
    { id: 3, name: "Cotton Dori Cushion - Decorative", price: 399, oldPrice: 799, rating: 4.0, reviews: "850", image: "https://via.placeholder.com/200", discount: "50% off" },
    { id: 4, name: "Handicraft Home Furnishing Bed Sheet", price: 1250, oldPrice: 2499, rating: 4.8, reviews: "320", image: "https://via.placeholder.com/200", discount: "50% off" },
  ];

  return (
    <div className="flex bg-[#f1f3f6] min-h-screen p-2 md:p-4 gap-4 font-sans">
      
      {/* --- SIDEBAR (Flipkart Style) --- */}
      <aside className="hidden lg:block w-[280px] bg-white shadow-sm h-fit sticky top-4 border-r">
         {/* टैग को <Sidebar /> (Capital S) करें */}
         <Sidebar />
      </aside>

      {/* --- MAIN PRODUCT GRID --- */}
      <main className="flex-1 bg-white shadow-sm">
        {/* Sort Options */}
        <div className="flex items-center gap-6 p-4 border-b text-sm">
          <span className="font-bold text-gray-500">Sort By</span>
          <button className="text-blue-600 border-b-2 border-blue-600 pb-1 font-bold">Relevance</button>
          <button className="text-gray-600 font-medium">Popularity</button>
          <button className="text-gray-600 font-medium font-sans">Price -- Low to High</button>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-y-10 p-4">
          {products.map((item) => (
            <div key={item.id} className="group p-3 hover:shadow-xl transition-shadow cursor-pointer relative">
              <div className="h-[200px] w-full mb-3 flex items-center justify-center">
                <img src={item.image} alt={item.name} className="object-contain h-full group-hover:scale-105 transition-transform" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium leading-tight group-hover:text-blue-600 line-clamp-2">{item.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="bg-green-700 text-white text-[11px] px-1.5 py-0.5 rounded flex items-center gap-0.5 font-bold">
                    {item.rating} <FiStar className="fill-white text-[10px]" />
                  </span>
                  <span className="text-gray-400 text-xs">({item.reviews})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold font-sans">₹{item.price}</span>
                  <span className="text-gray-500 line-through text-xs font-bold font-sans">₹{item.oldPrice}</span>
                  <span className="text-green-700 text-xs font-bold">{item.discount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ProductPage;