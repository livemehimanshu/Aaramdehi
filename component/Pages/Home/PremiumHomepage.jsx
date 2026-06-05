import React from 'react';

const categories = [
  { name: 'Living Room', img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600' },
  { name: 'Bedroom', img: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1600' },
  { name: 'Kitchen', img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1600' },
  { name: 'Dining Room', img: 'https://images.unsplash.com/photo-1617806118233-18e1db207f62?w=1600' },
];

const products = [
  {
    id: 1,
    name: 'WELLGIVER Pillow Premium Quality, Microfiber Pillow, Soft & Fluffy',
    price: '170',
    rating: '4.8',
    img: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=1600',
  },
  {
    id: 2,
    name: 'Premium Bedsheet Luxury Cotton, Geometric Pattern (Double Bed)',
    price: '1,299',
    rating: '4.9',
    img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1600',
  },
  {
    id: 3,
    name: 'Ceramic Minimalist Flower Vase - Matte White Accent',
    price: '899',
    rating: '4.7',
    img: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=1600',
  },
  {
    id: 4,
    name: 'Cushion Covers Set of 5 - Royal Indigo & Gold Pattern',
    price: '499',
    rating: '4.8',
    img: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=1600',
  },
];

export default function PremiumHomepage() {
  return (
    <div className="bg-[#FAF9F6] min-h-screen font-sans text-[#2D2D2D]">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold tracking-wider text-[#1A365D]">AARAMDEHI</div>
          <div className="hidden md:flex space-x-8 text-sm font-medium tracking-wide text-gray-600">
            <a href="#shop" className="hover:text-[#1A365D]">Shop</a>
            <a href="#collections" className="hover:text-[#1A365D]">Collections</a>
            <a href="#about" className="hover:text-[#1A365D]">Our Story</a>
          </div>
          <div className="flex items-center space-x-4 text-gray-600">
            <button className="hover:text-[#1A365D] text-sm font-medium">Login</button>
            <div className="relative cursor-pointer text-xl">🛒</div>
          </div>
        </div>
      </header>

      <section className="relative h-[65vh] w-full bg-gray-200 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600"
          alt="Luxury Interior Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="text-center text-white px-4 max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif tracking-wide mb-4">Where Comfort Meets Luxury</h1>
            <p className="text-base md:text-lg font-light tracking-widest mb-6">Discover Curated Collections for Your Home</p>
            <button className="bg-white text-[#1A365D] font-semibold text-xs tracking-widest uppercase px-8 py-3 rounded-lg shadow-lg hover:bg-[#1A365D] hover:text-white transition-all duration-300">
              Shop Now
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16" id="collections">
        <h2 className="text-2xl md:text-3xl font-serif text-center tracking-wide mb-12">Shop by Room</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {categories.map((cat, idx) => (
            <div key={idx} className="group cursor-pointer text-center">
              <div className="w-full aspect-square rounded-3xl overflow-hidden border border-gray-100 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md">
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="mt-4 font-medium text-sm tracking-wide text-gray-700 group-hover:text-[#1A365D]">{cat.name}</h3>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16 border-t border-b border-gray-100" id="shop">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-1">Top Rated</span>
              <h2 className="text-2xl md:text-3xl font-serif tracking-wide text-[#1A365D]">Best Sellers in Home Decor</h2>
            </div>
            <a href="#all" className="text-xs font-semibold text-[#1A365D] tracking-wider uppercase border-b-2 border-[#1A365D] pb-1 hover:text-blue-800 hover:border-blue-800 transition-all">
              View All
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {products.map((prod) => (
              <div key={prod.id} className="group bg-[#FAF9F6] p-3 rounded-3xl transition-all duration-300 hover:bg-white hover:shadow-xl border border-transparent hover:border-gray-100">
                <div className="w-full aspect-square overflow-hidden rounded-3xl bg-gray-100 mb-3 relative">
                  <img src={prod.img} alt={prod.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <span className="absolute top-2 left-2 bg-white/90 text-[10px] font-bold tracking-wider px-2 py-1 rounded-2xl text-gray-600">
                    ★ {prod.rating}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-800 h-9 overflow-hidden leading-relaxed">{prod.name}</h3>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                  <span className="text-base font-bold text-[#1A365D]">₹{prod.price}</span>
                  <button className="bg-white border border-[#1A365D] text-[#1A365D] text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-2xl transition-colors hover:bg-[#1A365D] hover:text-white">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#FAF9F6] py-16 text-center max-w-5xl mx-auto px-4" id="about">
        <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-2">Our Commitment</h3>
        <h2 className="text-2xl md:text-3xl font-serif tracking-wide mb-10 text-gray-800">Why Choose Aaramdehi?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-4">
            <div className="text-2xl mb-2">🛋️</div>
            <h4 className="font-semibold text-sm tracking-wide text-gray-800 mb-1">Curated Selection</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Handpicked designs that fit perfectly into modern luxury homes.</p>
          </div>
          <div className="p-4">
            <div className="text-2xl mb-2">💎</div>
            <h4 className="font-semibold text-sm tracking-wide text-gray-800 mb-1">Premium Materials</h4>
            <p className="text-xs text-gray-500 leading-relaxed">We source certified high-density microfibres and premium fabrics.</p>
          </div>
          <div className="p-4">
            <div className="text-2xl mb-2">✨</div>
            <h4 className="font-semibold text-sm tracking-wide text-gray-800 mb-1">Artisanal Craft</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Attention to stitch and stripe detail for flawless durability.</p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 border-t border-gray-100" id="all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl md:text-3xl font-serif tracking-wide text-center text-[#1A365D] mb-10">Latest Additions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {products.map((prod) => (
              <div key={`latest-${prod.id}`} className="group bg-[#FAF9F6] p-3 rounded-3xl transition-all duration-300 hover:bg-white hover:shadow-xl border border-transparent hover:border-gray-100">
                <div className="w-full aspect-square overflow-hidden rounded-3xl bg-gray-100 mb-3">
                  <img src={prod.img} alt={prod.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <h3 className="text-sm font-medium text-gray-800 h-9 overflow-hidden leading-relaxed">{prod.name}</h3>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                  <span className="text-base font-bold text-[#1A365D]">₹{prod.price}</span>
                  <button className="bg-[#1A365D] text-white text-[10px] font-bold tracking-wider uppercase px-4 py-1.5 rounded-2xl transition-colors hover:bg-blue-900">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
