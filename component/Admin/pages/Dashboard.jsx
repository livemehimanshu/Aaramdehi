import React, { useState, useEffect } from 'react';
import { Folder, Package, TrendingUp, Loader2, AlertCircle, Plus } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getAdminStatsAPI } from '../../../src/api/authAndAdminApi';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Static Data for Chart (Isse baad mein API se replace kar sakte ho)
  const profitData = [
    { name: '10 AM', value: 2000 }, { name: '11 AM', value: 3000 },
    { name: '12 PM', value: 2500 }, { name: '1 PM', value: 4500 },
    { name: '2 PM', value: 3800 }, { name: '3 PM', value: 5000 },
  ];

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const statsResponse = await getAdminStatsAPI();
        if (isMounted && statsResponse.success) {
          const data = statsResponse.data;
          setStats([
            { 
              label: 'Total Products', 
              value: data.totalProducts || 0, 
              growth: '+12.40%', 
              isPositive: true, 
              icon: Folder, 
              color: 'text-blue-400', 
              bg: 'bg-blue-500/10' 
            },
            { 
              label: 'Total Stock', 
              value: data.totalStock || 0, 
              growth: '+32.40%', 
              isPositive: true, 
              icon: Package, 
              color: 'text-emerald-400', 
              bg: 'bg-emerald-500/10' 
            },
            { 
              label: 'Low Stock Items', 
              value: data.lowStockProducts?.length || 0, 
              growth: data.lowStockProducts?.length > 0 ? '⚠️ Alert' : 'Normal', 
              isPositive: data.lowStockProducts?.length === 0, 
              icon: AlertCircle, 
              color: data.lowStockProducts?.length === 0 ? 'text-emerald-400' : 'text-rose-400', 
              bg: data.lowStockProducts?.length === 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10' 
            },
          ]);
          setLowStockProducts(data.lowStockProducts || []);
          setRecentProducts(data.recentProducts || []);
        } else if (isMounted) {
          setError(statsResponse.message || 'Permission denied or Server error');
        }
      } catch (err) {
        if (isMounted) {
          console.error('Dashboard Sync Error:', err);
          setError(err.response?.data?.message || err.message || 'Server unreachable. Check if backend is running on Port 5000 or 8000.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950">
        <div className="text-center">
          <Loader2 className="animate-spin text-emerald-500 mx-auto mb-4" size={40} />
          <p className="text-slate-400 font-medium">Syncing Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-10 pb-16 bg-gray-950 min-h-screen p-4 md:p-6 lg:p-8">
      
      {/* Error Alert */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl text-rose-400 flex items-center gap-3 animate-in fade-in duration-300">
          <AlertCircle size={20} />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* 1. Welcome Banner */}
      <div className="bg-gray-900 p-6 md:p-10 rounded-3xl md:rounded-[40px] border border-gray-800 shadow-2xl flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-6">
        <div>
          <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter">Good Morning, Admin 👋</h2>
          <p className="text-gray-400 mt-2 text-sm md:text-lg font-medium">Tracking Aaramdehi's performance and inventory.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/add-product')} 
          className="group bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 md:px-8 py-3.5 rounded-2xl flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform" />
          Add New Product
        </button>
      </div>

      {/* 2. Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-gray-900 p-6 md:p-8 rounded-[32px] border border-gray-800 hover:border-gray-700 transition-colors group">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 md:p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <div className={`text-[10px] md:text-xs font-bold ${stat.isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'} px-3 py-1.5 rounded-full flex items-center gap-1`}>
                <TrendingUp size={12} /> {stat.growth}
              </div>
            </div>
            <p className="text-[11px] text-gray-500 font-black uppercase tracking-[0.2em]">{stat.label}</p>
            <h3 className="text-3xl md:text-4xl font-black mt-2 text-white">
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </h3>
          </div>
        ))}
      </div>

      {/* 3. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 bg-gray-900 p-6 md:p-10 rounded-[40px] border border-gray-800">
          <h3 className="text-lg md:text-xl font-black text-white mb-8">Total Earnings Trend</h3>
          <div className="h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={profitData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderRadius: '16px', border: '1px solid #374151', color: '#fff' }} 
                  itemStyle={{ color: '#10b981' }}
                />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-900 p-6 md:p-10 rounded-[40px] border border-gray-800 flex flex-col items-center">
          <h3 className="text-lg font-bold text-white w-full mb-8 text-center md:text-left">Device Traffic</h3>
          <div className="w-full h-[220px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[{value: 65}, {value: 35}]} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                  <Cell fill="#3b82f6" stroke="none" />
                  <Cell fill="#10b981" stroke="none" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-6 mt-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div> Desktop
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div> Mobile
            </div>
          </div>
        </div>
      </div>

      {/* 4. Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock */}
        <div className="bg-gray-900 rounded-[40px] border border-gray-800 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
            <h3 className="text-lg font-black text-white">🚨 Low Stock Alerts</h3>
            <span className="text-rose-400 text-xs font-bold bg-rose-500/10 px-3 py-1 rounded-full">Actions Needed</span>
          </div>
          <div className="flex-1 max-h-[400px] overflow-y-auto">
            {lowStockProducts.length > 0 ? (
              <div className="divide-y divide-gray-800">
                {lowStockProducts.map((product) => (
                  <div key={product._id} className="p-6 bg-rose-500/5 border-l-4 border-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer group" onClick={() => navigate('/admin/products')}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-rose-400 group-hover:text-rose-300 transition-colors">{product.name}</p>
                        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">SKU: {product._id?.slice(-6)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-rose-500 font-black animate-pulse">{product.stock} left</p>
                        <p className="text-[10px] text-gray-600 font-bold uppercase mt-1">Refill Soon</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-20 text-center text-slate-500 font-medium">
                <p>✅ All inventory levels are healthy</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-gray-900 rounded-[40px] border border-gray-800 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
            <h3 className="text-lg font-black text-white">📦 Recent Additions</h3>
            <button onClick={() => navigate('/admin/products')} className="text-blue-400 text-xs font-bold hover:underline">View All</button>
          </div>
          <div className="flex-1 max-h-[400px] overflow-y-auto">
            {recentProducts.length > 0 ? (
              <div className="divide-y divide-gray-800">
                {recentProducts.map((product) => (
                  <div key={product._id} className="p-6 hover:bg-gray-800/40 transition-colors cursor-pointer" onClick={() => navigate('/admin/products')}>
                    <div className="flex gap-4 items-center">
                      <div className="w-14 h-14 rounded-2xl bg-gray-800 border border-gray-700 overflow-hidden flex-shrink-0">
                        {product.thumbnail ? (
                          <img src={product.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600"><Package size={20}/></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white truncate">{product.name}</p>
                        <p className="text-emerald-400 font-black mt-1">₹{product.sellingPrice?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-20 text-center text-slate-500">
                <p>No products yet.</p>
                <button onClick={() => navigate('/admin/add-product')} className="mt-4 text-blue-500 font-bold underline">Add your first product</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;