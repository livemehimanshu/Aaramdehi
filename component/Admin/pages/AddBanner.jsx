import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Loader2, CheckCircle, AlertCircle, Image as ImageIcon, Layout } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { createBannerAPI } from '../../../src/api/authAndAdminApi';

// Define valid sections that match your Backend Enum
const BANNER_SECTIONS = [
    { id: 'hero', name: 'Hero Section (Main Slider)' },
    { id: 'promotional', name: 'Promotional Section' },
    { id: 'seasonal', name: 'Seasonal Offers' },
    { id: 'category', name: 'Category Pages' },
    { id: 'product', name: 'Product Pages' },
    { id: 'bedroom', name: 'Bedroom Section (Refresh Your Bedroom)' }
];

const AddBanner = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [imageProcessing, setImageProcessing] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [preview, setPreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        link: '',
        category: '',
        position: 0
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImageProcessing(true);
        setMessage({ type: '', text: '' });
        try {
            // Use same settings as product upload for consistency
            const compressedFile = await imageCompression(file, { maxSizeMB: 0.8, maxWidthOrHeight: 1920 });
            const webpFile = await convertToWebP(compressedFile);
            
            setPreview(URL.createObjectURL(webpFile));
            setImageFile(webpFile);
            setMessage({ type: 'success', text: 'Image processed successfully ✓' });
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
        
        if (!imageFile) return setMessage({ type: 'error', text: 'Banner image is required!' });
        if (!formData.category) return setMessage({ type: 'error', text: 'Please select a placement section!' });

        setLoading(true);
        setMessage({ type: '', text: '' }); // Clear previous messages
        
        try {
            const data = new FormData();
            
            if (imageProcessing) return setMessage({ type: 'error', text: 'Please wait, image is still processing...' });

            // Debugging log to verify file
            console.log("📤 Uploading Banner:", {
                name: imageFile.name,
                size: (imageFile.size / 1024).toFixed(2) + " KB",
                type: imageFile.type
            });

            data.append('title', formData.title);
            data.append('link', formData.link);
            data.append('category', formData.category);
            data.append('position', Number(formData.position));
            data.append('image', imageFile);

            const response = await createBannerAPI(data);

            if (response.success) {
                setMessage({ type: 'success', text: 'Banner added successfully!' });
                setTimeout(() => navigate('/admin/banners'), 2000);
            } else {
                setMessage({ type: 'error', text: response.message || 'Failed to add banner' });
            }
        } catch (error) {
            console.error("Submission Error:", error);
            let errorMsg = 'Server error while uploading banner';
            if (error.code === 'ERR_NETWORK') {
                errorMsg = 'Backend server is not running! Please start the server on port 5000.';
            } else if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            }
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 bg-gray-950 min-h-screen text-gray-200">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2 uppercase tracking-tight">
                        <Layout className="text-blue-500" /> Add New Banner
                    </h1>
                    <p className="text-slate-400 text-xs mt-1">Create promotional sliders for your homepage</p>
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
                        {/* Title */}
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-slate-500">Banner Title</label>
                            <input 
                                type="text" name="title" required
                                value={formData.title} onChange={handleInputChange}
                                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                                placeholder="E.g. Summer Collection 2024"
                            />
                        </div>

                        {/* Position */}
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-slate-500">Display Order (Position)</label>
                            <input 
                                type="number" name="position"
                                value={formData.position} onChange={handleInputChange}
                                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                                placeholder="0"
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Section Selection */}
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-slate-500">Placement Section</label>
                            <select 
                                name="category" value={formData.category} onChange={handleInputChange}
                                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all appearance-none"
                            >
                                <option value="">Select Section</option>
                                {BANNER_SECTIONS.map(section => (
                                    <option key={section.id} value={section.id}>{section.name}</option>
                                 ))}
                            </select>
                        </div>

                        {/* Target Link */}
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-slate-500">Target Link (URL)</label>
                            <input 
                                type="text" name="link"
                                value={formData.link} onChange={handleInputChange}
                                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                                placeholder="E.g. /products or /product/ID"
                            />
                            <div className="flex flex-wrap gap-2 mt-1">
                                {['/', '/products', '/wishlist'].map(path => (
                                    <button
                                        key={path}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, link: path }))}
                                        className="text-[9px] font-bold bg-gray-800 hover:bg-blue-600 text-slate-300 hover:text-white px-2 py-1 rounded transition-all"
                                    >
                                        {path}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Image Upload Area */}
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-500">Banner Image</label>
                        <div className={`relative border-2 border-dashed rounded-2xl transition-all ${
                            preview ? 'border-blue-500/50 bg-blue-500/5' : 'border-gray-800 hover:border-gray-700 bg-gray-950'
                        }`}>
                            <input 
                                type="file" accept="image/*" 
                                onChange={handleImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            
                            {preview ? (
                                <div className="p-4 relative">
                                    <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-xl border border-gray-800" />
                                    <button 
                                        type="button" onClick={() => {setPreview(null); setImageFile(null);}}
                                        className="absolute top-6 right-6 p-2 bg-rose-600 rounded-full text-white shadow-xl hover:bg-rose-500 transition-all z-20"
                                    >
                                        <X size={16} />
                                    </button>
                                    {imageProcessing && <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}
                                </div>
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center gap-3">
                                    <div className="p-4 bg-gray-900 rounded-full text-blue-500">
                                        <Upload size={32} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-gray-300">{imageProcessing ? 'Processing...' : 'Click to upload banner'}</p>
                                        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Recommended: 1920x600px (JPG/PNG/WEBP)</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button 
                            type="submit" disabled={loading || imageProcessing}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : imageProcessing ? 'Processing Image...' : 'Save Banner'}
                        </button>
                        <button type="button" onClick={() => navigate('/admin/banners')} className="px-8 py-4 border border-gray-800 rounded-xl font-black uppercase text-xs text-slate-400 hover:bg-gray-800 transition-all">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddBanner;