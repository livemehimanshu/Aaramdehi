import React from 'react';
import { FaTruckMoving } from 'react-icons/fa';

const PromoSection = () => {
  const cards = [
    {
      id: 1,
      title: "S22 Samsung Smartphone",
      price: "$250.00",
      image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=300",
      bgColor: "bg-[#e3f2fd]" // Light Blue
    },
    {
      id: 2,
      title: "Armchair Mad By shopstic",
      price: "$190.00",
      image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=300",
      bgColor: "bg-[#fbe9e7]" // Light Orange/Peach
    },
    {
      id: 3,
      title: "Noise Wireless Headphones",
      price: "$129.00",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300",
      bgColor: "bg-[#e8eaf6]" // Light Indigo
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      
      {/* --- FREE SHIPPING BANNER --- */}
      <div className="flex flex-col md:flex-row items-center justify-between border-2 border-gray-100 rounded-xl p-6 gap-4">
        <div className="flex items-center gap-4">
          <FaTruckMoving className="text-3xl text-gray-800" />
          <span className="text-xl font-black uppercase tracking-wider text-gray-800">Free Shipping</span>
        </div>
        
        <div className="text-gray-500 font-medium text-center md:text-left flex-1 md:px-10">
          Free Delivery Now On Your First Order and over $200
        </div>

        <div className="text-xl font-bold text-gray-800">
          - ONLY $200*
        </div>
      </div>

      {/* --- PROMO CARDS SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div 
            key={card.id} 
            className={`${card.bgColor} rounded-xl p-6 flex items-center justify-between overflow-hidden relative group cursor-pointer hover:shadow-lg transition-shadow`}
          >
            {/* Text Content */}
            <div className="z-10 w-1/2">
              <h3 className="text-lg font-bold text-gray-800 leading-tight mb-2">
                {card.title}
              </h3>
              <p className="text-red-500 font-bold text-lg mb-3">{card.price}</p>
              <button className="text-[12px] font-bold uppercase tracking-widest border-b-2 border-gray-800 pb-1 hover:text-blue-600 hover:border-blue-600 transition-all">
                Shop Now
              </button>
            </div>

            {/* Image */}
            <div className="w-1/2 flex justify-end">
              <img 
                src={card.image} 
                alt={card.title} 
                className="w-32 h-32 object-contain group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default PromoSection;