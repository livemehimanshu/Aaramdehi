import React, { useState, useEffect } from 'react';
import { CreditCard, ShieldCheck, Clock, CheckCircle, XCircle, Search, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../../src/utils/authUtils'; // ✅ Use authUtils.api instance

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ FIX: Using /api/order because it contains all transaction info (Method, Amount, paymentStatus)
      const response = await api.get(`/order`, { // ✅ Use authUtils.api
        // Headers are automatically handled by authUtils.api
      });

      if (response.data.success) {
        setPayments(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      setError(error.response?.data?.message || "Failed to connect to the server. Check if backend is running on Port 5000 or 8000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Pending': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Failed': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default: return 'bg-gray-800 text-gray-400';
    }
  };

  const filteredPayments = payments.filter(pay => {
    const txnId = pay._id || pay.id || '';
    const orderId = pay.orderId || '';
    const matchesSearch = txnId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || pay.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-950 gap-4">
      <Loader2 className="animate-spin text-emerald-500" size={40} />
      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Fetching Transactions...</p>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center text-rose-500 flex flex-col items-center gap-4 bg-gray-950 min-h-screen justify-center">
      <AlertCircle size={48} />
      <p className="font-bold text-lg">{error}</p>
      <button onClick={fetchPayments} className="bg-gray-800 px-6 py-2 rounded-xl text-white font-bold hover:bg-gray-700 transition-all">
        Retry Connection
      </button>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-gray-950 min-h-screen text-gray-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-emerald-500" size={28} />
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">Payment Ledger</h1>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase mt-1">Real-time Transaction Tracking</p>
        </div>
      </div>

      {/* Search & Filter UI */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by Transaction ID or Order ID..."
            className="w-full bg-gray-900 border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-emerald-500 transition-all text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none cursor-pointer text-gray-300"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
        </select>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
        {/* Table Wrapper for Horizontal Scrolling */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-gray-800/50 text-gray-400 text-[10px] md:text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Txn Reference</th>
                <th className="p-4">Order ID</th>
                <th className="p-4">Method</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredPayments.map((pay) => (
                <tr key={pay._id} className="hover:bg-gray-800/30 transition-all text-sm group">
                  <td className="p-4 font-mono text-[11px] md:text-xs text-blue-400 font-bold uppercase">{pay._id.slice(-10)}</td>
                  <td className="p-4 text-gray-400 font-medium">{pay.orderId || pay.orderNumber}</td>
                  <td className="p-4 flex items-center gap-2 text-white">
                    <div className="p-1.5 bg-gray-800 rounded-lg">
                      <CreditCard size={14} className="text-gray-400" />
                    </div>
                    <span className="font-bold uppercase text-[11px]">{pay.paymentMethod || 'N/A'}</span>
                  </td>
                  <td className="p-4 font-black text-white tracking-tight">₹{Number(pay.totalAmount || 0).toLocaleString('en-IN')}</td>
                  <td className="p-4 text-xs text-slate-500 font-bold">{pay.createdAt ? new Date(pay.createdAt).toLocaleDateString('en-GB') : 'N/A'}</td>
                  <td className="p-4 text-right">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 border ${getStatusStyle(pay.paymentStatus || pay.status)}`}>
                      {(pay.paymentStatus === 'Completed' || pay.status === 'Paid') && <CheckCircle size={10} strokeWidth={3} />}
                      {(pay.paymentStatus === 'Pending' || pay.status === 'Pending') && <Clock size={10} strokeWidth={3} />}
                      {pay.status === 'Failed' && <XCircle size={10} strokeWidth={3} />}
                      {pay.paymentStatus || pay.status || 'Unknown'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPayments.length === 0 && (
            <div className="p-20 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">
              No matching transactions found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}