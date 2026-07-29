import React, { useState, useEffect } from 'react';
import { 
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiImage, FiX, FiExternalLink 
} from 'react-icons/fi';
import { 
  getAllRoomsAPI, 
  createRoomAPI, 
  updateRoomAPI, 
  deleteRoomAPI,
  getAllCategoriesAPI,
  getAllProductsAPI // ✅ Fixed: Added missing API import
} from '../../../src/api/authAndAdminApi';
import toast from 'react-hot-toast';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [productSearch, setProductSearch] = useState(''); 
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    categorySlug: '',
    description: '',
    image: null,
    icon: null,
    products: [] // ✅ Ensured fallback default empty array
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomsRes, catsRes, prodsRes] = await Promise.all([
        getAllRoomsAPI(),
        getAllCategoriesAPI(),
        getAllProductsAPI({ limit: 1000 })
      ]);
      if (roomsRes.success) setRooms(roomsRes.data);
      if (catsRes.success) setCategories(catsRes.data);
      if (prodsRes.success) setAllProducts(prodsRes.data || prodsRes.products || []);
    } catch (error) {
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setFormData({ 
        name: room.name, 
        categorySlug: room.categorySlug, 
        description: room.description || '', 
        image: null,
        icon: null,
        products: room.products || [] 
      });
      setImagePreview(room.image || null);
      setIconPreview(room.icon || null);
    } else {
      setEditingRoom(null);
      setFormData({ 
        name: '', 
        categorySlug: '', 
        description: '', 
        image: null,
        icon: null,
        products: [] 
      });
      setImagePreview(null);
      setIconPreview(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRoom(null);
    setImagePreview(null);
    setIconPreview(null);
    setProductSearch('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.categorySlug) return toast.error("Name and Category Link are required");

    // ✅ Fixed: Appending selected products properly inside multi-part FormData
    const data = new FormData();
    data.append('name', formData.name);
    data.append('categorySlug', formData.categorySlug);
    data.append('description', formData.description);
    if (formData.image) data.append('image', formData.image);
    if (formData.icon) data.append('icon', formData.icon);
    
    // Arrays need to be stringified or appended individually for Backend parsing
    data.append('products', JSON.stringify(formData.products));

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

  const toggleProductSelection = (productId) => {
    const isSelected = formData.products.includes(productId);
    const newProducts = isSelected 
      ? formData.products.filter(id => id !== productId)
      : [...formData.products, productId];
    setFormData({ ...formData, products: newProducts });
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

  const selectableProducts = allProducts.filter(p => 
    p.name?.toLowerCase().includes(productSearch.toLowerCase()) || 
    p.brand?.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="p-6 bg-[#05070b] min-h-screen text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Room Management</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Homepage Content Editor</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-[#2563eb] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-all w-fit">
          <FiPlus size={20} /> Add New Room
        </button>
      </div>

      <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800 shadow-sm mb-6 flex items-center">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search rooms..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-900 rounded-xl border border-slate-800 focus:border-[#2563eb] focus:bg-slate-950 transition-all text-sm font-medium outline-none text-white" />
        </div>
      </div>

      {loading ? (
        <div className="bg-[#0f172a] rounded-3xl h-64 flex items-center justify-center border border-slate-800 animate-pulse text-slate-400 font-bold uppercase">Loading Rooms...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div key={room._id} className="bg-[#0f172a] rounded-3xl border border-slate-800 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-500">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={room.image || 'https://placehold.co/600x400'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={room.name} />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => handleOpenModal(room)} className="p-2.5 bg-slate-900/80 backdrop-blur-md rounded-full text-blue-300 shadow-sm hover:bg-[#2563eb] hover:text-white transition-all"><FiEdit2 size={16} /></button>
                  <button onClick={() => handleDelete(room._id)} className="p-2.5 bg-slate-900/80 backdrop-blur-md rounded-full text-rose-400 shadow-sm hover:bg-rose-500 hover:text-white transition-all"><FiTrash2 size={16} /></button>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-black uppercase tracking-tighter text-white mb-1">{room.name}</h3>
                <div className="flex items-center gap-2 text-[10px] text-blue-300 font-black bg-blue-500/10 w-fit px-3 py-1.5 rounded-full mb-3 uppercase">
                  <FiExternalLink /> {room.categorySlug}
                </div>
                <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">{room.description || "No description."}</p>
                {room.products && room.products.length > 0 && (
                  <p className="text-[9px] font-bold text-slate-500 uppercase mt-2">🛍️ {room.products.length} Products Linked</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
              <div className="p-8 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">{editingRoom ? 'Edit Room' : 'Add New Room'}</h2>
                <button onClick={handleCloseModal} className="p-3 bg-slate-900 rounded-full text-slate-400 hover:text-white transition-all"><FiX size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Room Name</label>
                    <input name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Living Room" 
                      className="w-full px-5 py-3.5 bg-slate-900 rounded-2xl border-2 border-transparent focus:border-[#2563eb] focus:bg-slate-950 outline-none transition-all font-bold text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Category</label>
                    <select name="categorySlug" value={formData.categorySlug} onChange={(e) => setFormData({...formData, categorySlug: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-900 rounded-2xl border-2 border-transparent focus:border-[#2563eb] focus:bg-slate-950 outline-none transition-all font-bold text-white appearance-none">
                      <option value="">Select Category</option>
                      {categories.map(cat => <option key={cat._id} value={cat.slug}>{cat.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea name="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="2"
                    placeholder="Short summary..." className="w-full px-5 py-3.5 bg-slate-900 rounded-2xl border-2 border-transparent focus:border-[#2563eb] focus:bg-slate-950 outline-none transition-all font-medium text-white" />
                </div>

                {/* ✅ Fixed: Product list cards UI aligned to Premium Light theme */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Featured Products ({formData.products.length})</label>
                    <div className="relative">
                       <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
                       <input 
                        type="text" 
                        placeholder="Search products..." 
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-full pl-8 pr-4 py-1.5 text-xs focus:bg-slate-950 focus:border-[#2563eb] outline-none w-48 font-medium text-white" 
                       />
                    </div>
                  </div>
                  <div className="bg-slate-900 rounded-2xl border border-slate-800 p-2 max-h-48 overflow-y-auto">
                    <div className="grid grid-cols-1 gap-1">
                      {selectableProducts.length === 0 ? (
                        <p className="text-[10px] uppercase font-bold text-slate-500 text-center py-4">No products found</p>
                      ) : (
                        selectableProducts.map(product => (
                          <div 
                            key={product._id} 
                            onClick={() => toggleProductSelection(product._id)}
                            className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${formData.products.includes(product._id) ? 'bg-blue-500/10 border border-blue-500/30' : 'hover:bg-slate-950 border border-transparent'}`}
                          >
                            <img src={product.thumbnail || product.images?.[0] || 'https://placehold.co/50'} className="w-9 h-9 object-cover rounded-lg bg-slate-800" alt="" />
                            <div className="flex-1">
                              <p className="text-xs font-bold text-white line-clamp-1">{product.name}</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{product.brand} • ₹{product.sellingPrice}</p>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${formData.products.includes(product._id) ? 'bg-[#2563eb] border-[#2563eb]' : 'border-slate-600'}`}>
                              {formData.products.includes(product._id) && <FiX className="text-white" size={10} />}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Room Image</label>
                    <div className="relative group">
                      <div className={`w-full h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden ${imagePreview ? 'border-solid border-blue-500/40' : 'border-slate-700 bg-slate-900'}`}>
                        {imagePreview ? (
                          <img src={imagePreview} className="w-full h-full object-cover" alt="preview" />
                        ) : (
                          <><FiImage size={28} className="text-slate-500 mb-1" /><p className="text-[9px] text-slate-400 font-bold uppercase">Click to upload</p></>
                        )}
                        <input type="file" onChange={(e) => {
                           const file = e.target.files[0];
                           if (file) { setFormData({...formData, image: file}); setImagePreview(URL.createObjectURL(file)); }
                        }} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Room Icon</label>
                    <div className="relative group">
                      <div className={`w-full h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden ${iconPreview ? 'border-solid border-blue-500/40' : 'border-slate-700 bg-slate-900'}`}>
                        {iconPreview ? (
                          <img src={iconPreview} className="w-full h-full object-cover" alt="icon preview" />
                        ) : (
                          <><FiImage size={28} className="text-slate-500 mb-1" /><p className="text-[9px] text-slate-400 font-bold uppercase">Upload icon</p></>
                        )}
                        <input type="file" onChange={(e) => {
                           const file = e.target.files[0];
                           if (file) { setFormData({...formData, icon: file}); setIconPreview(URL.createObjectURL(file)); }
                        }} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <button type="submit" disabled={isSubmitting} className="w-full bg-[#2563eb] text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#1d4ed8] active:scale-[0.98] transition-all disabled:bg-slate-700 shadow-xl shadow-blue-900/20 text-xs">
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