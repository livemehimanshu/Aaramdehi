import React from 'react';

export default function SeoGlobal() {
  return (
    <div className="p-4 md:p-8 bg-gray-950 min-h-screen text-gray-200">
      {/* SEO Logic - Yeh invisible hai par meta tags set karega */}
     

      {/* Page UI */}
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Global SEO Optimizer</h1>
        
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Site Title</label>
            <input type="text" className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl focus:border-emerald-500 outline-none text-white" defaultValue="Aaramdehi | Premium Furniture" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Meta Description</label>
            <textarea className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl focus:border-emerald-500 outline-none text-white h-24" defaultValue="Aaramdehi offers premium handcrafted furniture and home decor. Shop the best designs." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Keywords (Comma separated)</label>
            <input type="text" className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl focus:border-emerald-500 outline-none text-white" defaultValue="furniture, home decor, teak wood, minimalist, aaramdehi" />
          </div>

          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all w-full md:w-auto">
            Save Global Settings
          </button>
        </div>
      </div>
    </div>
  );
}