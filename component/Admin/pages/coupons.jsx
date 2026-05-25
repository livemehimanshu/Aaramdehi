import React, { useState } from 'react';
import { Plus, Trash2, Ticket, Calendar } from 'lucide-react';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([
    { id: 1, code: 'AARAM20', discount: '20', expiry: '2026-12-31' },
    { id: 2, code: 'WELCOME10', discount: '10', expiry: '2026-06-01' },
  ]);
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: '', expiry: '' });

  const addCoupon = () => {
    if (newCoupon.code && newCoupon.discount) {
      setCoupons([...coupons, { id: Date.now(), ...newCoupon }]);
      setNewCoupon({ code: '', discount: '', expiry: '' });
    }
  };

  const deleteCoupon = (id) => {
    setCoupons(coupons.filter(item => item.id !== id));
  };

  return (
    <div className="p-4 md:p-8 bg-gray-950 min-h-screen text-gray-200">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-white">Coupon Management</h1>

      {/* Add Coupon Form - Responsive Grid */}
      <div className="bg-gray-900 p-4 md:p-6 rounded-2xl border border-gray-800 mb-6 md:mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shadow-lg">
        <div>
          <label className="block text-[10px] md:text-xs font-semibold text-gray-500 mb-2 uppercase">Coupon Code</label>
          <input 
            className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl focus:border-emerald-500 outline-none text-white transition-all uppercase" 
            placeholder="e.g. SAVE20" 
            value={newCoupon.code} 
            onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} 
          />
        </div>
        <div>
          <label className="block text-[10px] md:text-xs font-semibold text-gray-500 mb-2 uppercase">Discount (%)</label>
          <input 
            className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl focus:border-emerald-500 outline-none text-white transition-all" 
            placeholder="%" 
            type="number" 
            value={newCoupon.discount} 
            onChange={(e) => setNewCoupon({...newCoupon, discount: e.target.value})} 
          />
        </div>
        <div>
          <label className="block text-[10px] md:text-xs font-semibold text-gray-500 mb-2 uppercase">Expiry Date</label>
          <input 
            className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl focus:border-emerald-500 outline-none text-white transition-all" 
            type="date" 
            value={newCoupon.expiry} 
            onChange={(e) => setNewCoupon({...newCoupon, expiry: e.target.value})} 
          />
        </div>
        <button 
          onClick={addCoupon} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg sm:col-span-2 lg:col-span-1"
        >
          <Plus size={20} /> Create
        </button>
      </div>

      {/* Coupons Table - Mobile Responsive Wrapper */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[500px]">
            <thead className="bg-gray-800/50 text-gray-400 text-[10px] md:text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Coupon Info</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Expiry Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-gray-800/30 transition-all">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Ticket size={18} className="text-blue-400" />
                      </div>
                      <span className="font-mono font-bold text-sm md:text-base text-white">{c.code}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="bg-emerald-500/10 text-emerald-400 px-2 md:px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
                      {c.discount}% OFF
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                      <Calendar size={14} className="text-gray-500" />
                      {c.expiry}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => deleteCoupon(c.id)} 
                      className="text-rose-500 hover:text-rose-400 p-2 hover:bg-rose-500/10 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
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