/**
 * ADMIN PAGE TEMPLATE - Copy and customize for remaining pages
 * 
 * This template demonstrates the established pattern for real-time data pages.
 * Replace ENTITY_NAME with: categories, coupons, appointments, analytics, payments, refunds, settings, team, users, orders
 */

import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, CheckCircle, Search, Plus, Edit2, Trash2 } from 'lucide-react';
import {
  // getAll[ENTITY]API, 
  // get[ENTITY]ByIdAPI,
  // create[ENTITY]API,
  // update[ENTITY]API,
  // delete[ENTITY]API,
  // [ENTITY]StatsAPI (if available)
} from '../../../src/api/authAndAdminApi';

export default function EntityListPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchData();
    fetchStats(); // If stats endpoint exists
  }, [search, filter, currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Update this with actual API call
      // const response = await getAllEntitiesAPI({
      //   page: currentPage,
      //   limit: 10,
      //   search: search || undefined,
      //   // add other filters as needed
      // });

      // if (response.success) {
      //   setData(response.data);
      //   setPagination(response.pagination);
      // } else {
      //   setMessage({ type: 'error', text: response.message });
      // }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch data' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // const response = await entityStatsAPI();
      // if (response.success) {
      //   setStats(response.data);
      // }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;

    try {
      // const response = await deleteEntityAPI(id);
      // if (response.success) {
      //   setMessage({ type: 'success', text: response.message });
      //   fetchData();
      //   fetchStats();
      // } else {
      //   setMessage({ type: 'error', text: response.message });
      // }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-200">Entity List</h1>
            <p className="text-gray-400 text-sm mt-1">Manage your entities</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition">
            <Plus size={20} /> Add New
          </button>
        </div>

        {/* Stats Cards (if applicable) */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Total</p>
              <p className="text-2xl font-bold text-gray-200">{stats.total}</p>
            </div>
            {/* Add more stat cards as needed */}
          </div>
        )}

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-900/30 border border-green-700 text-green-200'
              : 'bg-red-900/30 border border-red-700 text-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            {message.text}
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded text-gray-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All</option>
            {/* Add filter options */}
          </select>
          <div className="text-gray-400 text-sm pt-2">
            Total: {pagination.total} | Page {currentPage} of {pagination.pages}
          </div>
        </div>

        {/* Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center flex justify-center">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          ) : data.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No data found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-gray-300 font-semibold">Column 1</th>
                    <th className="px-6 py-3 text-left text-gray-300 font-semibold">Column 2</th>
                    <th className="px-6 py-3 text-left text-gray-300 font-semibold">Status</th>
                    <th className="px-6 py-3 text-left text-gray-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {data.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-800/50">
                      <td className="px-6 py-3 text-gray-200">{/* Display field */}</td>
                      <td className="px-6 py-3 text-gray-400">{/* Display field */}</td>
                      <td className="px-6 py-3">
                        <span className="px-3 py-1 rounded text-sm font-medium bg-green-900/30 text-green-200">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex gap-2">
                          <button className="p-2 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 transition">
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-2 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
              disabled={currentPage === pagination.pages}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
