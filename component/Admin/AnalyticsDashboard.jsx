import React, { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FiRefreshCw, FiShoppingBag, FiTrendingUp, FiUsers } from 'react-icons/fi';
import api from '../../src/api/axiosInstance';

const initialData = {
  totalRevenue: 0,
  totalOrders: 0,
  averageOrderValue: 0,
  funnel: { views: 0, carts: 0, checkouts: 0, conversionRate: 0 },
  topTrendingProducts: [],
  weeklySales: []
};

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const AnalyticsDashboard = () => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/admin/analytics');
      if (!response.data?.success) throw new Error(response.data?.message || 'Unable to load analytics');
      setData({ ...initialData, ...response.data.data, funnel: { ...initialData.funnel, ...response.data.data.funnel } });
    } catch (requestError) {
      const status = requestError.response?.status;
      if (status === 401) {
        setError('Admin session expired. Please log in again.');
      } else if (status === 403) {
        setError('Admin access is required to view analytics.');
      } else {
        setError(requestError.response?.data?.message || requestError.message || 'Unable to load analytics');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const metrics = [
    { label: 'Views', value: data.funnel.views.toLocaleString(), icon: FiUsers, color: 'text-sky-300' },
    { label: 'Cart Adds', value: data.funnel.carts.toLocaleString(), icon: FiShoppingBag, color: 'text-amber-300' },
    { label: 'Orders', value: data.totalOrders.toLocaleString(), icon: FiTrendingUp, color: 'text-emerald-300' },
    { label: 'Conversion', value: `${Number(data.funnel.conversionRate || 0).toFixed(2)}%`, icon: FiTrendingUp, color: 'text-fuchsia-300' }
  ];

  return (
    <section className="min-h-screen bg-[#05070b] p-5 text-slate-100 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">Commerce overview</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Commerce Analytics</h1>
            <p className="mt-1 text-sm text-slate-400">Order KPIs with seven-day funnel and product momentum.</p>
          </div>
          <button onClick={loadAnalytics} disabled={loading} className="flex items-center gap-2 rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50">
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </header>

        {error && <div className="mb-6 rounded-lg border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">{error}</div>}

        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="border border-slate-800 bg-[#0e141d] p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">{label}</span>
                <Icon className={color} size={20} />
              </div>
              <p className="mt-4 text-3xl font-bold text-white">{loading ? '...' : value}</p>
            </div>
          ))}
        </div>

        <div className="mb-7 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <div className="border border-slate-800 bg-[#0e141d] p-5">
            <div className="mb-5 flex items-end justify-between">
              <div><h2 className="text-lg font-semibold text-white">Weekly sales</h2><p className="text-sm text-slate-500">Revenue and order volume</p></div>
              <div className="text-right"><p className="text-xs text-slate-500">Revenue</p><p className="font-semibold text-emerald-300">{formatCurrency(data.totalRevenue)}</p></div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.weeklySales}>
                  <CartesianGrid stroke="#243142" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#8190a5" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#8190a5" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#111827', border: '1px solid #334155' }} />
                  <Line type="monotone" dataKey="revenue" stroke="#34d399" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="orders" stroke="#38bdf8" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="border border-slate-800 bg-[#0e141d] p-5">
            <h2 className="text-lg font-semibold text-white">Conversion funnel</h2>
            <p className="mb-5 text-sm text-slate-500">Views through completed checkouts</p>
            {[['Views', data.funnel.views], ['Cart adds', data.funnel.carts], ['Checkouts', data.funnel.checkouts]].map(([label, value]) => (
              <div key={label} className="mb-5">
                <div className="mb-2 flex justify-between text-sm"><span className="text-slate-300">{label}</span><span className="font-semibold text-white">{value.toLocaleString()}</span></div>
                <div className="h-2 bg-slate-800"><div className="h-full bg-emerald-400" style={{ width: `${data.funnel.views ? Math.min(100, (value / data.funnel.views) * 100) : 0}%` }} /></div>
              </div>
            ))}
            <p className="mt-8 text-sm text-slate-400">Average order value <strong className="ml-2 text-white">{formatCurrency(data.averageOrderValue)}</strong></p>
          </div>
        </div>

        <div className="border border-slate-800 bg-[#0e141d] p-5">
          <h2 className="text-lg font-semibold text-white">Trending products</h2>
          <p className="mb-5 text-sm text-slate-500">Views and purchases in the selected period</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topTrendingProducts} layout="vertical" margin={{ left: 24, right: 16 }}>
                <CartesianGrid stroke="#243142" strokeDasharray="3 3" />
                <XAxis type="number" stroke="#8190a5" />
                <YAxis type="category" dataKey="name" width={130} stroke="#8190a5" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #334155' }} />
                <Bar dataKey="views" fill="#38bdf8" radius={[0, 3, 3, 0]} />
                <Bar dataKey="purchases" fill="#34d399" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsDashboard;
