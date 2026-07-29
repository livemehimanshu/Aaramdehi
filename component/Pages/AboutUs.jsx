import React from 'react';
import SEO from '../header/SEO';

const AboutUs = () => {
  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-20">
      <SEO 
        title="About Us | Aaramdehi" 
        description="Learn more about Aaramdehi, your trusted partner for premium furniture, home decor, and unparalleled comfort."
      />
      
      {/* Hero Section */}
      <div className="bg-[#1A365D] text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-serif mb-4">About Aaramdehi</h1>
        <p className="text-lg md:text-xl font-light max-w-2xl mx-auto opacity-90">
          Redefining Comfort, Elevating Lifestyles.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-12 space-y-16 text-[#1A365D]">
        {/* Our Story */}
        <section className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-2xl md:text-3xl font-serif mb-6 text-center">Our Story</h2>
          <p className="text-gray-600 leading-relaxed text-center max-w-3xl mx-auto">
            Founded with a passion for bringing unparalleled comfort into every home, Aaramdehi started as a small dream to provide premium quality furniture and home decor at accessible prices. Over the years, we have grown into a trusted destination for those who refuse to compromise on aesthetics or relaxation. From our meticulously crafted beds to our plush sofas, every piece is designed with you in mind.
          </p>
        </section>

        {/* Core Values */}
        <section>
          <h2 className="text-2xl md:text-3xl font-serif mb-8 text-center">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Quality Craftsmanship', desc: 'Every piece is crafted with precision, using only the finest materials.' },
              { title: 'Customer First', desc: 'Your comfort and satisfaction are the driving forces behind everything we do.' },
              { title: 'Sustainable Practices', desc: 'We are committed to eco-friendly sourcing and sustainable manufacturing.' }
            ].map((value, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center hover:-translate-y-1 transition-transform">
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;
