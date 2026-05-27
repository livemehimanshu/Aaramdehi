import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit3, Plus, Loader2, Image as ImageIcon, ExternalLink, LayoutList } from 'lucide-react';
import { getAllBannersAPI, deleteBannerAPI } from '../../../src/api/authAndAdminApi';

const BannerList = () => {
    const navigate = useNavigate();
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const response = await getAllBannersAPI();
            if (response.success) setBanners(response.data);
        } catch (error) {
            console.error("Fetch Banners Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this banner?")) return;
        setDeletingId(id);
        try {
            const res = await deleteBannerAPI(id);
            if (res.success) {
                setBanners(prev => prev.filter(b => b._id !== id));
            }
        } catch (error) {
            alert("Error deleting banner");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="p-4 md:p-8 bg-gray-950 min-h-screen text-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2 uppercase tracking-tight">
                        <LayoutList className="text-blue-500" /> Banner Management
                    </h1>
                    <p className="text-slate-400 text-xs mt-1">Manage active promotional sliders</p>
                </div>
                <button onClick={() => navigate('/admin/add-banner')} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20">
                    <Plus size={18} /> Add Banner
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col justify-center items-center h-64 gap-3">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                    <p className="text-slate-500 text-sm italic">Loading Banners...</p>
                </div>
            ) : banners.length > 0 ? (
                <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-800/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-gray-800">
                                    <th className="p-5">Banner Preview</th>
                                    <th className="p-5">Details</th>
                                    <th className="p-5">Placement</th>
                                    <th className="p-5">Status</th>
                                    <th className="p-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {banners.map((banner) => (
                                    <tr key={banner._id} className="hover:bg-gray-800/20 transition-colors group">
                                        <td className="p-5">
                                            <div className="w-40 h-16 rounded-lg overflow-hidden border border-gray-800 relative">
                                                <img src={banner.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={banner.title} />
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <p className="font-bold text-white text-sm">{banner.title}</p>
                                            <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                                                <ExternalLink size={10} /> {banner.link || 'No Link Attached'}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className="bg-gray-800 text-blue-300 px-3 py-1 rounded-full text-[10px] font-bold">
                                                {banner.category?.replace('_', ' ').toUpperCase() || 'GENERAL'}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Active</span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => navigate(`/admin/edit-banner/${banner._id}`)}
                                                    className="p-2 bg-gray-800 rounded-lg text-slate-400 hover:bg-blue-500 hover:text-white transition-all"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(banner._id)}
                                                    disabled={deletingId === banner._id}
                                                    className="p-2 bg-gray-800 rounded-lg text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                                                >
                                                    {deletingId === banner._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-900 rounded-3xl border-2 border-dashed border-gray-800 p-20 text-center flex flex-col items-center">
                    <ImageIcon className="text-gray-800 mb-4" size={64} />
                    <h2 className="text-xl font-black text-white mb-2">No Banners Found</h2>
                    <p className="text-slate-500 text-sm max-w-sm">You haven't added any banners yet. Start by clicking the 'Add Banner' button above.</p>
                </div>
            )}
        </div>
    );
};

export default BannerList;