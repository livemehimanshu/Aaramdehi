import React, { useState, useEffect } from 'react';
import { Package, AlertCircle, Plus, Trash2, Edit, Loader2 } from 'lucide-react';
import { getAllProductsAPI } from '../../../src/api/authAndAdminApi';
import { useNavigate } from 'react-router-dom';

export default function Inventory() { // Match with PascalCase naming convention
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await getAllProductsAPI({ limit: 100 });
      if (res.success) setInventory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  return (
    <div className="p-4 md:p-8 bg-gray-950 min-h-screen text-gray-200">
      {/* Header - Stacked on Mobile, Row on Desktop */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Stock Inventory</h1>
          <p className="text-slate-500 text-xs mt-1">Monitor product availability and SKU levels</p>
        </div>
        <button onClick={() => navigate('/admin/add-product')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all font-semibold w-full sm:w-auto justify-center">
          <Plus size={20} /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>
      ) : (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-gray-800/50 text-gray-400 text-[10px] md:text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">SKU/ID</th>
                  <th className="p-4 text-center">Current Stock</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {inventory.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-800/30 transition-all">
                    <td className="p-4 font-medium flex items-center gap-3 text-white">
                      <img src={item.thumbnail} className="w-8 h-8 rounded bg-gray-800 object-cover" /> {item.name}
                    </td>
                    <td className="p-4 text-xs font-mono text-gray-500 uppercase">{item._id.slice(-6)}</td>
                    <td className="p-4 text-center">
                      <span className={`font-bold text-sm ${item.stock < 10 ? 'text-rose-500' : 'text-white'}`}>
                        {item.stock} Units
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-sm">₹{item.sellingPrice?.toLocaleString()}</td>
                    <td className="p-4">
                      {item.stock < 10 ? (
                        <span className="text-rose-400 flex items-center gap-1 text-[10px] md:text-xs font-bold bg-rose-500/10 px-2 py-1 rounded-lg w-fit">
                          <AlertCircle size={14} /> Low Stock
                        </span>
                      ) : (
                        <span className="text-emerald-400 text-[10px] md:text-xs font-semibold bg-emerald-500/10 px-2 py-1 rounded-lg">Healthy</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-3">
                        <Edit size={16} onClick={() => navigate(`/admin/edit-product/${item._id}`)} className="text-gray-400 hover:text-white cursor-pointer" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}