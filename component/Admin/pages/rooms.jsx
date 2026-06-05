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
import imageCompression from 'browser-image-compression'; // ✅ Image handling ke liye
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
  const [imageProcessing, setImageProcessing] = useState(false); // ✅ Processing state

  // ✅ SEO Keyword Generator (EditProduct ki tarah)
  const STOPWORDS = ["is", "the", "a", "an", "and", "for", "ke", "liye", "mujhe", "chahiye", "ko", "par", "ek", "hai", "mein", "this", "that", "with"];
  
  const createSearchKeywords = (title, description) => {
    if (!title || !description) return [];
    // HTML tags remove karein aur lowercase karein
    const plainText = description.replace(/<[^>]*>/g, ' ');
    const combinedText = `${title} ${plainText}`.toLowerCase();
    
    const cleanWords = combinedText.replace(/[^\w\s]/g, ' ').split(/\s+/);
    
    return [...new Set(cleanWords.filter(word => word.length > 2 && !STOPWORDS.includes(word)))];
  };

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

  // ✅ Robust Image Selection & WebP Conversion
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageProcessing(true);
    try {
      // 1. Compress Image
      const compressedFile = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1200 });
      // 2. Convert to WebP
      const webpFile = await convertToWebP(compressedFile);
      
      setFormData({ ...formData, image: webpFile });
      setImagePreview(URL.createObjectURL(webpFile));
      toast.success("Image processed successfully!");
    } catch (err) {
      console.error("Processing error:", err);
      toast.error("Failed to process image");
    } finally {
      setImageProcessing(false);
    }
  };

  const convertToWebP = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(objectUrl);
          resolve(new File([blob], file.name.split('.')[0] + '.webp', { type: 'image/webp' }));
        }, 'image/webp', 0.8);
      };
      img.onerror = (err) => { URL.revokeObjectURL(objectUrl); reject(err); };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.categorySlug) return toast.error("Name and Category Link are required");

    const updatedKeywords = createSearchKeywords(formData.name, formData.description);

    const data = new FormData();
    data.append('name', formData.name.trim());
    data.append('categorySlug', formData.categorySlug);
    data.append('description', formData.description);
    data.append('seoKeywords', JSON.stringify(updatedKeywords)); // ✅ Match SEO logic
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
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Room Management</h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Homepage Content Editor</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-2xl shadow-emerald-900/20 active:scale-95 transition-all w-fit uppercase text-[11px] tracking-widest">
          <FiPlus size={20} /> Add New Room
        </button>
      </div>

      <div className="bg-zinc-900/30 p-6 rounded-[32px] border border-white/5 shadow-2xl mb-10 flex items-center backdrop-blur-md">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input type="text" placeholder="Search rooms..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-black rounded-2xl border border-white/10 focus:border-emerald-500/50 transition-all text-sm font-medium outline-none text-white" />
        </div>
      </div>

      {loading ? (
        <div className="bg-zinc-900/20 rounded-[40px] h-64 flex items-center justify-center border border-white/5 animate-pulse text-zinc-700 font-black uppercase tracking-widest text-xs">Syncing Room Data...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div key={room._id} className="bg-zinc-900/40 rounded-[40px] border border-white/5 shadow-2xl overflow-hidden group hover:border-emerald-500/30 transition-all duration-500 flex flex-col backdrop-blur-sm">
              <div className="relative aspect-[16/10] overflow-hidden bg-zinc-800">
                <img src={room.image || 'https://placehold.co/600x400?text=No+Image'} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100" alt={room.name} />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => handleOpenModal(room)} className="p-3 bg-black/40 backdrop-blur-xl rounded-full text-white border border-white/10 hover:bg-white hover:text-black transition-all shadow-xl"><FiEdit2 size={14} /></button>
                  <button onClick={() => handleDelete(room._id)} className="p-3 bg-black/40 backdrop-blur-xl rounded-full text-rose-500 border border-white/10 hover:bg-rose-500 hover:text-white transition-all shadow-xl"><FiTrash2 size={14} /></button>
                </div>
              </div>
              <div className="p-8 flex-1">
                <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-1">{room.name}</h3>
                <div className="flex items-center gap-2 text-[9px] text-emerald-400 font-black bg-emerald-500/5 w-fit px-3 py-1.5 rounded-full mb-4 uppercase border border-emerald-500/10">
                  <FiExternalLink /> {room.categorySlug}
                </div>
                <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">{room.description || "No description."}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-black w-full max-w-2xl rounded-[48px] shadow-2xl border border-white/10 overflow-hidden relative max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
             <div className="p-10 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">{editingRoom ? 'Edit Room' : 'Add New Room'}</h2>
                <button onClick={handleCloseModal} className="p-3 bg-zinc-900 rounded-full text-zinc-500 hover:text-white transition-all"><FiX size={20} /></button>
             </div>

             <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">Room Name</label>
                    <input name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Living Room" 
                      className="w-full px-6 py-4 bg-zinc-900/50 rounded-2xl border-2 border-white/5 focus:border-emerald-500 outline-none transition-all font-bold text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">Target Category</label>
                    <select name="categorySlug" value={formData.categorySlug} onChange={(e) => setFormData({...formData, categorySlug: e.target.value})}
                      className="w-full px-6 py-4 bg-zinc-900/50 rounded-2xl border-2 border-white/5 focus:border-emerald-500 outline-none transition-all font-bold appearance-none text-white">
                      <option value="">Select Category</option>
                      {categories.map(cat => <option key={cat._id} value={cat.slug}>{cat.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">Description</label>
                  <textarea name="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="3"
                    placeholder="Short summary..." className="w-full px-6 py-4 bg-zinc-900/50 rounded-2xl border-2 border-white/5 focus:border-emerald-500 outline-none transition-all font-medium text-white" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">Room Image</label>
                  <div className="relative group">
                    <div className={`w-full h-48 rounded-[32px] border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden ${imagePreview ? 'border-solid border-white/10' : 'border-white/5 bg-zinc-900/50 hover:border-white/20'}`}>
                      {imageProcessing ? (
                        <Loader2 className="animate-spin text-emerald-500" size={32} />
                      ) : imagePreview ? (
                        <img src={imagePreview} className="w-full h-full object-cover p-2 rounded-[32px]" alt="preview" />
                      ) : (
                        <><FiImage size={32} className="text-zinc-700 mb-2" /><p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Click to upload</p></>
                      )}
                      <input type="file" disabled={imageProcessing} onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                    </div>
                  </div>
                </div>
                
                <button type="submit" disabled={isSubmitting || imageProcessing} className="w-full bg-emerald-500 text-black py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-xs hover:bg-emerald-400 active:scale-[0.98] transition-all disabled:bg-zinc-900 disabled:text-zinc-700 shadow-2xl shadow-emerald-500/10">
                  {isSubmitting ? 'Syncing...' : imageProcessing ? 'Processing Image...' : editingRoom ? 'Update Room' : 'Create Room'}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;