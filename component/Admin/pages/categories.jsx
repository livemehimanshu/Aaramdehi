import React, { useState, useEffect } from 'react';
import { Tags, Plus, Search, Trash2, Edit2, Loader2, AlertCircle, CheckCircle, Layers, Upload, X } from 'lucide-react';
import { getAllCategoriesAPI, createCategoryAPI, deleteCategoryAPI } from '../../../src/api/authAndAdminApi';
import imageCompression from 'browser-image-compression';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [imageProcessing, setImageProcessing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showAddForm, setShowAddForm] = useState(false);
    const [preview, setPreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    
    const [newCategory, setNewCategory] = useState({
        name: '',
        icon: '',
        description: '',
        subCategories: '', // ✅ सब-कैटेगरी के लिए नई स्टेट
        isActive: true
    });

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await getAllCategoriesAPI();
            if (res.success) setCategories(res.data);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to load categories' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // 🖼️ Image Selection and WebP Conversion Logic
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImageProcessing(true);
        setMessage({ type: '', text: '' });
        try {
            // 1. Compress Image
            const compressedFile = await imageCompression(file, { maxSizeMB: 0.2, maxWidthOrHeight: 500 });
            // 2. Convert to WebP
            const webpFile = await convertToWebP(compressedFile);
            
            setPreview(URL.createObjectURL(webpFile));
            setImageFile(webpFile);
        } catch (err) {
            console.error("Image processing failed:", err);
            setMessage({ type: 'error', text: 'Image processing failed' });
        } finally {
            setImageProcessing(false);
        }
    };

    const convertToWebP = (file) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                canvas.getContext('2d').drawImage(img, 0, 0);
                canvas.toBlob((blob) => {
                    resolve(new File([blob], file.name.split('.')[0] + '.webp', { type: 'image/webp' }));
                }, 'image/webp', 0.8);
            };
        });
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!imageFile && !newCategory.icon) return setMessage({ type: 'error', text: 'Please provide an icon or image' });
        
        setSubmitting(true);
        try {
            const data = new FormData();
            data.append('name', newCategory.name || "");
            data.append('description', newCategory.description || "");
            data.append('isActive', newCategory.isActive);
            
            // ✅ Always send subCategories (even if empty) to prevent backend .split() crashes
            data.append('subCategories', newCategory.subCategories || "");

            // ✅ Separation of concerns: 'icon' field for the emoji string, 'image' field for the file.
            // Multer expects a file stream in the 'image' field. Sending a string there 
            // can cause the body parser to fail entirely, leading to the 500 error.
            data.append('icon', newCategory.icon || "");
            
            if (imageFile) {
                data.append('image', imageFile);
            }

            const res = await createCategoryAPI(data);
            if (res.success) {
                setMessage({ type: 'success', text: 'Category added successfully!' });
                setNewCategory({ name: '', icon: '', description: '', subCategories: '', isActive: true });
                setPreview(null);
                setImageFile(null);
                setShowAddForm(false);
                fetchCategories();
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Error adding category' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this category? Products in this category will become uncategorized.")) return;
        try {
            const res = await deleteCategoryAPI(id);
            if (res.success) {
                setCategories(prev => prev.filter(c => c._id !== id));
                setMessage({ type: 'success', text: 'Category deleted' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete' });
        }
    };

    const filteredCategories = categories.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8 bg-gray-950 min-h-screen text-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2 uppercase tracking-tight">
                        <Layers className="text-emerald-500" /> Category Management
                    </h1>
                    <p className="text-slate-400 text-xs mt-1">Organize your products into collections</p>
                </div>
                <button 
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
                >
                    {showAddForm ? <Trash2 size={18} /> : <Plus size={18} />}
                    {showAddForm ? 'Cancel' : 'New Category'}
                </button>
            </div>

            {message.text && (
                <div className={`p-4 mb-6 rounded-xl flex items-center gap-3 border ${
                    message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}>
                    {message.type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
                    <p className="text-sm font-medium">{message.text}</p>
                </div>
            )}

            {showAddForm && (
                <form onSubmit={handleAddCategory} className="mb-8 bg-gray-900 border border-gray-800 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500">Category Name</label>
                        <input 
                            type="text" required value={newCategory.name}
                            onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 outline-none transition-all"
                            placeholder="e.g. Pillows"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500">Category Icon (Image/WebP)</label>
                        <div className="relative border-2 border-dashed border-gray-800 rounded-xl p-1 bg-gray-950 h-[42px] flex items-center justify-center overflow-hidden hover:border-emerald-500 transition-colors">
                            {preview ? (
                                <div className="flex items-center justify-between w-full px-3">
                                    <img src={preview} alt="Icon" className="w-8 h-8 object-contain rounded" />
                                    <button type="button" onClick={() => {setPreview(null); setImageFile(null);}} className="text-rose-500">
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Upload size={14} className="text-gray-500 mr-2" />
                                    <span className="text-[10px] text-gray-500 font-bold uppercase">Upload Icon</span>
                                    <input 
                                        type="file" accept="image/*" 
                                        onChange={handleImageChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer" 
                                    />
                                </>
                            )}
                        </div>
                        {imageProcessing && <p className="text-[8px] text-emerald-500 animate-pulse font-bold">CONVERTING TO WEBP...</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500">Description</label>
                        <input 
                            type="text" value={newCategory.description}
                            onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 outline-none transition-all"
                            placeholder="Brief details..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500">Sub Categories (Comma Separated)</label>
                        <input 
                            type="text" value={newCategory.subCategories}
                            onChange={(e) => setNewCategory({...newCategory, subCategories: e.target.value})}
                            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 outline-none transition-all"
                            placeholder="e.g. Pillows, Cushions, Covers"
                        />
                    </div>
                    <button 
                        type="submit" disabled={submitting}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold text-sm disabled:bg-gray-800"
                    >
                        {submitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Create Category'}
                    </button>
                </form>
            )}

            <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-gray-800 bg-gray-900/50">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input 
                            type="text" placeholder="Search categories..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-xs focus:border-emerald-500 outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-800/30 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-gray-800">
                                <th className="p-5 w-20">Icon</th>
                                <th className="p-5">Name</th>
                                <th className="p-5">Slug</th>
                                <th className="p-5">Sub Categories</th>
                                <th className="p-5">Products</th>
                                <th className="p-5">Status</th>
                                <th className="p-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr><td colSpan="5" className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" /></td></tr>
                            ) : filteredCategories.map((cat) => (
                                <tr key={cat._id} className="hover:bg-gray-800/20 transition-colors group">
                                    <td className="p-5 text-2xl">
                                        {/* ✅ Support both 'image' and 'icon' fields for visual consistency */}
                                        {(cat.image || cat.icon)?.startsWith('http') ? (
                                            <img src={cat.image || cat.icon} alt={cat.name} className="w-10 h-10 object-contain rounded-lg" />
                                        ) : (
                                            cat.icon || cat.image || '🎁'
                                        )}
                                    </td>
                                    <td className="p-5 font-bold text-white text-sm">{cat.name}</td>
                                    <td className="p-5 text-slate-500 text-xs font-mono">{cat.slug || '/'+cat.name.toLowerCase()}</td>
                                    <td className="p-5">
                                        <div className="flex flex-wrap gap-1">
                                            {Array.isArray(cat.subCategories) && cat.subCategories.map((sub, i) => (
                                                <span key={i} className="bg-gray-800 text-gray-400 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tighter">{sub}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-5 text-emerald-400 font-bold text-sm">{cat.productCount || 0} Items</td>
                                    <td className="p-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${cat.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500'}`}>
                                            {cat.isActive ? 'Active' : 'Hidden'}
                                        </span>
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleDelete(cat._id)} className="p-2 bg-gray-800 rounded-lg text-rose-400 hover:bg-rose-500 hover:text-white transition-all">
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
        </div>
    );
};

export default Categories;