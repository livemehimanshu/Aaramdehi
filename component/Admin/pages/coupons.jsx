import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Ticket, Calendar, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { getAllCouponsAPI, createCouponAPI, deleteCouponAPI } from '../../../src/api/authAndAdminApi';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCoupon, setNewCoupon] = useState({ 
    code: '', 
    discountValue: '', 
    discountType: 'percentage', 
    expiry: '',
    usageLimit: '' // नया फील्ड: कितने यूजर इस्तेमाल कर सकते हैं
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await getAllCouponsAPI();
      if (res.success) setCoupons(res.data || []);
    } catch (error) {
      console.error("Fetch Coupons Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const addCoupon = async () => {
    if (newCoupon.code && newCoupon.discountValue) {
      try {
        setSubmitting(true);
        const payload = {
          code: newCoupon.code.trim(),
          discountType: newCoupon.discountType,
          discountValue: Number(newCoupon.discountValue),
          usageLimit: newCoupon.usageLimit === "" ? null : Number(newCoupon.usageLimit),
          // Backend model uses expiryDate, not expiry
          expiryDate: newCoupon.expiry || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };

        const res = await createCouponAPI(payload);
        if (res.success && res.data) {
          setCoupons([res.data, ...coupons]);
          setNewCoupon({ code: '', discountValue: '', discountType: 'percentage', expiry: '', usageLimit: '' });
          setMessage({ type: 'success', text: "Coupon created successfully! 🎉" });
          setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
      } catch (error) {
        setMessage({ type: 'error', text: error.response?.data?.message || "Failed to create coupon" });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const res = await deleteCouponAPI(id);
      if (res.success) {
        setCoupons(coupons.filter(item => (item._id || item.id) !== id));
        setMessage({ type: 'success', text: "Coupon deleted" });
        setTimeout(() => setMessage({ type: '', text: '' }), 2000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: "Failed to delete coupon" });
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-950 min-h-screen text-gray-200">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-white">Coupon Management</h1>

      {/* Message Feedback */}
      {message.text && (
        <div className={`p-4 mb-6 rounded-xl flex items-center gap-3 border animate-in fade-in slide-in-from-top-2 ${
          message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {/* Add Coupon Form - Responsive Grid */}
      <div className="bg-gray-900 p-4 md:p-6 rounded-2xl border border-gray-800 mb-6 md:mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 shadow-lg items-end">
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
          <label className="block text-[10px] md:text-xs font-semibold text-gray-500 mb-2 uppercase">Type</label>
          <select 
            className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl focus:border-emerald-500 outline-none text-white transition-all"
            value={newCoupon.discountType}
            onChange={(e) => setNewCoupon({...newCoupon, discountType: e.target.value})}
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed (₹)</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] md:text-xs font-semibold text-gray-500 mb-2 uppercase">Value</label>
          <input 
            className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl focus:border-emerald-500 outline-none text-white transition-all" 
            placeholder={newCoupon.discountType === 'percentage' ? "%" : "₹"} 
            type="number" 
            value={newCoupon.discountValue} 
            onChange={(e) => setNewCoupon({...newCoupon, discountValue: e.target.value})} 
          />
        </div>
        <div>
          <label className="block text-[10px] md:text-xs font-semibold text-gray-500 mb-2 uppercase">Usage Limit</label>
          <input 
            className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl focus:border-emerald-500 outline-none text-white transition-all" 
            placeholder="Total Users" 
            type="number" 
            value={newCoupon.usageLimit} 
            onChange={(e) => setNewCoupon({...newCoupon, usageLimit: e.target.value})} 
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
        disabled={submitting}
        className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 text-white p-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg sm:col-span-2 lg:col-span-6 lg:mt-2"
        >
        {submitting ? <Loader2 className="animate-spin" size={20} /> : <><Plus size={20} /> Create</>}
        </button>
      </div>

      {/* Coupons Table - Mobile Responsive Wrapper */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[500px]">
            <thead className="bg-gray-800/50 text-gray-400 text-[10px] md:text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Coupon Info</th>
                <th className="p-4">Usage</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Expiry Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
          {loading ? (
            <tr><td colSpan="4" className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" /></td></tr>
          ) : coupons.map((c) => (
            <tr key={c._id || c.id} className="hover:bg-gray-800/30 transition-all">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Ticket size={18} className="text-blue-400" />
                      </div>
                      <span className="font-mono font-bold text-sm md:text-base text-white">{c.code}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-xs font-bold text-gray-300">
                      {c.usedCount || 0} / {c.usageLimit === null ? 'Unlimited' : c.usageLimit}
                    </div>
                    {c.usageLimit !== null && <div className="w-full bg-gray-700 rounded-full h-1 mt-1"><div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${(c.usedCount / c.usageLimit) * 100}%` }}></div></div>}
                  </td>
                  <td className="p-4">
                    <span className="bg-emerald-500/10 text-emerald-400 px-2 md:px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
                      {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`} OFF
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                      <Calendar size={14} className="text-gray-500" />
                      {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : 'No Expiry'}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                  onClick={() => handleDeleteCoupon(c._id || c.id)} 
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