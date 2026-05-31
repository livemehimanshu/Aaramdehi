import React, { useState, useEffect } from 'react';
import { RefreshCcw, CheckCircle, Clock, AlertTriangle, Search, Loader2 } from 'lucide-react';
import { getAllRefundsAPI, updateRefundStatusAPI } from '../../../src/api/authAndAdminApi';

export default function RefundsPage() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const res = await getAllRefundsAPI();
      if (res.success) setRefunds(res.data || []);
    } catch (err) {
      console.error("Fetch Refunds Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      const res = await updateRefundStatusAPI(id, newStatus);
      if (res.success) {
        setRefunds(prev => prev.map(r => (r._id === id || r.id === id) ? { ...r, status: newStatus } : r));
      }
    } catch (err) {
      alert("Status update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Requested': return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      case 'Processing': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'Refunded': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      default: return 'bg-gray-800 text-gray-400';
    }
  };

  const filteredRefunds = refunds.filter(ref => 
    (ref.orderId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ref.customerName || ref.userId?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 bg-gray-950 min-h-screen text-gray-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="flex items-center gap-3">
          <RefreshCcw className="text-orange-500" size={28} />
          <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Refund Ledger</h1>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by Order ID or Customer..."
            className="w-full bg-gray-900 border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-orange-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
        {/* Table Wrapper for Horizontal Scrolling */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-gray-800/50 text-gray-400 text-[10px] md:text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Refund ID</th>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan="6" className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-orange-500" /></td></tr>
              ) : filteredRefunds.map((ref) => (
                <tr key={ref._id || ref.id} className="hover:bg-gray-800/30 transition-all text-sm">
                  <td className="p-4 font-mono text-[11px] md:text-sm text-blue-400 font-medium uppercase">{(ref._id || ref.id).slice(-8)}</td>
                  <td className="p-4 font-bold text-white">{ref.orderId}</td>
                  <td className="p-4 text-gray-400">{ref.customerName || ref.userId?.name || 'Guest'}</td>
                  <td className="p-4 font-semibold text-gray-300">₹{ref.amount.toLocaleString('en-IN')}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1.5 w-max ${getStatusStyle(ref.status)}`}>
                      {ref.status === 'Requested' && <AlertTriangle size={10} />}
                      {ref.status === 'Processing' && <Clock size={10} />}
                      {ref.status === 'Refunded' && <CheckCircle size={10} />}
                      {ref.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {ref.status !== 'Refunded' ? (
                      <button 
                        onClick={() => handleUpdateStatus(ref._id || ref.id, 'Refunded')}
                        disabled={updatingId === (ref._id || ref.id)}
                        className="bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white border border-emerald-600/20 px-3 py-1 rounded-lg text-[10px] md:text-xs font-bold transition-all disabled:opacity-50"
                      >
                        {updatingId === (ref._id || ref.id) ? '...' : 'Approve'}
                      </button>
                    ) : (
                      <span className="text-gray-600 text-[10px] md:text-xs italic">Completed</span>
                    )}
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