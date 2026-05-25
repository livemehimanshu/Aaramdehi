import React, { useState, useEffect } from 'react';
import { Trash2, CheckCircle, Search, Loader2 } from 'lucide-react';

export default function AppointmentsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Simulated API Fetch (Jab backend ready ho, yaha axios.get use karein)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Mock Data - Replace with: const res = await axios.get('/api/orders');
      const data = [
        { id: 'ORD001', customer: 'Himanshu S.', status: 'Pending', amount: '₹1200' },
        { id: 'ORD002', customer: 'Neeraj S.', status: 'Delivered', amount: '₹3400' },
        { id: 'ORD003', customer: 'Rahul K.', status: 'Pending', amount: '₹850' },
      ];
      setOrders(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const updateStatus = (id) => {
    setOrders(orders.map(order => 
      order.id === id ? { ...order, status: 'Delivered' } : order
    ));
    // Yaha backend call karein: axios.patch(`/api/orders/${id}`, { status: 'Delivered' });
  };

  const deleteOrder = (id) => {
    setOrders(orders.filter(order => order.id !== id));
    // Yaha backend call karein: axios.delete(`/api/orders/${id}`);
  };

  const filteredOrders = orders.filter(o => 
    o.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Appointment Management</h1>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search customer..." 
            className="pl-10 p-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
      ) : (
        <div className="overflow-x-auto border rounded-xl">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Order ID</th>
                <th className="p-4 font-semibold text-gray-600">Customer</th>
                <th className="p-4 font-semibold text-gray-600">Status</th>
                <th className="p-4 font-semibold text-gray-600">Amount</th>
                <th className="p-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{order.id}</td>
                  <td className="p-4 text-gray-700">{order.customer}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-700">{order.amount}</td>
                  <td className="p-4 flex gap-4">
                    {order.status === 'Pending' && (
                      <button onClick={() => updateStatus(order.id)} className="text-blue-600 hover:text-blue-800">
                        <CheckCircle size={20} />
                      </button>
                    )}
                    <button onClick={() => deleteOrder(order.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}