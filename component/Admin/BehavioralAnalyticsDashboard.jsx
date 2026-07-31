import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiTrendingUp, FiUsers, FiShoppingCart, FiLogOut } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../src/api/axiosInstance';

const BehavioralAnalyticsDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

  /**
   * Fetch high-intent sessions
   */
  const fetchHighIntentSessions = async () => {
    try {
      const response = await api.get('/analytics/high-intent-sessions?limit=50');
      const data = response.data;
      if (data.success) {
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to fetch sessions');
    }
  };

  /**
   * Fetch conversion metrics
   */
  const fetchMetrics = async () => {
    try {
      const response = await api.get('/analytics/conversion-metrics');
      const data = response.data;
      if (data.success) {
        setMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  /**
   * Load data
   */
  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchHighIntentSessions(), fetchMetrics()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    // Auto-refresh every 10 seconds
    let interval;
    if (autoRefresh) {
      interval = setInterval(loadData, 10000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString();
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-[#05070b] p-6 text-slate-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Behavioral Analytics Dashboard</h1>
            <p className="text-slate-400 mt-1">Real-time monitoring of high-intent user sessions</p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-900"
              />
              <span className="text-sm font-medium text-slate-300">Auto-refresh (10s)</span>
            </label>
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 bg-[#2563eb] text-white px-6 py-3 rounded-lg hover:bg-[#1d4ed8] transition disabled:opacity-50"
            >
              <FiRefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Total Sessions */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl shadow-2xl shadow-black/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 font-medium">Total Sessions</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {metrics.totalSessions}
                  </p>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl">
                  <FiUsers size={24} className="text-[#2563eb]" />
                </div>
              </div>
            </div>

            {/* High-Intent Sessions */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl shadow-2xl shadow-black/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 font-medium">High-Intent</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {metrics.highIntentSessions}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{metrics.highIntentRate}</p>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl">
                  <FiTrendingUp size={24} className="text-orange-400" />
                </div>
              </div>
            </div>

            {/* Conversions */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl shadow-2xl shadow-black/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 font-medium">Conversions</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {metrics.convertedSessions}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{metrics.conversionRate}</p>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl">
                  <FiShoppingCart size={24} className="text-emerald-400" />
                </div>
              </div>
            </div>

            {/* Abandoned */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl shadow-2xl shadow-black/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 font-medium">Abandoned</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {metrics.abandonedSessions}
                  </p>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl">
                  <FiLogOut size={24} className="text-rose-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sessions Table */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl shadow-2xl shadow-black/30 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800">
            <h2 className="text-xl font-bold text-white">
              Real-Time High-Intent Sessions ({sessions.length})
            </h2>
          </div>

          {loading && sessions.length === 0 ? (
            <div className="p-6 text-center text-slate-400">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="p-6 text-center text-slate-400">
              No high-intent sessions at the moment
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/80 border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                      Session ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                      User ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                      Intent Score
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                      Coupon Code
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                      Updated
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {sessions.map((session) => (
                    <tr key={session.sessionId} className="hover:bg-slate-900/60 transition">
                      <td className="px-6 py-4 text-sm font-mono text-white">
                        {session.sessionId.substring(0, 12)}...
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {session.userId}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold">
                        <span className="bg-orange-500/15 text-orange-300 px-3 py-1 rounded-full">
                          {session.intendScore} pts
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {session.targetProductId || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        <code className="bg-slate-900 px-2 py-1 rounded font-mono text-xs text-slate-200">
                          {session.couponCode || '-'}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          session.status === 'converted'
                            ? 'bg-emerald-500/15 text-emerald-200'
                            : session.status === 'abandoned'
                            ? 'bg-rose-500/15 text-rose-200'
                            : 'bg-sky-500/15 text-sky-200'
                        }`}>
                          {session.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        <div className="text-xs">
                          <div>{formatDate(session.updatedAt)}</div>
                          <div className="text-slate-500">{formatTime(session.updatedAt)}</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-6 p-4 bg-[#0f172a] border border-slate-800 rounded-lg">
          <p className="text-sm text-slate-300">
            <strong>Real-time Monitoring:</strong> This dashboard updates automatically every 10 seconds when auto-refresh is enabled. 
            Sessions are tracked as users interact with product images (clicks, zoom, hover). 
            When a user's intent score reaches the threshold defined in a rule, they are marked as "high-intent" and a retargeting offer is triggered.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BehavioralAnalyticsDashboard;
