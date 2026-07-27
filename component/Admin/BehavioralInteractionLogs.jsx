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
        return <FiShoppingBag className="text-sky-400" />;
      case 'zoom_open':
        return <FiZap className="text-amber-400" />;
      case 'hover_8s':
        return <FiClock className="text-violet-400" />;
      case 'variant_switch':
        return <FiFilter className="text-emerald-400" />;
      case 'modal_open':
        return <FiShoppingBag className="text-indigo-400" />;
      default:
        return <FiUser className="text-slate-400" />;
    }
  };

  const getInteractionBadgeColor = (type) => {
    switch(type) {
      case 'image_click':
        return 'bg-sky-500/15 text-sky-200';
      case 'zoom_open':
        return 'bg-amber-500/15 text-amber-200';
      case 'hover_8s':
        return 'bg-violet-500/15 text-violet-200';
      case 'variant_switch':
        return 'bg-emerald-500/15 text-emerald-200';
      case 'modal_open':
        return 'bg-indigo-500/15 text-indigo-200';
      default:
        return 'bg-slate-700 text-slate-200';
    }
  };

  const getPointsColor = (points) => {
    if (points >= 5) return 'text-emerald-300 font-bold';
    if (points >= 3) return 'text-amber-300 font-bold';
    return 'text-slate-300';
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
    <div className="min-h-screen bg-[#05070b] p-6 text-slate-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">User Interaction Logs</h1>
          <p className="text-slate-400 mt-1">Real-time tracking of all user interactions - see who clicked what, when, and on which product</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl shadow-2xl shadow-black/30 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-3 rounded-2xl">
                <FiShoppingBag className="text-[#2563eb]" size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Image Clicks</p>
                <p className="text-2xl font-bold text-white">{interactionTypeStats.image_click}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl shadow-2xl shadow-black/30 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-3 rounded-2xl">
                <FiZap className="text-yellow-400" size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Zooms</p>
                <p className="text-2xl font-bold text-white">{interactionTypeStats.zoom_open}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl shadow-2xl shadow-black/30 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-3 rounded-2xl">
                <FiClock className="text-violet-400" size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Long Hovers</p>
                <p className="text-2xl font-bold text-white">{interactionTypeStats.hover_8s}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl shadow-2xl shadow-black/30 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-3 rounded-2xl">
                <FiFilter className="text-emerald-400" size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Variants</p>
                <p className="text-2xl font-bold text-white">{interactionTypeStats.variant_switch}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl shadow-2xl shadow-black/30 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-3 rounded-2xl">
                <FiShoppingBag className="text-indigo-400" size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Total</p>
                <p className="text-2xl font-bold text-white">{logs.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl shadow-2xl shadow-black/30 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-slate-500" size={20} />
              <input
                type="text"
                placeholder="Search by User ID, Product, or Session ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
              />
            </div>

            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
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
                className="flex items-center gap-2 bg-[#2563eb] text-white px-4 py-2 rounded-lg hover:bg-[#1d4ed8] transition disabled:opacity-50"
              >
                <FiRefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button
                onClick={downloadCSV}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
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
              className="w-4 h-4 rounded border-slate-600 bg-slate-900"
            />
            <span className="text-sm font-medium text-slate-300">Auto-refresh (15s)</span>
          </label>
        </div>

        {/* Logs Table */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl shadow-2xl shadow-black/30 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white">
              Interactions ({filteredLogs.length})
            </h2>
          </div>

          {loading && filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <div className="animate-spin inline-block">
                <FiRefreshCw size={24} />
              </div>
              <p className="mt-2">Loading interactions...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <FiUser size={32} className="mx-auto mb-2 opacity-50" />
              <p>No interactions found</p>
              <p className="text-xs mt-1">Users haven't interacted with products yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/80 border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                      User ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                      Product ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                      Interaction
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                      Points
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                      Session Score
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                      Session ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                      Coupon
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredLogs.map((log, idx) => (
                    <tr key={`${log.sessionId}-${idx}`} className="hover:bg-slate-900/60 transition">
                      <td className="px-6 py-4 text-sm text-slate-300 whitespace-nowrap">
                        <div className="text-xs">
                          <div className="font-medium">{formatTime(log.timestamp)}</div>
                          <div className="text-slate-500">{formatDate(log.timestamp)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-white">
                        <span className="bg-slate-900 px-2 py-1 rounded text-xs text-slate-200">
                          {log.userId?.substring(0, 12) || 'N/A'}...
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        <span className="font-medium text-white">{log.productId || 'N/A'}</span>
                        {log.colorVariant && (
                          <div className="text-xs text-slate-500 mt-1">{log.colorVariant}</div>
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
                        <span className="bg-orange-500/15 text-orange-200 px-3 py-1 rounded-full text-sm font-bold">
                          {log.sessionScore} pts
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-slate-300">
                        <code className="bg-slate-900 px-2 py-1 rounded text-xs text-slate-200">
                          {log.sessionId.substring(0, 10)}...
                        </code>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {log.couponCode ? (
                          <code className="bg-emerald-500/15 text-emerald-200 px-2 py-1 rounded font-mono text-xs font-bold">
                            {log.couponCode}
                          </code>
                        ) : (
                          <span className="text-slate-400">-</span>
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
        <div className="mt-6 p-4 bg-[#0f172a] border border-slate-800 rounded-lg">
          <p className="text-sm text-slate-300">
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
