import React, { useState } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([
    { id: 1, name: 'Furniture', count: 12 },
    { id: 2, name: 'Home Decor', count: 8 },
  ]);
  const [newCategory, setNewCategory] = useState('');

  const addCategory = () => {
    if (newCategory.trim() !== '') {
      setCategories([...categories, { id: Date.now(), name: newCategory, count: 0 }]);
      setNewCategory('');
    }
  };

  const deleteCategory = (id) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  return (
    <div className="p-4 md:p-8 bg-gray-950 min-h-screen text-gray-200">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-white">Category Management</h1>

      {/* Add Category Section: Mobile par stack hoga, Desktop par row */}
      <div className="bg-gray-900 p-4 md:p-6 rounded-2xl border border-gray-800 mb-6 md:mb-8 flex flex-col sm:flex-row gap-3 shadow-lg">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Enter new category name..."
          className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-white transition-all"
        />
        <button 
          onClick={addCategory}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all w-full sm:w-auto"
        >
          <Plus size={20} /> Add
        </button>
      </div>

      {/* Category List Table: Mobile Responsive Wrapper */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[500px]">
            <thead className="bg-gray-800/50 text-gray-400 text-[10px] md:text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Category Name</th>
                <th className="p-4">Products Count</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-800/30 transition-all">
                  <td className="p-4 font-medium flex items-center gap-3 text-white">
                    <Tag size={18} className="text-emerald-500" /> {cat.name}
                  </td>
                  <td className="p-4 text-gray-400 text-sm">{cat.count} items</td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => deleteCategory(cat.id)}
                      className="text-rose-500 hover:text-rose-400 p-2 hover:bg-rose-500/10 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}