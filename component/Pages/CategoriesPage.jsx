import React from 'react';
import SEO from '../header/SEO';
import CategoriesBar from '../CategoriesBar/CategoriesBar';

const CategoriesPage = () => {
  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-20">
      <SEO 
        title="Shop by Category | Aaramdehi" 
        description="Explore premium furniture and home decor by category at Aaramdehi."
      />
      
      {/* Hero Section */}
      <div className="bg-[#1A365D] text-white py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-serif mb-4">Our Categories</h1>
        <p className="text-lg font-light max-w-2xl mx-auto opacity-90">
          Find exactly what you're looking for to complete your home.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <CategoriesBar />
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
