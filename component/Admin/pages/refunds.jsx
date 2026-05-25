import React, { useState } from 'react';
import { RefreshCcw, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function RefundsPage() {
  const [refunds, setRefunds] = useState([
    { id: 'REF-8001', orderId: 'ORD-101', customer: 'Himanshu S.', amount: 2500, status: 'Requested' },
    { id: 'REF-8002', orderId: 'ORD-103', customer: 'Rahul K.', amount: 15000, status: 'Processing' },
    { id: 'REF-8003', orderId: 'ORD-105', customer: 'Suresh M.', amount: 4200, status: 'Refunded' },
  ]);

  const updateRefundStatus = (id, newStatus) => {
    setRefunds(refunds.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Requested': return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      case 'Processing': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'Refunded': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      default: return 'bg-gray-800 text-gray-400';
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-950 min-h-screen text-gray-200">
      <div className="flex items-center gap-3 mb-6 md:mb-8">
        <RefreshCcw className="text-orange-500" size={24} md:size={28} />
        <h1 className="text-xl md:text-2xl font-bold text-white">Refund Management</h1>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
        {/* Table Wrapper for Horizontal Scrolling */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-gray-800/50 text-gray-400 text-[10px] md:text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Refund ID</th>
                <th className="p-4">Order ID</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {refunds.map((ref) => (
                <tr key={ref.id} className="hover:bg-gray-800/30 transition-all text-sm">
                  <td className="p-4 font-mono text-[11px] md:text-sm text-blue-400 font-medium">{ref.id}</td>
                  <td className="p-4 font-bold text-white">{ref.orderId}</td>
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
                        onClick={() => updateRefundStatus(ref.id, 'Refunded')}
                        className="bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white border border-emerald-600/20 px-3 py-1 rounded-lg text-[10px] md:text-xs font-bold transition-all"
                      >
                        Approve
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