import React, { useState, useEffect } from 'react';
import { UserPlus, Shield, Trash2, Edit2, Mail, Crown, Users, X, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { getTeamMembersAPI, addTeamMemberAPI, updateTeamMemberAPI, deleteTeamMemberAPI } from '../../../src/api/authAndAdminApi';

export default function TeamPage() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Manager' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    setLoading(true);
    const res = await getTeamMembersAPI();
    if (res.success) {
      setTeam(res.data);
    } else {
      toast.error('Failed to load team members');
    }
    setLoading(false);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await addTeamMemberAPI(formData);
    if (res.success) {
      toast.success('Team member added');
      setIsAddModalOpen(false);
      fetchTeam();
      setFormData({ name: '', email: '', password: '', role: 'Manager' });
    } else {
      toast.error(res.message || 'Failed to add member');
    }
    setIsSubmitting(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await updateTeamMemberAPI(selectedMember.id, { role: formData.role });
    if (res.success) {
      toast.success('Role updated successfully');
      setIsEditModalOpen(false);
      fetchTeam();
    } else {
      toast.error(res.message || 'Failed to update role');
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    const res = await deleteTeamMemberAPI(id);
    if (res.success) {
      toast.success('Member removed');
      setTeam(team.filter(m => m.id !== id));
    } else {
      toast.error(res.message || 'Failed to remove member');
    }
  };

  const openEdit = (member) => {
    setSelectedMember(member);
    setFormData({ ...formData, role: member.role });
    setIsEditModalOpen(true);
  };

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
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all font-semibold shadow-lg shadow-emerald-900/20 text-sm"
        >
          <UserPlus size={18} /> Add Member
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-gray-800/50 text-gray-500 text-[10px] md:text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 md:p-5 font-semibold">Member Name</th>
                <th className="p-4 md:p-5 font-semibold">Role & Access</th>
                <th className="p-4 md:p-5 font-semibold">Email Address</th>
                <th className="p-4 md:p-5 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-gray-500 font-semibold animate-pulse">Loading team members...</td>
                </tr>
              ) : team.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-gray-500">No team members found.</td>
                </tr>
              ) : team.map((member) => (
                <tr key={member.id} className="hover:bg-gray-800/30 transition-all text-sm">
                  <td className="p-4 md:p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-emerald-500 font-bold text-xs">
                        {member.name ? member.name.charAt(0) : 'U'}
                      </div>
                      <span className="font-semibold text-white">{member.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="p-4 md:p-5">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-max ${
                      member.role === 'Super Admin' || member.role === 'ADMIN'
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {member.role === 'Super Admin' || member.role === 'ADMIN' ? <Crown size={10} /> : <Shield size={10} />}
                      {member.role}
                    </span>
                  </td>
                  <td className="p-4 md:p-5 text-gray-500">
                    <div className="flex items-center gap-2">
                      <Mail size={14} />
                      {member.email}
                    </div>
                  </td>
                  <td className="p-4 md:p-5">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => openEdit(member)} className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(member.id)} className="p-2 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all">
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

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Add Team Member</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-emerald-500" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-emerald-500" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Password</label>
                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-emerald-500" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-emerald-500">
                  <option value="Manager">Manager</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>
              <button disabled={isSubmitting} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white py-3 rounded-lg font-bold transition-all mt-4">
                {isSubmitting ? 'Adding...' : 'Add Member'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Update Role</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Select Role for {selectedMember?.name}</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-emerald-500">
                  <option value="Manager">Manager</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>
              <button disabled={isSubmitting} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white py-3 rounded-lg font-bold transition-all mt-4">
                {isSubmitting ? 'Updating...' : 'Update Role'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}