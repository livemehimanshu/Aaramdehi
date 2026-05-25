import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, ShoppingBag, DollarSign } from 'lucide-react';

const analyticsData = [
  { name: 'Jan', sales: 4000, revenue: 2400 },
  { name: 'Feb', sales: 3000, revenue: 1398 },
  { name: 'Mar', sales: 2000, revenue: 9800 },
  { name: 'Apr', sales: 2780, revenue: 3908 },
  { name: 'May', sales: 1890, revenue: 4800 },
];

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 flex items-center justify-between shadow-lg">
    <div>
      <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">{title}</p>
      <h3 className="text-xl md:text-2xl font-bold text-white mt-1">{value}</h3>
    </div>
    <div className={`p-3 md:p-4 rounded-xl ${color} bg-opacity-10`}>
      <Icon className={color.replace('bg-', 'text-')} size={20} />
    </div>
  </div>
);

const AnalyticsPage = () => {
  return (
    // Responsive Padding: Mobile (p-4), Tablet/Desktop (p-8)
    <div className="p-4 md:p-8 bg-gray-950 min-h-screen text-gray-200 space-y-6 md:space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold text-white">Analytics Overview</h1>

      {/* Stats Grid: Mobile(1 col), Tablet(2 cols), Desktop(4 cols) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Total Sales" value="₹1.24L" icon={ShoppingBag} color="bg-blue-500" />
        <StatCard title="Total Revenue" value="₹8.50L" icon={DollarSign} color="bg-emerald-500" />
        <StatCard title="New Users" value="1,240" icon={Users} color="bg-purple-500" />
        <StatCard title="Growth" value="+24.5%" icon={TrendingUp} color="bg-orange-500" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        
        {/* Sales Trend Chart */}
        <div className="bg-gray-900 p-4 md:p-8 rounded-3xl border border-gray-800">
          <h2 className="text-lg font-bold text-white mb-6">Sales Trends</h2>
          <div className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-gray-900 p-4 md:p-8 rounded-3xl border border-gray-800">
          <h2 className="text-lg font-bold text-white mb-6">Revenue Breakdown</h2>
          <div className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '12px' }} />
                <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;