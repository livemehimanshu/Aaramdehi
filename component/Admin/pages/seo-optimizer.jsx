import React, { useState } from 'react';
import { Search, Globe } from 'lucide-react';

export default function SEOOptimizer({ initialData, onSave }) {
  const [seo, setSeo] = useState(initialData || {
    title: '',
    description: '',
    keywords: ''
  });

  const getStatus = (text, min, max) => {
    if (text.length < min) return { color: 'text-orange-400', label: 'Too Short' };
    if (text.length > max) return { color: 'text-rose-500', label: 'Too Long' };
    return { color: 'text-emerald-400', label: 'Perfect' };
  };

  return (
    <div className="bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-800 shadow-xl w-full">
      <h2 className="text-lg md:text-xl font-bold mb-6 md:mb-8 flex items-center gap-3 text-white">
        <Globe className="text-blue-500" size={24} /> SEO Optimizer
      </h2>

      {/* Meta Title */}
      <div className="mb-6">
        <label className="block text-xs md:text-sm font-medium mb-2 text-gray-400">Meta Title (50-60 chars)</label>
        <input 
          maxLength={70}
          value={seo.title}
          onChange={(e) => setSeo({...seo, title: e.target.value})}
          className="w-full p-3 md:p-4 bg-gray-950 border border-gray-800 rounded-xl focus:border-blue-500 outline-none text-white transition-all text-sm"
          placeholder="Product Name | Aaramdehi"
        />
        <p className={`text-[10px] md:text-xs mt-2 ${getStatus(seo.title, 50, 60).color}`}>
          {seo.title.length}/60 - {getStatus(seo.title, 50, 60).label}
        </p>
      </div>

      {/* Meta Description */}
      <div className="mb-6">
        <label className="block text-xs md:text-sm font-medium mb-2 text-gray-400">Meta Description (150-160 chars)</label>
        <textarea 
          maxLength={200}
          value={seo.description}
          onChange={(e) => setSeo({...seo, description: e.target.value})}
          className="w-full p-3 md:p-4 bg-gray-950 border border-gray-800 rounded-xl h-32 md:h-40 focus:border-blue-500 outline-none text-white transition-all text-sm resize-none"
          placeholder="Detailed description of the product..."
        />
        <p className={`text-[10px] md:text-xs mt-2 ${getStatus(seo.description, 150, 160).color}`}>
          {seo.description.length}/160 - {getStatus(seo.description, 150, 160).label}
        </p>
      </div>

      {/* Keywords */}
      <div className="mb-8">
        <label className="block text-xs md:text-sm font-medium mb-2 text-gray-400">Focus Keywords (Comma separated)</label>
        <input 
          value={seo.keywords}
          onChange={(e) => setSeo({...seo, keywords: e.target.value})}
          className="w-full p-3 md:p-4 bg-gray-950 border border-gray-800 rounded-xl focus:border-blue-500 outline-none text-white transition-all text-sm"
          placeholder="furniture, wooden chair, home decor..."
        />
      </div>

      <button 
        onClick={() => onSave(seo)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 md:py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20 text-sm md:text-base"
      >
        <Search size={18} /> Update SEO Data
      </button>
    </div>
  );
}