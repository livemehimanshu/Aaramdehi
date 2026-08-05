import React, { useEffect, useMemo, useState } from 'react';
import { Users, UserX, UserCheck, Search, Mail, ShieldAlert, Loader2, Trash2 } from 'lucide-react';
import { api } from '../../../src/api/authAndAdminApi';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/admin/list');
      setUsers(res?.data?.data || []);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load customers');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = search.toLowerCase();
    if (!term) return users;
    return users.filter((user) => {
      const haystack = `${user.name || ''} ${user.email || ''} ${user.role || ''}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [users, search]);

  const toggleUserStatus = async (id) => {
    try {
      const res = await api.patch(`/user/admin/toggle-block/${id}`);
      if (res?.data?.success) {
        setUsers((prev) => prev.map((user) => user.id === id ? { ...user, status: user.status === 'Active' ? 'Blocked' : 'Active', isBlocked: !user.isBlocked } : user));
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to update customer status');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this customer?")) return;
    try {
      const res = await api.delete(`/user/admin/delete/${id}`);
      if (res?.data?.success) {
        setUsers(prev => prev.filter(user => user.id !== id));
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to delete customer');
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-950 min-h-screen text-gray-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-3 text-white">
          <Users size={28} className="text-blue-500" /> Customer Management
        </h1>
        <div className="relative group w-full md:w-auto">
          <Search className="absolute left-3 top-3.5 text-gray-500" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 p-3 bg-gray-900 border border-gray-800 rounded-xl w-full md:w-64 focus:border-emerald-500 outline-none text-white transition-all text-sm"
            placeholder="Search customers..."
          />
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div>}

      <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-gray-800/50 text-gray-500 text-[10px] md:text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Email</th>
                <th className="p-4">Orders</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading customers...
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">No customers found.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isActive = user.status !== 'Blocked';
                  return (
                    <tr key={user.id} className="hover:bg-gray-800/30 transition-all text-sm">
                      <td className="p-4 font-bold text-white whitespace-nowrap">
                        <div>{user.name}</div>
                        <div className="mt-1 text-[11px] uppercase tracking-wider text-gray-500">{user.role || 'USER'}</div>
                      </td>
                      <td className="p-4 text-gray-500 flex items-center gap-2 text-xs md:text-sm">
                        <Mail size={14} className="shrink-0" /> {user.email}
                      </td>
                      <td className="p-4 font-semibold">{user.orders}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase flex w-max items-center gap-1.5 ${
                          isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {isActive ? <UserCheck size={10} /> : <ShieldAlert size={10} />}
                          {user.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => toggleUserStatus(user.id)}
                            title={isActive ? "Block Customer" : "Unblock Customer"}
                            className={`p-2 rounded-lg transition-all hover:scale-110 ${isActive ? 'text-amber-500 hover:bg-amber-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'}`}
                          >
                            {isActive ? <UserX size={18} /> : <UserCheck size={18} />}
                          </button>
                          <button
                            onClick={() => deleteUser(user.id)}
                            title="Delete Customer"
                            className="p-2 rounded-lg transition-all hover:scale-110 text-rose-500 hover:bg-rose-500/10"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}