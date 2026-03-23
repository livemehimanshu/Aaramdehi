import React from 'react'
import { Button } from '@mui/material';
import Hero from '../../slider/hero';
import PromoSection from '../../banneradds/PromoSection';
import PopularProducts from '../../slider/PopularProducts';
import LatestProducts from '../../slider/LatestProducts';

import RecentlyViewed from '../../banneradds/RecentlyViewed';

 const Home = () => {
  return (
   <main className="w-full">
      {/* 1. Hero Slider Section */}
      <Hero />
{/* 2. जहाँ आप इसे दिखाना चाहते हैं वहां इसका टैग लगा दें */}
      <PromoSection />
      {/* 2. Popular Products Section */}
      <PopularProducts />
      {/* 3. Latest Products Section */}
      <RecentlyViewed />
      <LatestProducts />
      
    </main>
  )
}
export default Home;