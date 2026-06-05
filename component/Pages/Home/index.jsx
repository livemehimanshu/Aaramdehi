import React from 'react'
import Header from '../../header/index.jsx';
import HomeBanner from '../../banneradds/HomeBanner.jsx';
import PopularProducts from '../../slider/PopularProducts.jsx';
import LatestProducts from '../../slider/LatestProducts.jsx';
import ShopByRoom from '../../Pages/productListing/ShopByRoom.jsx';

import AaramdehiAdBanner from '../../header/AaramdehiAdBanner.jsx';
import RecentlyViewed from '../../banneradds/RecentlyViewed.jsx';

const Home = () => {
  return (
    <main className="w-full bg-white">
      {/* 1. Premium Hero Banner Section */}
      <section className="relative">
        <HomeBanner section="hero" />
      </section>

      {/* 2. Bedroom Dynamic Banner with Premium Spacing */}
      <section className="py-4 bg-gradient-to-b from-white via-[#FAF9F6] to-white">
        <HomeBanner section="bedroom" />
      </section>

      {/* 3. Premium Ad Banner Section */}
      <section className="py-6 bg-[#FAF9F6]">
        <AaramdehiAdBanner />
      </section>

      {/* 4. Shop by Room Premium Section */}
      <section className="py-16 bg-gradient-to-b from-white to-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif text-center text-[#1A365D] mb-2 tracking-tight">Shop by Room</h2>
          <p className="text-center text-gray-500 text-sm mb-12 tracking-wide">Discover furniture and decor for every corner of your home</p>
          <ShopByRoom />
        </div>
      </section>

      {/* 6. Best Sellers Premium Section */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-12 text-center">
            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Top Collections</span>
            <h2 className="text-3xl md:text-4xl font-serif text-[#1A365D] tracking-tight">Best Sellers in Home Decor</h2>
          </div>
      {/* 5. Best Sellers Premium Section */}
        </div>
      </section>

      {/* 6. Recently Viewed Premium Section */}
      <section className="py-16 bg-gradient-to-b from-[#FAF9F6] to-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif text-center text-[#1A365D] mb-12 tracking-tight">Your Recent Favorites</h2>
          <RecentlyViewed />
        </div>
      </section>

      {/* 7. Seasonal Offers Banner */}
      <section className="py-6 bg-[#FAF9F6]">
        <HomeBanner section="seasonal" />
      </section>

      {/* 8. Latest Products Premium Section */}
      <section className="py-16 bg-white border-t-2 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-12 text-center">
            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">New Arrivals</span>
            <h2 className="text-3xl md:text-4xl font-serif text-[#1A365D] tracking-tight">Latest Additions</h2>
          </div>
          <LatestProducts />
        </div>
      </section>

      {/* 9. Promotional Banner */}
      <section className="py-6 bg-gradient-to-r from-[#1A365D] to-[#2a4365]">
        <HomeBanner section="promotional" />
      </section>

      {/* 10. Premium CTA Footer Section */}
      <section className="py-20 bg-white text-center border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-serif text-[#1A365D] mb-4 tracking-tight">Experience Premium Comfort</h2>
          <p className="text-gray-600 mb-8 leading-relaxed text-sm md:text-base">
            Discover our curated collection of premium furniture and home decor, handpicked to transform your living spaces into sanctuaries of comfort and style.
          </p>
          <button className="bg-[#1A365D] text-white font-semibold text-xs tracking-widest uppercase px-10 py-3 rounded-lg shadow-lg hover:bg-[#2a4365] transition-all duration-300">
            Explore Collection
          </button>
        </div>
      </section>
      
    </main>
  )
}
export default Home;
