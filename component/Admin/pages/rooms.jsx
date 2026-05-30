import React, { useState, useEffect } from 'react';
import { Layout, Plus, Search, Trash2, Loader2, AlertCircle, CheckCircle, Upload, X, Home } from 'lucide-react';
import { getAllRoomsAPI, createRoomAPI, deleteRoomAPI, getAllCategoriesAPI } from '../../../src/api/authAndAdminApi';
import imageCompression from 'browser-image-compression';

const Rooms = () => {
    const [rooms, setRooms] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [imageProcessing, setImageProcessing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showAddForm, setShowAddForm] = useState(false);
    const [preview, setPreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    
    const [newRoom, setNewRoom] = useState({
        name: '',
        categorySlug: '',
        description: '',
        isActive: true
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [roomsRes, catsRes] = await Promise.all([
                getAllRoomsAPI(),
                getAllCategoriesAPI()
            ]);
            if (roomsRes.success) setRooms(roomsRes.data);
            if (catsRes.success) setCategories(catsRes.data);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to load data' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageProcessing(true);
        try {
            const compressedFile = await imageCompression(file, { maxSizeMB: 0.2, maxWidthOrHeight: 800 });
            setPreview(URL.createObjectURL(compressedFile));
            setImageFile(compressedFile);
        } catch (err) {
            setMessage({ type: 'error', text: 'Image processing failed' });
        } finally {
            setImageProcessing(false);
        }
    };

    const handleAddRoom = async (e) => {
        e.preventDefault();
        if (!imageFile) return setMessage({ type: 'error', text: 'Please upload a room image' });
        if (!newRoom.categorySlug) return setMessage({ type: 'error', text: 'Please link a category' });
        
        setSubmitting(true);
        try {
            const data = new FormData();
            data.append('name', newRoom.name);
            data.append('categorySlug', newRoom.categorySlug);
            data.append('description', newRoom.description);
            data.append('isActive', newRoom.isActive);
            data.append('image', imageFile);

            const res = await createRoomAPI(data);
            if (res.success) {
                setMessage({ type: 'success', text: 'Room created successfully!' });
                setNewRoom({ name: '', categorySlug: '', description: '', isActive: true });
                setPreview(null); setImageFile(null); setShowAddForm(false);
                fetchData();
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Error adding room' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this room collection?")) return;
        try {
            const res = await deleteRoomAPI(id);
            if (res.success) {
                setRooms(prev => prev.filter(r => r._id !== id));
                setMessage({ type: 'success', text: 'Room deleted' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete' });
        }
    };

    return (
        <div className="p-4 md:p-8 bg-gray-950 min-h-screen text-gray-200">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2 uppercase tracking-tight">
                        <Home className="text-emerald-500" /> Room Management
                    </h1>
                    <p className="text-slate-400 text-xs mt-1">Manage "Shop by Room" collections</p>
                </div>
                <button onClick={() => setShowAddForm(!showAddForm)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20">
                    {showAddForm ? <Trash2 size={18} /> : <Plus size={18} />} {showAddForm ? 'Cancel' : 'New Room'}
                </button>
            </div>

            {showAddForm && (
                <form onSubmit={handleAddRoom} className="mb-8 bg-gray-900 border border-gray-800 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500">Room Name</label>
                        <input type="text" required value={newRoom.name} onChange={(e) => setNewRoom({...newRoom, name: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 outline-none" placeholder="e.g. Living Room" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500">Link Category</label>
                        <select required value={newRoom.categorySlug} onChange={(e) => setNewRoom({...newRoom, categorySlug: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 outline-none text-gray-300">
                            <option value="">-- Select Category --</option>
                            {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500">Room Image</label>
                        <div className="relative border-2 border-dashed border-gray-800 rounded-xl p-1 bg-gray-950 h-[42px] flex items-center justify-center overflow-hidden hover:border-emerald-500 transition-colors">
                            {preview ? <div className="flex items-center justify-between w-full px-3"><img src={preview} alt="Icon" className="w-8 h-8 object-cover rounded" /><button type="button" onClick={() => {setPreview(null); setImageFile(null);}} className="text-rose-500"><X size={14} /></button></div> : <><Upload size={14} className="text-gray-500 mr-2" /><span className="text-[10px] text-gray-500 font-bold uppercase">Upload Room Image</span><input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" /></>}
                        </div>
                    </div>
                    <button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold text-sm disabled:bg-gray-800">{submitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Create Room'}</button>
                </form>
            )}

            <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-800/30 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-gray-800">
                                <th className="p-5 w-32">Image</th>
                                <th className="p-5">Room Name</th>
                                <th className="p-5">Linked Category</th>
                                <th className="p-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? <tr><td colSpan="4" className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" /></td></tr> : rooms.map((room) => (
                                <tr key={room._id} className="hover:bg-gray-800/20 transition-colors">
                                    <td className="p-5"><img src={room.image} alt={room.name} className="w-20 h-12 object-cover rounded-lg" /></td>
                                    <td className="p-5 font-bold text-white text-sm">{room.name}</td>
                                    <td className="p-5 text-emerald-400 font-bold text-xs uppercase">{room.categorySlug}</td>
                                    <td className="p-5 text-right"><button onClick={() => handleDelete(room._id)} className="p-2 bg-gray-800 rounded-lg text-rose-400 hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={16} /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
export default Rooms;