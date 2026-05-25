import React, { useState } from 'react';
import { CreditCard, ShieldCheck, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([
    { id: 'TXN-9001', orderId: 'ORD-101', method: 'Razorpay', status: 'Paid', amount: 2500 },
    { id: 'TXN-9002', orderId: 'ORD-102', method: 'COD', status: 'Pending', amount: 800 },
  ]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Pending': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Failed': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default: return 'bg-gray-800 text-gray-400';
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-950 min-h-screen text-gray-200">
      <div className="flex items-center gap-3 mb-6 md:mb-8">
        <ShieldCheck className="text-emerald-500" size={24} md:size={28} />
        <h1 className="text-xl md:text-2xl font-bold text-white">Payment Transactions</h1>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
        {/* Table Wrapper for Horizontal Scrolling */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-gray-800/50 text-gray-400 text-[10px] md:text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Order ID</th>
                <th className="p-4">Method</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {payments.map((pay) => (
                <tr key={pay.id} className="hover:bg-gray-800/30 transition-all text-sm">
                  <td className="p-4 font-mono text-[11px] md:text-sm text-blue-400 font-medium">{pay.id}</td>
                  <td className="p-4 text-gray-300">{pay.orderId}</td>
                  <td className="p-4 flex items-center gap-2 text-white">
                    <CreditCard size={14} className="text-gray-500 shrink-0" /> {pay.method}
                  </td>
                  <td className="p-4 font-bold text-white">₹{pay.amount.toLocaleString('en-IN')}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tighter w-max flex items-center gap-1 ${getStatusStyle(pay.status)}`}>
                      {pay.status === 'Paid' && <CheckCircle size={10} />}
                      {pay.status === 'Pending' && <Clock size={10} />}
                      {pay.status === 'Failed' && <XCircle size={10} />}
                      {pay.status}
                    </span>
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