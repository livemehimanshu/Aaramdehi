import React, { useState } from 'react';
import { Trash2, Edit3, Search, Plus, Filter } from 'lucide-react';

const AllProducts = () => {
  const [products, setProducts] = useState([
    { id: 1, name: 'Premium Teak Wood Sofa', category: 'Furniture', price: '₹45,000', stock: 12, img: 'https://via.placeholder.com/150' },
    { id: 2, name: 'Minimalist Dining Table', category: 'Furniture', price: '₹22,000', stock: 8, img: 'https://via.placeholder.com/150' },
    { id: 3, name: 'Modern Floor Lamp', category: 'Lighting', price: '₹3,500', stock: 45, img: 'https://via.placeholder.com/150' },
  ]);

  return (
    <div className="p-4 md:p-8 bg-gray-950 min-h-screen text-gray-200">
      
      {/* Header - Stacked on Mobile, Row on Desktop */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">All Products</h1>
          <p className="text-slate-400 text-sm">Manage your Aaramdehi inventory</p>
        </div>
        
        {/* Buttons & Search Wrapper */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all flex-1 md:flex-none">
            <Plus size={18} /> Add
          </button>
          
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-3 top-3 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-emerald-400 text-white w-full md:w-64" 
            />
          </div>
          
          <button className="bg-gray-900 hover:bg-gray-800 border border-gray-800 p-2.5 rounded-xl text-slate-300">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Table Section - Added overflow-x-auto for Mobile Scroll */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="bg-gray-800/50 text-slate-400 text-[10px] md:text-xs uppercase tracking-wider">
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-800/30 transition-all text-sm">
                  <td className="p-4 flex items-center gap-3">
                    <img src={product.img} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                    <span className="font-medium text-white text-xs md:text-sm">{product.name}</span>
                  </td>
                  <td className="p-4 text-slate-400">{product.category}</td>
                  <td className="p-4 text-emerald-400 font-bold">{product.price}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${product.stock < 10 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="text-slate-400 hover:text-white p-1"><Edit3 size={16} /></button>
                      <button className="text-rose-400 p-1"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllProducts;