import React, { useState, useEffect } from 'react';
import { 
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiImage, FiX, FiExternalLink 
} from 'react-icons/fi';
import { 
  getAllRoomsAPI, 
  createRoomAPI, 
  updateRoomAPI, 
  deleteRoomAPI,
  getAllCategoriesAPI 
} from '../../../src/api/authAndAdminApi';
import toast from 'react-hot-toast';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    categorySlug: '',
    description: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

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
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setFormData({ name: room.name, categorySlug: room.categorySlug, description: room.description || '', image: null });
      setImagePreview(room.image);
    } else {
      setEditingRoom(null);
      setFormData({ name: '', categorySlug: '', description: '', image: null });
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRoom(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.categorySlug) return toast.error("Name and Category Link are required");

    const data = new FormData();
    data.append('name', formData.name);
    data.append('categorySlug', formData.categorySlug);
    data.append('description', formData.description);
    if (formData.image) data.append('image', formData.image);

    try {
      setIsSubmitting(true);
      const res = editingRoom 
        ? await updateRoomAPI(editingRoom._id, data)
        : await createRoomAPI(data);

      if (res.success) {
        toast.success(res.message || "Room saved successfully");
        fetchData();
        handleCloseModal();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this room? This cannot be undone.")) return;
    try {
      const res = await deleteRoomAPI(id);
      if (res.success) {
        toast.success("Room deleted");
        setRooms(prev => prev.filter(r => r._id !== id));
      }
    } catch (error) { toast.error("Delete failed"); }
  };

  const filteredRooms = rooms.filter(room => room.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Room Management</h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Homepage Content Editor</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-[#1a365d] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-all w-fit">
          <FiPlus size={20} /> Add New Room
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex items-center">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search rooms..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-transparent focus:border-[#1a365d] focus:bg-white transition-all text-sm font-medium outline-none" />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl h-64 flex items-center justify-center border border-gray-100 animate-pulse text-gray-400 font-bold uppercase">Loading Rooms...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div key={room._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-500">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={room.image || 'https://placehold.co/600x400'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={room.name} />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => handleOpenModal(room)} className="p-2.5 bg-white/90 backdrop-blur-md rounded-full text-blue-900 shadow-sm hover:bg-[#1a365d] hover:text-white transition-all"><FiEdit2 size={16} /></button>
                  <button onClick={() => handleDelete(room._id)} className="p-2.5 bg-white/90 backdrop-blur-md rounded-full text-rose-500 shadow-sm hover:bg-rose-500 hover:text-white transition-all"><FiTrash2 size={16} /></button>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-black uppercase tracking-tighter text-gray-900 mb-1">{room.name}</h3>
                <div className="flex items-center gap-2 text-[10px] text-[#1a365d] font-black bg-blue-50 w-fit px-3 py-1.5 rounded-full mb-3 uppercase">
                  <FiExternalLink /> {room.categorySlug}
                </div>
                <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">{room.description || "No description."}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
             <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">{editingRoom ? 'Edit Room' : 'Add New Room'}</h2>
                <button onClick={handleCloseModal} className="p-3 bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 transition-all"><FiX size={20} /></button>
             </div>

             <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Room Name</label>
                    <input name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Living Room" 
                      className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#1a365d] focus:bg-white outline-none transition-all font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Category</label>
                    <select name="categorySlug" value={formData.categorySlug} onChange={(e) => setFormData({...formData, categorySlug: e.target.value})}
                      className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#1a365d] focus:bg-white outline-none transition-all font-bold appearance-none">
                      <option value="">Select Category</option>
                      {categories.map(cat => <option key={cat._id} value={cat.slug}>{cat.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea name="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="3"
                    placeholder="Short summary..." className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#1a365d] focus:bg-white outline-none transition-all font-medium" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Room Image</label>
                  <div className="relative group">
                    <div className={`w-full h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden ${imagePreview ? 'border-solid border-blue-100' : 'border-gray-200 bg-gray-50'}`}>
                      {imagePreview ? (
                        <img src={imagePreview} className="w-full h-full object-cover" alt="preview" />
                      ) : (
                        <><FiImage size={32} className="text-gray-300 mb-2" /><p className="text-[10px] text-gray-400 font-bold uppercase">Click to upload</p></>
                      )}
                      <input type="file" onChange={(e) => {
                         const file = e.target.files[0];
                         if (file) { setFormData({...formData, image: file}); setImagePreview(URL.createObjectURL(file)); }
                      }} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                    </div>
                  </div>
                </div>
                
                <button type="submit" disabled={isSubmitting} className="w-full bg-[#1a365d] text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-black active:scale-[0.98] transition-all disabled:bg-gray-300 shadow-xl shadow-blue-900/10">
                  {isSubmitting ? 'Saving...' : editingRoom ? 'Update Room' : 'Create Room'}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;