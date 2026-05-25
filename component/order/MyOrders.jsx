import React from 'react';
import { IoSearch, IoFilterOutline } from "react-icons/io5";

const MyOrders = () => {
  // Aaramdehi (Home Furnishing) related dummy data
  const orders = [
    {
      id: "ORD12345",
      name: "Luxury Velvet 3-Seater Sofa Set - Royal Blue",
      price: "24,999",
      status: "Delivered",
      date: "Mar 28, 2026",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=80", // Sofa Image
      desc: "Delivered on Mar 28. Your item has been delivered successfully."
    },
    {
      id: "ORD12346",
      name: "Solid Oak Wood King Size Bed with Storage",
      price: "45,500",
      status: "Cancelled",
      date: "Apr 02, 2026",
      image: "https://images.unsplash.com/photo-1505693419148-ad3097f98751?w=200&q=80", // Bed Image
      desc: "Cancelled on Apr 02. Refund has been initiated."
    },
    {
      id: "ORD12347",
      name: "Modern Geometric Pattern Cotton Rug (5x7 ft)",
      price: "3,200",
      status: "On the way",
      date: "Expected by Apr 10",
      image: "https://images.unsplash.com/photo-1575414003591-ece8d0416c7a?w=200&q=80", // Rug Image
      desc: "Your item is out for delivery."
    }
  ];

  return (
    <div className="flex-1 md:ml-4 flex flex-col gap-4">
      {/* Search & Mobile Filter Bar */}
      <div className="bg-white p-2 md:p-0 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Search your orders here" 
            className="w-full p-2.5 pl-4 pr-12 border rounded-sm text-sm focus:outline-none focus:border-blue-500 shadow-sm"
          />
          <button className="absolute right-0 top-0 h-full px-4 bg-[#2874f0] text-white rounded-r-sm flex items-center gap-2 font-bold text-sm hover:bg-blue-700 transition-colors">
            <IoSearch size={20} className="md:hidden" />
            <span className="hidden md:inline flex items-center gap-2">
              <IoSearch size={18} /> Search Orders
            </span>
          </button>
        </div>
        
        {/* Mobile Only Filter Button */}
        <button className="md:hidden flex items-center justify-center gap-2 p-2 border rounded-sm text-sm font-medium text-gray-600 bg-white">
          <IoFilterOutline size={18} /> Filters
        </button>
      </div>

      <div className="flex flex-col gap-3 pb-8">
        {orders.map((order) => (
          <div 
            key={order.id} 
            className="bg-white p-4 md:p-6 border border-gray-100 rounded-sm flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-shadow cursor-pointer gap-4"
          >
            {/* Product Section */}
            <div className="flex gap-4 md:gap-8 items-start md:items-center">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded-sm overflow-hidden flex-shrink-0 p-1">
                <img 
                  src={order.image} 
                  alt={order.name} 
                  className="w-full h-full object-cover mix-blend-multiply" 
                />
              </div>
              
              <div className="flex-1 md:w-64 lg:w-80">
                <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-relaxed">
                  {order.name}
                </h3>
                <p className="text-[11px] text-gray-400 mt-1 uppercase font-bold tracking-wide">
                  Order ID: {order.id}
                </p>
              </div>

              <div className="hidden md:block w-24">
                <p className="text-sm font-bold text-gray-900">₹{order.price}</p>
              </div>
            </div>

            {/* Mobile Price Display */}
            <div className="md:hidden border-t pt-2 mt-1">
               <p className="text-sm font-bold text-gray-900">Amount Paid: ₹{order.price}</p>
            </div>

            {/* Status Section */}
            <div className="flex items-start md:items-center gap-3 md:min-w-[220px]">
              <div className={`mt-1.5 md:mt-0 w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                order.status === 'Cancelled' ? 'bg-red-500' : 
                order.status === 'Delivered' ? 'bg-green-500' : 'bg-blue-500'
              }`}></div>
              
              <div className="flex flex-col">
                <p className="text-sm font-bold text-gray-800">
                  {order.status} on {order.date}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 leading-tight">
                  {order.desc}
                </p>
                
                {order.status === 'Delivered' && (
                  <button className="text-blue-600 text-[11px] font-bold mt-2 flex items-center gap-1 hover:underline">
                    ★ Rate & Review Product
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;