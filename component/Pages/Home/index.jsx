import React from 'react'
import Header from '../../header/index.jsx';
import HomeBanner from '../../banneradds/HomeBanner.jsx';
import PopularProducts from '../../slider/PopularProducts.jsx';
import LatestProducts from '../../slider/LatestProducts.jsx';
import MultiItemCards from '../../Pages/ProductListing/MultiItemCards.jsx';
import ShopByRoom from '../../Pages/ProductListing/ShopByRoom.jsx';

import AaramdehiAdBanner from '../../header/AaramdehiAdBanner.jsx';
import RecentlyViewed from '../../banneradds/RecentlyViewed.jsx';

 const Home = () => {
  return (
   <main className="w-full">
      {/* 1. High-Quality Banner (Visual Appeal) */}
      <HomeBanner section="hero" />

      {/* Bedroom Dynamic Banner */}
      <HomeBanner section="bedroom" />

      {/* Dynamic Ad Banner */}
      <AaramdehiAdBanner />

      {/* 2. Aesthetic Multi-Item Cards */}
      <MultiItemCards />

      {/* 3. Shop by Room (Horizontal Scroller) */}
      <ShopByRoom />

      {/* 4. "Best Sellers in Home Decor" Scroller */}
      <PopularProducts />

      {/* 5. Recently Viewed (Personalization) */}
      <RecentlyViewed />

      {/* 6. Seasonal Offers Section */}
      <HomeBanner section="seasonal" />

      {/* 6. Latest Products Section */}
      <HomeBanner section="promotional" />
      <LatestProducts />
      
    </main>
  )
}
export default Home;