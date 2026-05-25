import React, { useState } from 'react';
import { UserPlus, Shield, Trash2, Edit2, Mail, Crown, Users } from 'lucide-react';

export default function TeamPage() {
  const [team, setTeam] = useState([
    { id: 1, name: 'Himanshu Srivastava', role: 'Super Admin', email: 'himanshu@aaramdehi.com' },
    { id: 2, name: 'Neeraj Shrivastava', role: 'Manager', email: 'neeraj@aaramdehi.com' },
  ]);

  return (
    <div className="p-4 md:p-8 bg-gray-950 min-h-screen text-gray-200">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-xl">
            <Users className="text-emerald-500" size={24} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Team Members</h1>
            <p className="text-xs md:text-sm text-gray-500">Manage your administrative team and roles</p>
          </div>
        </div>
        <button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all font-semibold shadow-lg shadow-emerald-900/20 text-sm">
          <UserPlus size={18} /> Add Member
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-gray-800/50 text-gray-400 text-[10px] md:text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 md:p-5 font-semibold">Member Name</th>
                <th className="p-4 md:p-5 font-semibold">Role & Access</th>
                <th className="p-4 md:p-5 font-semibold">Email Address</th>
                <th className="p-4 md:p-5 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {team.map((member) => (
                <tr key={member.id} className="hover:bg-gray-800/30 transition-all text-sm">
                  <td className="p-4 md:p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-emerald-500 font-bold text-xs">
                        {member.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-white">{member.name}</span>
                    </div>
                  </td>
                  <td className="p-4 md:p-5">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-max ${
                      member.role === 'Super Admin' 
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {member.role === 'Super Admin' ? <Crown size={10} /> : <Shield size={10} />}
                      {member.role}
                    </span>
                  </td>
                  <td className="p-4 md:p-5 text-gray-400">
                    <div className="flex items-center gap-2">
                      <Mail size={14} />
                      {member.email}
                    </div>
                  </td>
                  <td className="p-4 md:p-5">
                    <div className="flex justify-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <p className="mt-4 text-center text-[10px] text-gray-600 md:hidden">
        Scroll horizontally to view details
      </p>
    </div>
  );
}