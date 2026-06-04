import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Loader2, LayoutGrid, Globe } from 'lucide-react';
import { getAllRoomsAPI, deleteRoomAPI } from '../../../src/api/authAndAdminApi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const RoomManagement = () => {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const res = await getAllRoomsAPI();
            if (res.success) setRooms(res.data || []);
        } catch (err) {
            toast.error("Failed to load rooms");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRooms(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this room?")) return;
        try {
            setDeletingId(id);
            const res = await deleteRoomAPI(id);
            if (res.success) {
                toast.success("Room deleted");
                setRooms(prev => prev.filter(r => r._id !== id));
            }
        } catch (err) {
            toast.error("Delete failed");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="p-6 bg-gray-950 min-h-screen text-gray-200">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                        <LayoutGrid className="text-emerald-500" /> Room Management
                    </h1>
                    <p className="text-xs text-gray-500 font-bold uppercase">Manage "Shop by Room" Sections</p>
                </div>
                <button 
                    onClick={() => navigate('/admin/add-room')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
                >
                    <Plus size={16} /> Add New Room
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map((room) => (
                        <div key={room._id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden group hover:border-emerald-500/50 transition-all">
                            <div className="h-40 relative overflow-hidden bg-gray-800">
                                <img 
                                    src={room.image || 'https://placehold.co/400x200?text=No+Image'} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                    alt={room.name} 
                                />
                                <div className="absolute top-3 right-3">
                                    <button 
                                        onClick={() => handleDelete(room._id)}
                                        className="p-2 bg-rose-500/20 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all backdrop-blur-md"
                                    >
                                        {deletingId === room._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="font-black text-lg text-white uppercase tracking-tight">{room.name}</h3>
                                <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-bold mt-1 uppercase">
                                    <Globe size={12} /> {room.categorySlug}
                                </div>
                                <p className="text-gray-500 text-xs mt-3 line-clamp-2">{room.description || 'No description provided.'}</p>
                                
                                <div className="mt-5 pt-4 border-t border-gray-800 flex justify-between items-center">
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${room.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-800 text-gray-500'}`}>
                                        {room.isActive ? 'Live' : 'Hidden'}
                                    </span>
                                    <button 
                                        onClick={() => navigate(`/admin/edit-room/${room._id}`)}
                                        className="text-[10px] font-black uppercase text-gray-400 hover:text-emerald-500 transition-colors"
                                    >
                                        Edit Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {rooms.length === 0 && (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-800 rounded-3xl">
                            <LayoutGrid size={48} className="mx-auto text-gray-800 mb-4" />
                            <p className="text-gray-500 font-bold uppercase text-sm">No rooms configured in database</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RoomManagement;