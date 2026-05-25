import React, { useState } from 'react';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState([
    { id: 'ORD-101', customer: 'Himanshu S.', items: 'Wooden Chair', amount: 2500, status: 'Pending' },
    { id: 'ORD-102', customer: 'Neeraj S.', items: 'Wall Clock', amount: 800, status: 'Shipped' },
    { id: 'ORD-103', customer: 'Rahul K.', items: 'Sofa Set', amount: 15000, status: 'Delivered' },
  ]);

  const handleStatusUpdate = (id, newStatus) => {
    setOrders(orders.map(order => 
      order.id === id ? { ...order, status: newStatus } : order
    ));
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-lg text-[10px] md:text-xs font-bold flex w-max items-center gap-1";
    switch (status) {
      case 'Pending': 
        return <span className={`${baseClasses} bg-amber-500/10 text-amber-400`}><Clock size={12}/> Pending</span>;
      case 'Shipped': 
        return <span className={`${baseClasses} bg-blue-500/10 text-blue-400`}><Truck size={12}/> Shipped</span>;
      case 'Delivered': 
        return <span className={`${baseClasses} bg-emerald-500/10 text-emerald-400`}><CheckCircle size={12}/> Delivered</span>;
      default: return null;
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-950 min-h-screen text-gray-200">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-white">Customer Orders</h1>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-lg overflow-hidden">
        {/* Table Wrapper for Horizontal Scrolling on Mobile */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-gray-800/50 text-gray-400 text-[10px] md:text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Product</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-800/30 transition-all text-sm">
                  <td className="p-4 font-mono font-bold text-blue-400">{order.id}</td>
                  <td className="p-4 text-white font-medium">{order.customer}</td>
                  <td className="p-4 text-gray-400">{order.items}</td>
                  <td className="p-4 font-semibold text-emerald-400">₹{order.amount}</td>
                  <td className="p-4">{getStatusBadge(order.status)}</td>
                  <td className="p-4">
                    <select 
                      className="p-2 bg-gray-950 border border-gray-800 rounded-lg text-xs text-gray-300 focus:border-emerald-500 outline-none cursor-pointer"
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
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