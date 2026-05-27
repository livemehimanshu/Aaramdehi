import React from 'react';
import { Link } from 'react-router-dom';

const MultiItemCards = () => {
  const cardsData = [
    {
      id: 1,
      title: "Refresh Your Bedroom",
      subtitle: "Pillows, Bedding & More",
      image: "https://images.unsplash.com/photo-1578683010236-d716f9d3d525?q=80&w=1000",
      link: "/products?category=Bedroom"
    },
    {
      id: 2,
      title: "Living Room Makeover",
      subtitle: "Curtains, Cushions & Decor",
      image: "https://images.unsplash.com/photo-1595526114035-a5852991a03c?q=80&w=1000",
      link: "/products?category=Living Room"
    }
  ];

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cardsData.map(card => (
          <Link to={card.link} key={card.id} className="block group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
            <img 
              src={card.image} 
              alt={card.title} 
              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
              <h3 className="text-white text-2xl font-black uppercase tracking-tight mb-1 drop-shadow-md">
                {card.title}
              </h3>
              <p className="text-gray-200 text-sm font-medium mb-4 drop-shadow-sm">
                {card.subtitle}
              </p>
              <span className="bg-red-500 text-white px-5 py-2 rounded-full text-xs font-bold uppercase w-fit hover:bg-red-600 transition-colors">
                Shop Now →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default MultiItemCards;