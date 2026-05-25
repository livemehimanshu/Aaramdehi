import React from 'react';
import { Folder, DollarSign, Package, TrendingUp } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const stats = [
  { label: 'New Orders', value: '1,590', growth: '+32.40%', isPositive: true, icon: Folder, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { label: 'Revenue', value: '₹57,890', growth: '+12.40%', isPositive: true, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: 'Shipment', value: '12,390', growth: '+18.40%', isPositive: true, icon: Package, color: 'text-rose-400', bg: 'bg-rose-500/10' },
];

const profitData = [
  { name: '10 AM', value: 2000 }, { name: '11 AM', value: 3000 },
  { name: '12 PM', value: 2500 }, { name: '1 PM', value: 4500 },
  { name: '2 PM', value: 3800 }, { name: '3 PM', value: 5000 },
];

const recentOrdersData = [
  { id: '#35471', customer: 'Donny Albus', time: 'Aug 6, 2023', status: 'Added' },
  { id: '#35472', customer: 'Monty Prismic', time: 'Mar 31, 2024', status: 'Edited' },
  { id: '#35473', customer: 'Aaramdehi User', time: 'Nov 8, 2023', status: 'Added' },
];

const Dashboard = () => {
  return (
    <div className="space-y-6 md:space-y-10 pb-16 bg-gray-950 min-h-screen p-4 md:p-6 lg:p-8">
      
      {/* 1. Welcome Banner - Responsive Padding */}
      <div className="bg-gray-900 p-6 md:p-10 rounded-3xl md:rounded-[40px] border border-gray-800 shadow-xl flex flex-col md:flex-row justify-between items-center text-center md:text-left">
         <div>
            <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter">Good Morning, Himanshu 👋</h2>
            <p className="text-gray-400 mt-2 md:mt-3 text-sm md:text-lg font-medium">Here’s what’s happening on Aaramdehi today.</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 md:px-8 py-3 rounded-xl md:rounded-2xl text-sm mt-6 transition-all">
                + Add Product
            </button>
         </div>
      </div>

      {/* 2. Top Stats - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-gray-900 p-6 md:p-8 rounded-2xl md:rounded-[32px] border border-gray-800 shadow-sm">
            <div className="flex justify-between items-start mb-4 md:mb-5">
              <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={20} className="md:size-[26px]" />
              </div>
              <div className="text-[10px] md:text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 md:px-3 py-1 rounded-full">
                <TrendingUp size={12} className="inline mr-1"/> {stat.growth}
              </div>
            </div>
            <p className="text-[10px] md:text-[11px] text-gray-500 font-black uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl md:text-3xl font-black mt-1 text-white">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* 3. Profit Line Chart */}
        <div className="lg:col-span-2 bg-gray-900 p-6 md:p-10 rounded-3xl md:rounded-[40px] border border-gray-800 shadow-sm">
          <h3 className="text-lg md:text-xl font-black text-white mb-6 md:mb-10">Total Earnings</h3>
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={profitData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }} />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Device Traffic */}
        <div className="bg-gray-900 p-6 md:p-10 rounded-3xl md:rounded-[40px] border border-gray-800 shadow-sm flex flex-col items-center">
          <h3 className="text-base md:text-lg font-bold text-white w-full mb-6 md:mb-10">Device Traffic</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={[{value: 65}, {value: 35}]} innerRadius={50} outerRadius={70} dataKey="value">
                <Cell fill="#3b82f6" /><Cell fill="#10b981" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. Recent Orders Table - Mobile Responsive Wrapper */}
      <div className="bg-gray-900 rounded-3xl md:rounded-[40px] border border-gray-800 overflow-hidden">
         <div className="overflow-x-auto">
           <table className="w-full text-left text-xs md:text-sm min-w-[500px]">
              <thead className="bg-gray-800 text-gray-400 text-[10px] md:text-[11px] uppercase font-black">
                 <tr>
                    <th className="px-6 md:px-8 py-4 md:py-5">ORDER ID</th>
                    <th className="px-6 md:px-8 py-4 md:py-5">CUSTOMER</th>
                    <th className="px-6 md:px-8 py-4 md:py-5">DATE</th>
                    <th className="px-6 md:px-8 py-4 md:py-5">STATUS</th>
                 </tr>
              </thead>
              <tbody className="text-gray-300">
                 {recentOrdersData.map((order, i) => (
                    <tr key={i} className="border-t border-gray-800 hover:bg-gray-800/50">
                       <td className="px-6 md:px-8 py-4 md:py-5 font-mono text-gray-500">{order.id}</td>
                       <td className="px-6 md:px-8 py-4 md:py-5 font-bold text-white">{order.customer}</td>
                       <td className="px-6 md:px-8 py-4 md:py-5">{order.time}</td>
                       <td className="px-6 md:px-8 py-4 md:py-5 font-bold text-emerald-400">{order.status}</td>
                    </tr>
                 ))}
              </tbody>
           </table>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;