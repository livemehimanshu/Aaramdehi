import React, { useState, useEffect } from 'react';
import { Trash2, CheckCircle, Search, Loader2, Calendar } from 'lucide-react';
import { getAllAppointmentsAPI, confirmAppointmentAPI, deleteAppointmentAPI } from '../../../src/api/authAndAdminApi';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllAppointmentsAPI();
      if (res.success) setAppointments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConfirm = async (id) => {
    try {
      const res = await confirmAppointmentAPI(id);
      if (res.success) fetchData();
    } catch (err) { alert("Error confirming"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete booking?")) return;
    try {
      const res = await deleteAppointmentAPI(id);
      if (res.success) setAppointments(prev => prev.filter(a => a._id !== id));
    } catch (err) { alert("Error deleting"); }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-950 min-h-screen text-gray-200">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
            <Calendar className="text-blue-500" /> Appointment Management
          </h1>
          <p className="text-slate-500 text-xs mt-1">Manage consultation and service bookings</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search customer..." 
            className="pl-10 p-2 bg-gray-900 border border-gray-800 rounded-lg w-64 focus:border-blue-500 outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
      ) : (
        <div className="overflow-x-auto bg-gray-900 border border-gray-800 rounded-2xl shadow-xl">
          <table className="w-full text-left">
            <thead className="bg-gray-800/50 border-b border-gray-800 text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-5">Customer Details</th>
                <th className="p-5">Service/Subject</th>
                <th className="p-5">Scheduled Date</th>
                <th className="p-5 text-center">Status</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {appointments.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase())).map((apt) => (
                <tr key={apt._id} className="hover:bg-gray-800/20 transition-all">
                  <td className="p-5 font-bold text-white">
                    {apt.name}
                    <p className="text-[10px] text-slate-500 font-normal">{apt.email} | {apt.phone}</p>
                  </td>
                  <td className="p-5 text-gray-400 text-sm">{apt.subject}</td>
                  <td className="p-5 text-slate-300 text-sm">{new Date(apt.date).toLocaleDateString()} at {apt.time}</td>
                  <td className="p-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      apt.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="p-5 text-right flex justify-end gap-3">
                    {apt.status === 'pending' && (
                      <button onClick={() => handleConfirm(apt._id)} className="text-emerald-500 hover:scale-110 transition-transform"><CheckCircle size={18} /></button>
                    )}
                    <button onClick={() => handleDelete(apt._id)} className="text-rose-500 hover:scale-110 transition-transform"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}