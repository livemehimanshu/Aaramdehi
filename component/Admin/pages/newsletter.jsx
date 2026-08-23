import React, { useState, useEffect } from 'react';
import { Mail, Users, Send, Search, Download, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getNewsletterSubscribersAPI, updateNewsletterSubscriberAPI, deleteNewsletterSubscriberAPI } from '../../../src/api/authAndAdminApi';

const formatDateTime = (value) => {
  if (!value) return 'Unknown';
  const date = value.toDate ? value.toDate() : new Date(value);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const buildCsvContent = (items) => {
  const header = ['Email Address', 'Subscribed At', 'Status', 'Source'];
  const rows = items.map((item) => [
    item.email,
    formatDateTime(item.subscribedAt),
    item.status || 'active',
    item.source || 'footer_newsletter',
  ]);

  return [header, ...rows].map((row) => row.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
};

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadSubscribers = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await getNewsletterSubscribersAPI();
      if (!response.success) throw new Error(response.message || 'Failed to load subscribers');
      const docs = response.data || [];

      setSubscribers(docs);
      setLastVisible(null);
      setHasMore(false);
    } catch (error) {
      toast.error('Failed to load subscribers.');
      console.error(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadSubscribers(true);
  }, []);

  const filteredSubscribers = subscribers.filter((subscriber) =>
    subscriber.email?.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (statusFilter === 'all' || subscriber.status === statusFilter)
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setLoading(true);
      await deleteNewsletterSubscriberAPI(deleteTarget._id);
      setSubscribers((prev) => prev.filter((item) => item._id !== deleteTarget._id));
      toast.success('Subscriber deleted successfully.');
    } catch (error) {
      toast.error('Unable to delete subscriber.');
      console.error(error);
    } finally {
      setLoading(false);
      setDeleteTarget(null);
    }
  };

  const handleToggleStatus = async (subscriber, nextStatus) => {
    try {
      setLoading(true);
      await updateNewsletterSubscriberAPI(subscriber._id, nextStatus);
      setSubscribers((prev) => prev.map((item) => item._id === subscriber._id ? { ...item, status: nextStatus } : item));
      toast.success(`Subscriber status updated to ${nextStatus}.`);
    } catch (error) {
      toast.error('Unable to update status.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    const csv = buildCsvContent(filteredSubscribers);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'newsletter-subscribers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('CSV export ready.');
  };

  return (
    <div className="p-4 md:p-8 bg-gray-950 min-h-screen text-gray-200">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Newsletter Subscribers</h1>
          <p className="text-sm text-gray-500 mt-2">
            Manage and export your Firestore newsletter subscribers collection.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-xl font-semibold transition"
          >
            <Download size={16} /> Export to CSV
          </button>
          <button
            onClick={() => loadSubscribers(true)}
            className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-xl font-semibold transition"
          >
            Reload List
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 mb-6">
        <span className="text-sm text-gray-500">Total subscribers: <strong className="text-white">{subscribers.length}</strong></span>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-start lg:items-center">
          <div className="w-full max-w-md relative">
            <Search className="absolute left-4 top-3 text-gray-500" size={18} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by email..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-900 border border-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-slate-500 outline-none"
            />
          </div>
          <div className="w-full sm:w-64">
            <label className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2 block">Status filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-gray-900 border border-gray-800 text-white outline-none focus:ring-2 focus:ring-slate-500"
            >
              <option value="all">All Subscribers</option>
              <option value="active">Active only</option>
              <option value="unsubscribed">Unsubscribed only</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-gray-800 bg-gray-900 shadow-xl">
        <table className="min-w-full text-left">
          <thead className="bg-gray-950/90">
            <tr>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-500">Email Address</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-500">Subscribed</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-500">Status</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-500">Source</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-500">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubscribers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  {loading ? 'Loading subscribers...' : 'No subscribers found.'}
                </td>
              </tr>
            ) : (
              filteredSubscribers.map((subscriber) => (
                <tr key={subscriber._id} className="border-t border-gray-800 hover:bg-white/5 transition">
                  <td className="px-6 py-4 text-sm text-white break-all">{subscriber.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{formatDateTime(subscriber.subscribedAt)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-semibold uppercase ${subscriber.status === 'active' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-red-500/20 text-red-200'}`}>
                      {subscriber.status === 'active' ? 'Active' : 'Unsubscribed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{subscriber.source || 'footer_newsletter'}</td>
                  <td className="px-6 py-4 flex flex-col sm:flex-row gap-2">
                    {subscriber.status === 'active' ? (
                      <button
                        onClick={() => handleToggleStatus(subscriber, 'unsubscribed')}
                        className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-2 rounded-xl text-xs font-semibold transition"
                      >
                        Unsubscribe
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleStatus(subscriber, 'active')}
                        className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-xl text-xs font-semibold transition"
                      >
                        Reactivate
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteTarget(subscriber)}
                      className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl text-xs font-semibold transition"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => loadSubscribers(false)}
            disabled={loadingMore}
            className="inline-flex items-center justify-center rounded-full bg-slate-700 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-600 transition disabled:opacity-60"
          >
            {loadingMore ? 'Loading more...' : 'Load more subscribers'}
          </button>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-gray-950 border border-gray-800 p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Delete Subscriber</h2>
            <p className="text-sm text-gray-300 mb-6">
              Are you sure you want to delete <strong>{deleteTarget.email}</strong> from the subscriber list? This cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 transition"
              >
                {loading ? 'Deleting...' : 'Confirm Delete'}
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-2xl border border-gray-700 bg-transparent px-5 py-3 text-sm font-semibold text-white hover:bg-white/5 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
