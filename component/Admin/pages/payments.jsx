import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Loader2,
  AlertCircle,
  Settings,
  Key,
  Eye,
  EyeOff,
  Save,
  Check
} from 'lucide-react';
import { getAllOrdersAdminAPI, updateGatewayConfigAPI, getGatewayConfigAPI } from '../../../src/api/authAndAdminApi';

export default function Payments() {
  // --- Data & Filtering States ---
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [gatewayConfigs, setGatewayConfigs] = useState(null);

  // --- Modal & Configuration States ---
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState('razorpay');
  const [keyIdOrAppId, setKeyIdOrAppId] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [mode, setMode] = useState('sandbox');
  const [isActive, setIsActive] = useState(true);
  const [showSecret, setShowSecret] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [configSuccess, setConfigSuccess] = useState('');

  // --- Fetch Payments Data ---
  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const [response, configRes] = await Promise.all([
        getAllOrdersAdminAPI(),
        getGatewayConfigAPI().catch(err => {
          console.error("Error fetching gateway config:", err);
          return null;
        })
      ]);

      if (response?.success) {
        setPayments(response.data || []);
      }
      if (configRes?.success) {
        setGatewayConfigs(configRes.data || {});
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError(
        err.response?.data?.message ||
        "Failed to connect to the server. Check if backend is running properly."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // --- Pre-fill Config Modal ---
  useEffect(() => {
    if (isConfigOpen && gatewayConfigs && gatewayConfigs[selectedGateway]) {
      const existing = gatewayConfigs[selectedGateway];
      setKeyIdOrAppId(existing.key_id || existing.app_id || '');
      setMode(existing.mode || 'sandbox');
      setIsActive(existing.is_active !== false); // default to true if not strictly false
      setSecretKey(''); // Always empty for security
    } else if (isConfigOpen) {
      setKeyIdOrAppId('');
      setSecretKey('');
      setMode('sandbox');
      setIsActive(true);
    }
  }, [isConfigOpen, selectedGateway, gatewayConfigs]);

  // --- Save Gateway Configuration ---
  const handleSaveGatewayConfig = async (e) => {
    e.preventDefault();
    try {
      setSavingConfig(true);
      setConfigSuccess('');

      const payload = {
        provider: selectedGateway,
        key_id_or_app_id: keyIdOrAppId,
        secret: secretKey,
        mode,
        is_active: isActive
      };

      // Call central API method from authAndAdminApi.js
      const res = await updateGatewayConfigAPI(payload);

      if (res?.success) {
        setConfigSuccess(`${selectedGateway.toUpperCase()} credentials updated successfully!`);
        // Refresh configs to show updated active status
        const configRes = await getGatewayConfigAPI().catch(() => null);
        if (configRes?.success) setGatewayConfigs(configRes.data || {});
        
        setTimeout(() => {
          setIsConfigOpen(false);
          setConfigSuccess('');
          setSecretKey('');
        }, 1500);
      }
    } catch (err) {
      console.error("Gateway Config Error:", err);
      alert(
        err.response?.data?.message ||
        "Unauthorized (401): Please re-login as Admin or check account permissions."
      );
    } finally {
      setSavingConfig(false);
    }
  };

  // --- Helpers ---
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Paid':
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Pending':
      case 'pending':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Failed':
      case 'failed':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default:
        return 'bg-gray-800 text-gray-500';
    }
  };

  const filteredPayments = payments.filter(pay => {
    const txnId = pay._id || pay.id || pay.transactionId || '';
    const orderId = pay.orderId || pay.orderNumber || '';

    const matchesSearch = txnId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orderId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' ||
      pay.status === statusFilter ||
      pay.paymentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // --- Loading UI ---
  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-950 gap-4">
      <Loader2 className="animate-spin text-emerald-500" size={40} />
      <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Fetching Transactions...</p>
    </div>
  );

  // --- Error UI ---
  if (error) return (
    <div className="p-8 text-center text-rose-500 flex flex-col items-center gap-4 bg-gray-950 min-h-screen justify-center">
      <AlertCircle size={48} />
      <p className="font-bold text-lg">{error}</p>
      <button
        onClick={fetchPayments}
        className="bg-gray-800 px-6 py-2 rounded-xl text-white font-bold hover:bg-gray-700 transition-all"
      >
        Retry Connection
      </button>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-gray-950 min-h-screen text-gray-200">

      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-emerald-500" size={28} />
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">Payment Ledger</h1>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase mt-1">
            Real-time Transaction Tracking & Gateway Config
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => setIsConfigOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-950/40 text-xs uppercase tracking-wider"
          >
            <Settings size={16} />
            Configure Payment Gateways
          </button>
          
          {gatewayConfigs && (
            <div className="flex gap-2 mt-1">
              {gatewayConfigs.razorpay?.is_active && (
                 <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-md font-bold">Razorpay ({gatewayConfigs.razorpay.mode})</span>
              )}
              {gatewayConfigs.cashfree?.is_active && (
                 <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-1 rounded-md font-bold">Cashfree ({gatewayConfigs.cashfree.mode})</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search by Transaction ID or Order ID..."
            className="w-full bg-gray-900 border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-emerald-500 transition-all text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none cursor-pointer text-gray-300"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Paid">Paid / Completed</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-gray-800/50 text-gray-500 text-[10px] md:text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Txn Reference</th>
                <th className="p-4">Order ID</th>
                <th className="p-4">Method</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredPayments.map((pay) => (
                <tr key={pay._id || pay.id} className="hover:bg-gray-800/30 transition-all text-sm group">
                  <td className="p-4 font-mono text-[11px] md:text-xs text-blue-400 font-bold uppercase">
                    {(pay._id || pay.transactionId || '').slice(-10)}
                  </td>
                  <td className="p-4 text-gray-500 font-medium">
                    {pay.orderId || pay.orderNumber || 'N/A'}
                  </td>
                  <td className="p-4 flex items-center gap-2 text-white">
                    <div className="p-1.5 bg-gray-800 rounded-lg">
                      <CreditCard size={14} className="text-gray-500" />
                    </div>
                    <span className="font-bold uppercase text-[11px]">
                      {pay.paymentMethod || pay.paymentGateway || 'N/A'}
                    </span>
                  </td>
                  <td className="p-4 font-black text-white tracking-tight">
                    ₹{Number(pay.totalAmount || pay.amount || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="p-4 text-xs text-slate-500 font-bold">
                    {pay.createdAt ? new Date(pay.createdAt).toLocaleDateString('en-GB') : 'N/A'}
                  </td>
                  <td className="p-4 text-right">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 border ${getStatusStyle(pay.paymentStatus || pay.status)}`}>
                      {(pay.paymentStatus === 'Completed' || pay.status === 'Paid' || pay.status === 'completed') && <CheckCircle size={10} strokeWidth={3} />}
                      {(pay.paymentStatus === 'Pending' || pay.status === 'Pending' || pay.status === 'pending') && <Clock size={10} strokeWidth={3} />}
                      {(pay.status === 'Failed' || pay.status === 'failed') && <XCircle size={10} strokeWidth={3} />}
                      {pay.paymentStatus || pay.status || 'Unknown'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPayments.length === 0 && (
            <div className="p-20 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">
              No matching transactions found
            </div>
          )}
        </div>
      </div>

      {/* Gateway Configuration Modal */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-gray-900 border border-gray-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
              <div className="flex items-center gap-2 text-white">
                <Key className="text-emerald-500" size={20} />
                <h3 className="font-black text-lg tracking-tight uppercase">Gateway Settings</h3>
              </div>
              <button
                onClick={() => setIsConfigOpen(false)}
                className="text-gray-500 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGatewayConfig} className="space-y-4">
              {/* Provider Choice */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Select Provider</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedGateway('razorpay')}
                    className={`p-3 rounded-xl border text-xs font-black uppercase transition-all ${selectedGateway === 'razorpay'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                        : 'bg-gray-800/50 border-gray-700 text-gray-400'
                      }`}
                  >
                    Razorpay
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedGateway('cashfree')}
                    className={`p-3 rounded-xl border text-xs font-black uppercase transition-all ${selectedGateway === 'cashfree'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                        : 'bg-gray-800/50 border-gray-700 text-gray-400'
                      }`}
                  >
                    Cashfree
                  </button>
                </div>
              </div>

              {/* App/Key ID */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                  {selectedGateway === 'razorpay' ? 'Key ID' : 'App ID'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={selectedGateway === 'razorpay' ? 'rzp_test_...' : 'CF...'}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  value={keyIdOrAppId}
                  onChange={(e) => setKeyIdOrAppId(e.target.value)}
                />
              </div>

              {/* Secret Key */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Secret Key</label>
                <div className="relative">
                  <input
                    type={showSecret ? "text" : "password"}
                    required
                    placeholder="Enter Secret Key"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 pr-10"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Mode</label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    <option value="sandbox">Sandbox / Test</option>
                    <option value="live">Live / Production</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Gateway Status</label>
                  <select
                    value={isActive ? "true" : "false"}
                    onChange={(e) => setIsActive(e.target.value === "true")}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    <option value="true">Active</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
              </div>

              {/* Success Banner */}
              {configSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <Check size={14} />
                  {configSuccess}
                </div>
              )}

              {/* Buttons */}
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsConfigOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 flex items-center gap-2"
                >
                  {savingConfig ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Save Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}