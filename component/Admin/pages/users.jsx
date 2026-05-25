import React, { useState } from 'react';
import { Users, UserX, UserCheck, Search, Mail, ShieldAlert } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState([
    { id: 1, name: 'Himanshu S.', email: 'himanshu@gmail.com', orders: 5, status: 'Active' },
    { id: 2, name: 'Neeraj S.', email: 'neeraj@jio.com', orders: 2, status: 'Blocked' },
  ]);

  const toggleUserStatus = (id) => {
    setUsers(users.map(u => 
      u.id === id ? { ...u, status: u.status === 'Active' ? 'Blocked' : 'Active' } : u
    ));
  };

  return (
    <div className="p-4 md:p-8 bg-gray-950 min-h-screen text-gray-200">
      {/* Header with Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-3 text-white">
          <Users size={28} className="text-blue-500" /> Customer Management
        </h1>
        <div className="relative group w-full md:w-auto">
          <Search className="absolute left-3 top-3.5 text-gray-500" size={16} />
          <input 
            className="pl-10 p-3 bg-gray-900 border border-gray-800 rounded-xl w-full md:w-64 focus:border-emerald-500 outline-none text-white transition-all text-sm" 
            placeholder="Search customers..." 
          />
        </div>
      </div>

      {/* Responsive Table Wrapper */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-gray-800/50 text-gray-400 text-[10px] md:text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Email</th>
                <th className="p-4">Orders</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-800/30 transition-all text-sm">
                  <td className="p-4 font-bold text-white whitespace-nowrap">{user.name}</td>
                  <td className="p-4 text-gray-400 flex items-center gap-2 text-xs md:text-sm">
                    <Mail size={14} className="shrink-0" /> {user.email}
                  </td>
                  <td className="p-4 font-semibold">{user.orders}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase flex w-max items-center gap-1.5 ${
                      user.status === 'Active' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {user.status === 'Active' ? <UserCheck size={10} /> : <ShieldAlert size={10} />}
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => toggleUserStatus(user.id)}
                      className={`p-2 rounded-lg transition-all hover:scale-110 ${user.status === 'Active' ? 'text-rose-500 hover:bg-rose-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'}`}
                    >
                      {user.status === 'Active' ? <UserX size={18} /> : <UserCheck size={18} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}