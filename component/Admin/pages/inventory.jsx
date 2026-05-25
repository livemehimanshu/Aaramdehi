import React, { useState } from 'react';
import { Package, AlertCircle, Plus, Trash2, Edit } from 'lucide-react';

export default function InventoryPage() {
  const [inventory, setInventory] = useState([
    { id: 1, name: 'Wooden Chair', category: 'Furniture', quantity: 15, price: 2500 },
    { id: 2, name: 'Wall Clock', category: 'Decor', quantity: 2, price: 800 },
  ]);

  const updateQuantity = (id, change) => {
    setInventory(inventory.map(item => 
      item.id === id ? { ...item, quantity: Math.max(0, item.quantity + change) } : item
    ));
  };

  return (
    <div className="p-4 md:p-8 bg-gray-950 min-h-screen text-gray-200">
      {/* Header - Stacked on Mobile, Row on Desktop */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Inventory</h1>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all font-semibold w-full sm:w-auto justify-center">
          <Plus size={20} /> Add Product
        </button>
      </div>

      {/* Inventory Table Wrapper */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-gray-800/50 text-gray-400 text-[10px] md:text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Product Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-800/30 transition-all">
                  <td className="p-4 font-medium flex items-center gap-3 text-white">
                    <Package size={18} className="text-blue-500 shrink-0" /> {item.name}
                  </td>
                  <td className="p-4 text-sm text-gray-400">{item.category}</td>
                  <td className="p-4 flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id, -1)} className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg font-bold transition-all">-</button>
                    <span className="font-bold text-white min-w-[25px] text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg font-bold transition-all">+</button>
                  </td>
                  <td className="p-4 font-semibold text-sm">₹{item.price}</td>
                  <td className="p-4">
                    {item.quantity < 5 ? (
                      <span className="text-rose-400 flex items-center gap-1 text-[10px] md:text-xs font-bold bg-rose-500/10 px-2 py-1 rounded-lg w-fit">
                        <AlertCircle size={14} /> Low Stock
                      </span>
                    ) : (
                      <span className="text-emerald-400 text-[10px] md:text-xs font-semibold bg-emerald-500/10 px-2 py-1 rounded-lg">In Stock</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-3">
                      <Edit size={16} className="text-gray-400 hover:text-white cursor-pointer" />
                      <Trash2 size={16} className="text-rose-500 hover:text-rose-400 cursor-pointer" />
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
}