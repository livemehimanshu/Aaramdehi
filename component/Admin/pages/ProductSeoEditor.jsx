import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAllProductsAPI, updateProductAPI, getProductByIdAPI } from '../../../src/api/authAndAdminApi';
import { Search, Edit, Save, Loader2, Info, Globe } from 'lucide-react';
import SEO from '../../header/SEO';
import toast from 'react-hot-toast';

const ProductSeoEditor = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [seoData, setSeoData] = useState({
        seoTitle: '',
        seoDescription: '',
        seoKeywords: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch all products (limit removed to see everything)
            const res = await getAllProductsAPI({ limit: 1000 }); 
            if (res.success) {
                const data = Array.isArray(res.data) ? res.data : [];
                setProducts(data);
                setFilteredProducts(data);
            } else {
                setError(res.message || "Failed to fetch products.");
            }
        } catch (err) {
            console.error("Error fetching products:", err);
            setError("An error occurred while fetching products.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        const filtered = products.filter(product =>
            product.name?.toLowerCase().includes(lowercasedSearchTerm) ||
            product.brand?.toLowerCase().includes(lowercasedSearchTerm) ||
            product._id?.toLowerCase().includes(lowercasedSearchTerm)
        );
        setFilteredProducts(filtered);
    }, [searchTerm, products]);

    const handleSelectProduct = async (product) => {
        setSelectedProduct(product);
        try {
            const res = await getProductByIdAPI(product._id);
            if (res.success) {
                const p = res.data;
                setSeoData({
                    seoTitle: p.seoTitle || p.name || '',
                    seoDescription: p.seoDescription || p.shortDescription || '',
                    seoKeywords: Array.isArray(p.seoKeywords) ? p.seoKeywords.join(', ') : (p.seoKeywords || '')
                });
            }
        } catch (err) {
            toast.error("Error loading product SEO details.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSeoData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveSeo = async (e) => {
        e.preventDefault();
        if (!selectedProduct) return;

        setIsSaving(true);
        try {
            const formData = new FormData();
            // SEO Fields
            formData.append('seoTitle', seoData.seoTitle);
            formData.append('seoDescription', seoData.seoDescription);
            formData.append('seoKeywords', seoData.seoKeywords);
            
            // Required basic fields (Backend validation requires these)
            formData.append('name', selectedProduct.name);
            formData.append('brand', selectedProduct.brand);
            formData.append('category', selectedProduct.category);
            // Add basic numeric fields to prevent NaN errors on backend
            formData.append('mrp', selectedProduct.mrp || 0);
            formData.append('sellingPrice', selectedProduct.sellingPrice || 0);
            formData.append('stock', selectedProduct.stock || 0);

            const res = await updateProductAPI(selectedProduct._id, formData);
            if (res.success) {
                toast.success("SEO details updated successfully!");
                fetchProducts(); // Refresh list
            } else {
                toast.error(res.message || "Failed to update SEO.");
            }
        } catch (err) {
            toast.error("Server connection error.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading && products.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-96">
                <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
                <p className="text-xs font-black uppercase tracking-widest text-gray-500">Syncing Catalog...</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-gray-950 min-h-screen text-gray-200">
            <SEO 
                title="Product SEO Optimizer" 
                description="Manage and optimize product meta tags for better search engine rankings."
            />
            <div className="flex items-center gap-3 mb-8">
                <Globe className="text-blue-500" size={32} />
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-white">Product SEO Optimizer</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase mt-1">Select a product to optimize for search engines</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Product List */}
                <div className="bg-gray-900 rounded-3xl border border-gray-800 flex flex-col h-[700px] shadow-2xl">
                    <div className="p-6 border-b border-gray-800">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or brand..."
                                className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 text-white transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-10 text-gray-600 font-bold uppercase text-xs">No products found</div>
                        ) : (
                            filteredProducts.map(product => (
                                <div 
                                    key={product._id} 
                                    onClick={() => handleSelectProduct(product)}
                                    className={`p-4 rounded-2xl cursor-pointer border transition-all flex items-center gap-4 ${
                                        selectedProduct?._id === product._id 
                                        ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/10' 
                                        : 'bg-gray-950 border-gray-800 hover:border-gray-700'
                                    }`}
                                >
                                    <img 
                                        src={product.thumbnail || 'https://placehold.co/50x50?text=📦'} 
                                        className="w-12 h-12 rounded-xl object-cover bg-gray-800" 
                                        alt="" 
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm text-white truncate">{product.name}</p>
                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{product.brand}</p>
                                    </div>
                                    {selectedProduct?._id === product._id && <Edit size={16} className="text-blue-500 shrink-0" />}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right: SEO Form */}
                <div className="lg:col-span-2 space-y-6">
                    {!selectedProduct ? (
                        <div className="bg-gray-900 rounded-[40px] border-2 border-dashed border-gray-800 h-[700px] flex flex-col items-center justify-center text-center p-10">
                            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                                <Info className="text-gray-600" size={40} />
                            </div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2">No Product Selected</h2>
                            <p className="text-slate-500 text-sm max-w-xs leading-relaxed font-medium">Choose a product from the left sidebar to start editing its meta tags and SEO configuration.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSaveSeo} className="bg-gray-900 rounded-[40px] border border-gray-800 p-8 md:p-12 shadow-2xl space-y-8 animate-in fade-in duration-500">
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tighter uppercase mb-1">Optimizing: {selectedProduct.name}</h3>
                                <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em]">ID: {selectedProduct._id}</p>
                            </div>

                            <div className="space-y-6">
                                {/* Google Preview Card */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                                    <p className="text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest">Google Search Preview</p>
                                    <div className="max-w-[600px]">
                                        <div className="text-[14px] text-[#202124] mb-1 flex items-center gap-1">
                                            <span>https://aaramdehi.com</span>
                                            <span className="text-[12px] text-[#70757a]">› product › ...</span>
                                        </div>
                                        <h3 className="text-[20px] text-[#1a0dab] hover:underline cursor-pointer font-medium leading-tight mb-1 truncate">
                                            {seoData.seoTitle || selectedProduct.name}
                                        </h3>
                                        <p className="text-[14px] text-[#4d5156] leading-relaxed line-clamp-2">
                                            {seoData.seoDescription || "Please provide a description to see how it looks in search results..."}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-gray-500 ml-1">Meta Page Title (Recommended: 50-60 chars)</label>
                                    <input
                                        name="seoTitle"
                                        value={seoData.seoTitle}
                                        onChange={handleChange}
                                        className="w-full bg-gray-950 border border-gray-800 p-4 rounded-2xl focus:border-blue-500 outline-none font-bold text-white transition-all"
                                        placeholder="Enter SEO title..."
                                    />
                                    <p className={`text-[10px] font-bold uppercase px-2 ${seoData.seoTitle.length > 60 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                        {seoData.seoTitle.length} Characters
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-gray-500 ml-1">Meta Description (Recommended: 120-160 chars)</label>
                                    <textarea
                                        name="seoDescription"
                                        value={seoData.seoDescription}
                                        onChange={handleChange}
                                        rows="4"
                                        className="w-full bg-gray-950 border border-gray-800 p-4 rounded-2xl focus:border-blue-500 outline-none font-medium text-gray-300 transition-all resize-none"
                                        placeholder="Describe your product for search results..."
                                    />
                                    <p className={`text-[10px] font-bold uppercase px-2 ${seoData.seoDescription.length > 160 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                        {seoData.seoDescription.length} Characters
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-gray-500 ml-1">Focus Keywords (Separated by commas)</label>
                                    <input
                                        name="seoKeywords"
                                        value={seoData.seoKeywords}
                                        onChange={handleChange}
                                        className="w-full bg-gray-950 border border-gray-800 p-4 rounded-2xl focus:border-blue-500 outline-none font-bold text-white transition-all"
                                        placeholder="e.g. orthopedic pillow, luxury bedding, aaramdehi"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSaving}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                {isSaving ? 'Updating SEO...' : 'Save & Publish SEO Data'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductSeoEditor;