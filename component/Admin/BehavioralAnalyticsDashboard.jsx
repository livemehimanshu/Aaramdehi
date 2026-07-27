import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiTrendingUp, FiUsers, FiShoppingCart, FiLogOut } from 'react-icons/fi';
import toast from 'react-hot-toast';

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
      const response = await fetch('/api/analytics/high-intent-sessions?limit=50', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
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
      const response = await fetch('/api/analytics/conversion-metrics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Behavioral Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Real-time monitoring of high-intent user sessions</p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Auto-refresh (10s)</span>
            </label>
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
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
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Sessions</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {metrics.totalSessions}
                  </p>
                </div>
                <div className="bg-blue-100 p-4 rounded-lg">
                  <FiUsers size={24} className="text-blue-600" />
                </div>
              </div>
            </div>

            {/* High-Intent Sessions */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">High-Intent</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {metrics.highIntentSessions}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{metrics.highIntentRate}</p>
                </div>
                <div className="bg-orange-100 p-4 rounded-lg">
                  <FiTrendingUp size={24} className="text-orange-600" />
                </div>
              </div>
            </div>

            {/* Conversions */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Conversions</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {metrics.convertedSessions}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{metrics.conversionRate}</p>
                </div>
                <div className="bg-green-100 p-4 rounded-lg">
                  <FiShoppingCart size={24} className="text-green-600" />
                </div>
              </div>
            </div>

            {/* Abandoned */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Abandoned</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {metrics.abandonedSessions}
                  </p>
                </div>
                <div className="bg-red-100 p-4 rounded-lg">
                  <FiLogOut size={24} className="text-red-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sessions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Real-Time High-Intent Sessions ({sessions.length})
            </h2>
          </div>

          {loading && sessions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No high-intent sessions at the moment
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Session ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      User ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Intent Score
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Coupon Code
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Updated
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sessions.map((session) => (
                    <tr key={session.sessionId} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-mono text-gray-900">
                        {session.sessionId.substring(0, 12)}...
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {session.userId}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold">
                        <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
                          {session.intendScore} pts
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {session.targetProductId || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                          {session.couponCode || '-'}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          session.status === 'converted'
                            ? 'bg-green-100 text-green-800'
                            : session.status === 'abandoned'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {session.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="text-xs">
                          <div>{formatDate(session.updatedAt)}</div>
                          <div className="text-gray-500">{formatTime(session.updatedAt)}</div>
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
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
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
