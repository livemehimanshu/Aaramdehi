import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiSearch, FiFilter, FiDownload, FiUser, FiShoppingBag, FiZap, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const BehavioralInteractionLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, image_click, zoom_open, hover_8s, variant_switch
  const [autoRefresh, setAutoRefresh] = useState(true);

  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

  /**
   * Fetch all user behavior logs from backend
   */
  const fetchInteractionLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/all-interactions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        // Flatten all interactions from all sessions
        const allInteractions = [];
        
        if (data.interactions && Array.isArray(data.interactions)) {
          data.interactions.forEach(session => {
            if (session.interactions && Array.isArray(session.interactions)) {
              session.interactions.forEach(interaction => {
                allInteractions.push({
                  ...interaction,
                  sessionId: session.sessionId,
                  userId: session.userId,
                  productId: session.targetProductId,
                  colorVariant: session.selectedColorVariant,
                  sessionScore: session.intendScore,
                  couponCode: session.couponCode
                });
              });
            }
          });
        }
        
        // Sort by timestamp (newest first)
        allInteractions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setLogs(allInteractions);
        setFilteredLogs(allInteractions);
      } else {
        toast.error(data.error || 'Failed to fetch logs');
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to fetch interaction logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInteractionLogs();

    // Auto-refresh every 15 seconds
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchInteractionLogs, 15000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  /**
   * Apply filters and search
   */
  useEffect(() => {
    let result = logs;

    // Filter by interaction type
    if (filterType !== 'all') {
      result = result.filter(log => log.type === filterType);
    }

    // Search by user ID or product ID
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(log => 
        (log.userId && log.userId.toLowerCase().includes(term)) ||
        (log.productId && log.productId.toLowerCase().includes(term)) ||
        (log.sessionId && log.sessionId.toLowerCase().includes(term))
      );
    }

    setFilteredLogs(result);
  }, [logs, filterType, searchTerm]);

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getInteractionIcon = (type) => {
    switch(type) {
      case 'image_click':
        return <FiShoppingBag className="text-blue-600" />;
      case 'zoom_open':
        return <FiZap className="text-yellow-600" />;
      case 'hover_8s':
        return <FiClock className="text-purple-600" />;
      case 'variant_switch':
        return <FiFilter className="text-green-600" />;
      case 'modal_open':
        return <FiShoppingBag className="text-indigo-600" />;
      default:
        return <FiUser className="text-gray-600" />;
    }
  };

  const getInteractionBadgeColor = (type) => {
    switch(type) {
      case 'image_click':
        return 'bg-blue-100 text-blue-800';
      case 'zoom_open':
        return 'bg-yellow-100 text-yellow-800';
      case 'hover_8s':
        return 'bg-purple-100 text-purple-800';
      case 'variant_switch':
        return 'bg-green-100 text-green-800';
      case 'modal_open':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPointsColor = (points) => {
    if (points >= 5) return 'text-green-600 font-bold';
    if (points >= 3) return 'text-orange-600 font-bold';
    return 'text-gray-600';
  };

  const downloadCSV = () => {
    if (filteredLogs.length === 0) {
      toast.error('No data to download');
      return;
    }

    const headers = ['Timestamp', 'User ID', 'Product ID', 'Interaction Type', 'Points', 'Session ID', 'Variant', 'Session Score'];
    const rows = filteredLogs.map(log => [
      `${formatDate(log.timestamp)} ${formatTime(log.timestamp)}`,
      log.userId || 'N/A',
      log.productId || 'N/A',
      log.type,
      log.points,
      log.sessionId.substring(0, 20),
      log.colorVariant || 'N/A',
      log.sessionScore
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `interaction-logs-${new Date().getTime()}.csv`);
    link.click();
    toast.success('CSV downloaded successfully');
  };

  const interactionTypeStats = {
    image_click: logs.filter(l => l.type === 'image_click').length,
    zoom_open: logs.filter(l => l.type === 'zoom_open').length,
    hover_8s: logs.filter(l => l.type === 'hover_8s').length,
    variant_switch: logs.filter(l => l.type === 'variant_switch').length,
    modal_open: logs.filter(l => l.type === 'modal_open').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Interaction Logs</h1>
          <p className="text-gray-600 mt-1">Real-time tracking of all user interactions - see who clicked what, when, and on which product</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FiShoppingBag className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-600">Image Clicks</p>
                <p className="text-2xl font-bold">{interactionTypeStats.image_click}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <FiZap className="text-yellow-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-600">Zooms</p>
                <p className="text-2xl font-bold">{interactionTypeStats.zoom_open}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <FiClock className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-600">Long Hovers</p>
                <p className="text-2xl font-bold">{interactionTypeStats.hover_8s}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <FiFilter className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-600">Variants</p>
                <p className="text-2xl font-bold">{interactionTypeStats.variant_switch}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-3 rounded-lg">
                <FiShoppingBag className="text-indigo-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total</p>
                <p className="text-2xl font-bold">{logs.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by User ID, Product, or Session ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Interactions</option>
              <option value="image_click">Image Clicks</option>
              <option value="zoom_open">Zooms</option>
              <option value="hover_8s">Long Hovers (8s+)</option>
              <option value="variant_switch">Variant Switches</option>
              <option value="modal_open">Modal Opens</option>
            </select>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={fetchInteractionLogs}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                <FiRefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button
                onClick={downloadCSV}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                <FiDownload size={18} />
                Export CSV
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">Auto-refresh (15s)</span>
          </label>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">
              Interactions ({filteredLogs.length})
            </h2>
          </div>

          {loading && filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin inline-block">
                <FiRefreshCw size={24} />
              </div>
              <p className="mt-2">Loading interactions...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FiUser size={32} className="mx-auto mb-2 opacity-50" />
              <p>No interactions found</p>
              <p className="text-xs mt-1">Users haven't interacted with products yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      User ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Product ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Interaction
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Points
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Session Score
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Session ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Coupon
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLogs.map((log, idx) => (
                    <tr key={`${log.sessionId}-${idx}`} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        <div className="text-xs">
                          <div className="font-medium">{formatTime(log.timestamp)}</div>
                          <div className="text-gray-500">{formatDate(log.timestamp)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-900">
                        <span className="bg-blue-100 px-2 py-1 rounded text-xs">
                          {log.userId?.substring(0, 12) || 'N/A'}...
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="font-medium">{log.productId || 'N/A'}</span>
                        {log.colorVariant && (
                          <div className="text-xs text-gray-500 mt-1">{log.colorVariant}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          {getInteractionIcon(log.type)}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getInteractionBadgeColor(log.type)}`}>
                            {log.type.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-sm font-bold ${getPointsColor(log.points)}`}>
                        +{log.points} pts
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-bold">
                          {log.sessionScore} pts
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {log.sessionId.substring(0, 10)}...
                        </code>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {log.couponCode ? (
                          <code className="bg-green-100 text-green-800 px-2 py-1 rounded font-mono text-xs font-bold">
                            {log.couponCode}
                          </code>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>📊 Interaction Tracking:</strong> This log shows every interaction users make on products - clicks, zooms, hovers, etc. 
            Each interaction earns points. When a user's total score reaches a rule's threshold, a retargeting offer is triggered. 
            Use filters to find specific users or products, and export data for analysis.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BehavioralInteractionLogs;
