import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, ShoppingBag, DollarSign, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { getAnalyticsSummaryAPI } from '../../../src/api/authAndAdminApi';

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
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAnalyticsSummaryAPI();
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.message || "Failed to fetch analytics summary");
      }
    } catch (err) {
      console.error("Analytics Error:", err);
      setError("Could not connect to analysis engine. Check if server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-950 gap-4">
      <Loader2 className="animate-spin text-emerald-500" size={40} />
      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Processing Store Data...</p>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center text-rose-500 flex flex-col items-center gap-4 bg-gray-950 min-h-screen justify-center">
      <AlertCircle size={48} />
      <p className="font-bold text-lg">{error}</p>
      <button onClick={fetchAnalytics} className="bg-gray-800 px-6 py-2 rounded-xl text-white font-bold hover:bg-gray-700 transition-all">
        Retry Connection
      </button>
    </div>
  );

  // Fallback charts if backend sends empty series
  const chartData = data?.timeSeries || [{ name: 'No Data', sales: 0, revenue: 0 }];

  return (
    <div className="p-4 md:p-8 bg-gray-950 min-h-screen text-gray-200 space-y-6 md:space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Analytics Overview</h1>
        <button onClick={fetchAnalytics} className="p-2 hover:bg-gray-800 rounded-lg transition-all text-gray-400" title="Refresh Analytics">
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Total Sales" value={`₹${(data?.totalSales || 0).toLocaleString('en-IN')}`} icon={ShoppingBag} color="bg-blue-500" />
        <StatCard title="Total Revenue" value={`₹${(data?.totalRevenue || 0).toLocaleString('en-IN')}`} icon={DollarSign} color="bg-emerald-500" />
        <StatCard title="New Users" value={(data?.totalUsers || 0).toLocaleString()} icon={Users} color="bg-purple-500" />
        <StatCard title="Growth" value={`${data?.growth || 0}%`} icon={TrendingUp} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-gray-900 p-4 md:p-8 rounded-3xl border border-gray-800">
          <h2 className="text-lg font-bold text-white mb-6">Sales Trends</h2>
          <div className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-900 p-4 md:p-8 rounded-3xl border border-gray-800">
          <h2 className="text-lg font-bold text-white mb-6">Revenue Breakdown</h2>
          <div className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
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