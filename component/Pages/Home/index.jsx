import React from 'react'
import { Button } from '@mui/material';
import Hero from '../../slider/hero';

 const Home = () => {
  return (
   <main className="w-full">
      {/* 1. Hero Slider Section */}
      <Hero />

      {/* 2. इसके नीचे आप बाकी के सेक्शन्स डाल सकते हैं */}
      <div className="container mx-auto px-4 py-10">
         {/* उदाहरण के लिए */}
         <h2 className="text-2xl font-bold mb-4">New Products</h2>
         {/* Product Grid यहाँ आएगा */}
      </div>
    </main>
  )
}
export default Home;