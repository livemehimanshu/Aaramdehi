import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Loader2, AlertCircle, CheckCircle, Upload, X, Box, Save, ArrowLeft } from 'lucide-react';
import { ref, push, set } from "firebase/database";
import { db } from '../../../src/api/firebase';
import { createProductAPI, getAllCategoriesAPI } from '../../../src/api/authAndAdminApi';
import { generateKeywordsOnTheFly } from '../../../src/utils/searchIndexer';
import { useNavigate } from 'react-router-dom';

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link', 'clean'] 
  ],
};

const AddProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    subCategory: '',
    sellingPrice: '',
    mrp: '',
    stock: '',
    sku: '',
    description: ''
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [subCategoriesList, setSubCategoriesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch categories for the dropdown
  useEffect(() => {
    const fetchCats = async () => {
      const res = await getAllCategoriesAPI();
      if (res.success) setCategoriesList(res.data);
    };
    fetchCats();
  }, []);

  // Handle category change and update subcategories dynamically
  const handleCategoryChange = (e) => {
    const categoryName = e.target.value;
    
    // Update category and reset subcategory
    setFormData(prev => ({ ...prev, category: categoryName, subCategory: '' }));

    // Find the selected category and extract its subcategories
    const selectedCat = categoriesList.find(cat => cat.name === categoryName);

    if (selectedCat && Array.isArray(selectedCat.subCategories)) {
      setSubCategoriesList(selectedCat.subCategories);
    } else {
      setSubCategoriesList([]);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    
    setImageFiles([...imageFiles, ...files].slice(0, 5));
    setPreviews([...previews, ...newPreviews].slice(0, 5));
  };

  const removeImage = (index) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.brand || !formData.category || !formData.sellingPrice || !formData.mrp || !formData.stock) {
        return setMessage({ type: 'error', text: "Validation Failed: 'Brand Name' and 'Stock' are mandatory. Please fill all required fields before publishing." });
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // 1. Keyword Generation for SEO/Search
      const keywords = generateKeywordsOnTheFly(formData.name, formData.description).slice(0, 50);

      // 2. Prepare FormData for Image Upload
      const data = new FormData();
      // Ensure numeric fields are sent correctly
      Object.keys(formData).forEach(key => {
          const val = (key === 'sellingPrice' || key === 'mrp' || key === 'stock') ? Number(formData[key]) : formData[key];
          data.append(key, val);
      });
      
      data.append('seoKeywords', keywords.join(', ')); // Sync with backend's expected field
      imageFiles.forEach(file => data.append('images', file));

      // 3. API Call
      const res = await createProductAPI(data);

      if (res.success) {
        // Note: Server-side indexing is handled by the controller using Admin SDK
        setMessage({ type: 'success', text: 'Product published successfully! 🎉' });
        setTimeout(() => navigate('/admin/products'), 2000);
      } else {
        throw new Error(res.message || 'Failed to add product.');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8 text-gray-200 font-sans">
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
          <Box className="text-emerald-500" /> Add New Product
        </h1>
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-900 rounded-lg hover:bg-gray-800 transition-all text-gray-400">
            <ArrowLeft size={20} />
        </button>
      </div>

      {message.text && (
        <div className={`max-w-6xl mx-auto p-4 mb-6 rounded-xl flex items-center gap-3 border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <p className="font-bold text-sm uppercase">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Images Grid */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl">
            <h3 className="text-xs font-black uppercase text-gray-500 mb-4 tracking-widest">Product Gallery</h3>
            
            <label className="group h-48 border-2 border-dashed border-gray-800 bg-gray-950 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 transition-all">
              <div className="p-4 bg-gray-900 rounded-full text-gray-500 group-hover:text-emerald-500 group-hover:scale-110 transition-all">
                <Upload size={24} />
              </div>
              <span className="text-[10px] font-black text-gray-500 mt-3 uppercase tracking-tighter">Click to upload images</span>
              <input type="file" multiple className="hidden" onChange={handleImageChange} accept="image/*" />
            </label>
            
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="aspect-square border border-gray-800 rounded-xl flex items-center justify-center bg-gray-950 relative overflow-hidden group">
                  {previews[i] ? (
                    <>
                        <img src={previews[i]} className="w-full h-full object-cover" alt="preview" />
                        <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                    </>
                  ) : (
                    <span className="text-[8px] font-black text-gray-800 uppercase tracking-widest italic">Slot {i+1}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Form Details */}
        <div className="lg:col-span-2 bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-800 space-y-6 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Product Title *</label>
                <input name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Memory Foam Pillow" className="w-full p-3.5 bg-gray-950 border border-gray-800 rounded-xl outline-none focus:border-emerald-500 text-white font-bold transition-all" />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Brand Name *</label>
                <input placeholder="e.g. Aaramdehi" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} className="w-full p-3.5 bg-gray-950 border border-gray-800 rounded-xl outline-none focus:border-emerald-500 text-white font-bold transition-all" />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Category *</label>
                <select value={formData.category} onChange={handleCategoryChange} className="w-full p-3.5 bg-gray-950 border border-gray-800 rounded-xl outline-none focus:border-emerald-500 text-gray-300 font-bold transition-all appearance-none">
                    <option value="">Choose Category</option>
                    {categoriesList.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Sub Category</label>
                <select value={formData.subCategory} onChange={(e) => setFormData({...formData, subCategory: e.target.value})} disabled={subCategoriesList.length === 0} className="w-full p-3.5 bg-gray-950 border border-gray-800 rounded-xl outline-none focus:border-emerald-500 text-gray-300 font-bold transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed">
                    <option value="">{subCategoriesList.length === 0 ? "No Sub-categories Available" : "Choose Sub Category"}</option>
                    {subCategoriesList.map((sub, idx) => <option key={idx} value={sub}>{sub}</option>)}
                </select>
            </div>
            <input type="number" placeholder="Selling Price (₹) *" value={formData.sellingPrice} onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})} className="p-3.5 bg-gray-950 border border-gray-800 rounded-xl outline-none focus:border-emerald-500 text-emerald-400 font-black" />
            <input type="number" placeholder="MRP (₹) *" value={formData.mrp} onChange={(e) => setFormData({...formData, mrp: e.target.value})} className="p-3.5 bg-gray-950 border border-gray-800 rounded-xl outline-none focus:border-rose-500 text-gray-400 font-bold" />
            <input type="number" placeholder="Stock Quantity *" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="p-3.5 bg-gray-950 border border-gray-800 rounded-xl outline-none focus:border-emerald-500 text-white font-bold" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-1 tracking-widest">Detailed Description</label>
            <ReactQuill 
                theme="snow" 
                value={formData.description}
                onChange={(val) => setFormData({...formData, description: val})}
                modules={modules}
                className="h-64 mb-14 bg-gray-950 rounded-2xl overflow-hidden border border-gray-800" 
            />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-900/20 active:scale-95 disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {loading ? 'Publishing Product...' : 'Publish to Store'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;