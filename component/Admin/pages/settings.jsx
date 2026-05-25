import React, { useState } from 'react';
import { Settings, Save, Lock, Store, User } from 'lucide-react';

export default function SettingsPage() {
  const [storeInfo, setStoreInfo] = useState({
    name: 'Aaramdehi',
    email: 'admin@aaramdehi.com',
    currency: 'INR (₹)',
  });

  return (
    <div className="p-4 md:p-8 bg-gray-950 min-h-screen text-gray-200">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 flex items-center gap-3 text-white">
        <Settings size={28} className="text-emerald-500" /> Settings
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Store Profile Section */}
        <div className="bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-800 shadow-xl">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
            <Store size={20} className="text-blue-500" /> Store Details
          </h2>
          <div className="space-y-4">
            <input 
              className="w-full p-4 bg-gray-950 border border-gray-800 rounded-xl focus:border-emerald-500 outline-none text-white transition-all" 
              value={storeInfo.name} 
              onChange={(e) => setStoreInfo({...storeInfo, name: e.target.value})} 
              placeholder="Store Name" 
            />
            <input 
              className="w-full p-4 bg-gray-950 border border-gray-800 rounded-xl focus:border-emerald-500 outline-none text-white transition-all" 
              value={storeInfo.email} 
              onChange={(e) => setStoreInfo({...storeInfo, email: e.target.value})} 
              placeholder="Admin Email" 
            />
            <select 
              className="w-full p-4 bg-gray-950 border border-gray-800 rounded-xl focus:border-emerald-500 outline-none text-white transition-all cursor-pointer"
              value={storeInfo.currency}
              onChange={(e) => setStoreInfo({...storeInfo, currency: e.target.value})}
            >
              <option>INR (₹)</option>
              <option>USD ($)</option>
            </select>
            <button className="w-full bg-emerald-600 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all font-semibold">
              <Save size={18} /> Update Store
            </button>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-800 shadow-xl">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
            <Lock size={20} className="text-rose-500" /> Security
          </h2>
          <div className="space-y-4">
            <input type="password" placeholder="Old Password" className="w-full p-4 bg-gray-950 border border-gray-800 rounded-xl focus:border-rose-500 outline-none text-white transition-all" />
            <input type="password" placeholder="New Password" className="w-full p-4 bg-gray-950 border border-gray-800 rounded-xl focus:border-rose-500 outline-none text-white transition-all" />
            <button className="w-full bg-rose-600 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-rose-700 transition-all font-semibold">
              <User size={18} /> Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}