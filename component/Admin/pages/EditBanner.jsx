import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, X, Loader2, CheckCircle, AlertCircle, Layout, Save } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { getBannerByIdAPI, updateBannerAPI } from '../../../src/api/authAndAdminApi';

const BANNER_SECTIONS = [
    { id: 'hero', name: 'Hero Section (Main Slider)' },
    { id: 'promotional', name: 'Promotional Section' },
    { id: 'seasonal', name: 'Seasonal Offers' },
    { id: 'category', name: 'Category Pages' },
    { id: 'product', name: 'Product Pages' },
    { id: 'bedroom', name: 'Bedroom Section (Refresh Your Bedroom)' }
];

const EditBanner = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [imageProcessing, setImageProcessing] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [preview, setPreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        link: '',
        category: '',
        position: 0,
        isActive: true
    });

    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const res = await getBannerByIdAPI(id);
                if (res.success) {
                    setFormData({
                        title: res.data.title || '',
                        link: res.data.link || '',
                        category: res.data.category || '',
                        position: res.data.position || 0,
                        isActive: res.data.isActive ?? true
                    });
                    setPreview(res.data.image);
                }
            } catch (error) {
                setMessage({ type: 'error', text: 'Failed to load banner details' });
            } finally {
                setLoading(false);
            }
        };
        fetchBanner();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImageProcessing(true);
        try {
            const compressedFile = await imageCompression(file, { maxSizeMB: 0.8, maxWidthOrHeight: 1920 });
            const webpFile = await convertToWebP(compressedFile);
            setPreview(URL.createObjectURL(webpFile));
            setImageFile(webpFile);
        } catch (err) {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('link', formData.link);
            data.append('category', formData.category);
            data.append('position', formData.position);
            data.append('isActive', formData.isActive);
            if (imageFile) data.append('image', imageFile);

            const response = await updateBannerAPI(id, data);
            if (response.success) {
                setMessage({ type: 'success', text: 'Banner updated successfully!' });
                setTimeout(() => navigate('/admin/banners'), 2000);
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Update failed' });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Loading Banner Details...</div>;

    return (
        <div className="p-4 md:p-8 bg-gray-950 min-h-screen text-gray-200">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2 uppercase tracking-tight">
                        <Layout className="text-blue-500" /> Edit Banner
                    </h1>
                </div>

                {message.text && (
                    <div className={`p-4 mb-6 rounded-xl flex items-center gap-3 border ${
                        message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}>
                        {message.type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
                        <p className="text-sm font-medium">{message.text}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-slate-500">Banner Title</label>
                            <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-slate-500">Display Order</label>
                            <input type="number" name="position" value={formData.position} onChange={handleInputChange} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-slate-500">Placement Section</label>
                            <select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all">
                                {BANNER_SECTIONS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-slate-500">Target Link</label>
                            <input 
                                type="text" name="link"
                                value={formData.link} onChange={handleInputChange}
                                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                                placeholder="E.g. /products or /product/ID"
                            />
                            <div className="flex flex-wrap gap-2 mt-1">
                                {['/', '/products', '/wishlist'].map(path => (
                                    <button key={path} type="button" onClick={() => setFormData(prev => ({ ...prev, link: path }))}
                                        className="text-[9px] font-bold bg-gray-800 hover:bg-blue-600 text-slate-300 hover:text-white px-2 py-1 rounded transition-all">
                                        {path}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-500">Banner Image</label>
                        <div className="relative border-2 border-dashed border-gray-800 rounded-2xl p-4 bg-gray-950">
                            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            {preview && <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-xl border border-gray-800" />}
                            <div className="mt-2 text-center text-[10px] text-slate-500">Click to change image</div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="submit" disabled={updating || imageProcessing} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2">
                            {updating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            {updating ? 'Updating...' : 'Update Banner'}
                        </button>
                        <button type="button" onClick={() => navigate('/admin/banners')} className="px-8 py-4 border border-gray-800 rounded-xl font-black uppercase text-xs text-slate-400">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditBanner;