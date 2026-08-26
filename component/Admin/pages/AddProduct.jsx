import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, CheckCircle, Upload, X, Box, Save, ArrowLeft, Plus, Trash2, Palette, Ruler } from 'lucide-react';
import { createProductAPI, getAllCategoriesAPI } from '../../../src/api/authAndAdminApi';
import imageCompression from 'browser-image-compression';
import { generateKeywordsOnTheFly } from '../../../src/utils/searchIndexer';
import { useNavigate } from 'react-router-dom';

const AddProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    brand: 'Aaramdehi',
    category: '',
    subCategory: '',
    sellingPrice: '',
    mrp: '',
    stock: '',
    sku: '',
    description: ''
  });

  const [sizesList, setSizesList] = useState([]);
  const [sizeInput, setSizeInput] = useState('');
  
  const [colorVariants, setColorVariants] = useState([]);
  const [colorInput, setColorInput] = useState({ name: '', price: '', mrp: '', imageFiles: [], previews: [] });

  // ✅ Product Information State
  const [productInformation, setProductInformation] = useState([]); // Array of { sectionTitle: '', details: [{ key: '', value: '' }] }
  const [infoInput, setInfoInput] = useState({ sectionTitle: '', details: [{ key: '', value: '' }] });

  const [imageFiles, setImageFiles] = useState([]);
  const [model3dFile, setModel3dFile] = useState(null);
  const [previews, setPreviews] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [subCategoriesList, setSubCategoriesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchCats = async () => {
      const res = await getAllCategoriesAPI();
      if (res?.success) setCategoriesList(res.data);
    };
    fetchCats();
  }, []);

  const handleCategoryChange = (e) => {
    const categoryName = e.target.value;
    setFormData(prev => ({ ...prev, category: categoryName, subCategory: '' }));

    const selectedCat = categoriesList.find(cat => cat.name === categoryName);
    if (selectedCat && Array.isArray(selectedCat.subCategories)) {
      setSubCategoriesList(selectedCat.subCategories);
    } else {
      setSubCategoriesList([]);
    }
  };

  const addSize = () => {
    if (sizeInput.trim() && !sizesList.includes(sizeInput.trim())) {
      setSizesList([...sizesList, sizeInput.trim()]);
      setSizeInput('');
    }
  };

  const removeSize = (indexToRemove) => {
    setSizesList(sizesList.filter((_, idx) => idx !== indexToRemove));
  };

  // ✅ Multiple Images Handler (Ek baar me multiple select kar sakte hain)
  const processUploadFile = async (file, maxSizeMB, maxWidthOrHeight) => {
    try {
      const compressedFile = await imageCompression(file, { maxSizeMB, maxWidthOrHeight });
      const webpFile = await convertToWebP(compressedFile);
      return webpFile;
    } catch (err) {
      console.warn('Upload conversion failed, using original file instead:', err);
      return file;
    }
  };

  const handleColorImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      const processedFiles = [];
      const newPreviews = [];

      for (const file of files) {
        const finalFile = await processUploadFile(file, 0.5, 1000);
        processedFiles.push(finalFile);
        newPreviews.push(URL.createObjectURL(finalFile));
      }

      setColorInput(prev => ({
        ...prev,
        imageFiles: [...prev.imageFiles, ...processedFiles],
        previews: [...prev.previews, ...newPreviews]
      }));
    } catch (err) {
      console.error("Color images processing error:", err);
      setMessage({ type: 'error', text: 'Failed to process color variant images. Please try again.' });
    }
  };

  const removeColorImageInput = (idx) => {
    setColorInput(prev => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((_, i) => i !== idx),
      previews: prev.previews.filter((_, i) => i !== idx)
    }));
  };

  const addColorVariant = () => {
    if (!colorInput.name.trim()) {
      return setMessage({ type: 'error', text: 'Color variant name is required.' });
    }

    setColorVariants([
      ...colorVariants,
      {
        name: colorInput.name.trim(),
        price: colorInput.price ? Number(colorInput.price) : Number(formData.sellingPrice || 0),
        mrp: colorInput.mrp ? Number(colorInput.mrp) : Number(formData.mrp || 0),
        imageFiles: colorInput.imageFiles,
        previews: colorInput.previews
      }
    ]);

    // Input form reset
    setColorInput({ name: '', price: '', mrp: '', imageFiles: [], previews: [] });
  };

  const removeColorVariant = (index) => {
    setColorVariants(colorVariants.filter((_, i) => i !== index));
  };

  // ✅ Product Information Handlers
  const addInfoDetailRow = () => {
    setInfoInput(prev => ({
      ...prev,
      details: [...prev.details, { key: '', value: '' }]
    }));
  };

  const handleInfoSectionTitleChange = (e) => {
    setInfoInput(prev => ({ ...prev, sectionTitle: e.target.value }));
  };

  const handleInfoDetailChange = (index, field, value) => {
    setInfoInput(prev => ({
      ...prev,
      details: prev.details.map((detail, idx) => idx === index ? { ...detail, [field]: value } : detail)
    }));
  };

  const removeInfoDetailRow = (index) => {
    setInfoInput(prev => ({
      ...prev,
      details: prev.details.filter((_, idx) => idx !== index)
    }));
  };

  const addInfoSection = () => {
    if (!infoInput.sectionTitle.trim()) {
      return setMessage({ type: 'error', text: 'Section title is required.' });
    }
    const validDetails = infoInput.details.filter(d => d.key.trim() && d.value.trim());
    if (validDetails.length === 0) {
      return setMessage({ type: 'error', text: 'At least one valid detail (key and value) is required.' });
    }

    setProductInformation([...productInformation, { sectionTitle: infoInput.sectionTitle.trim(), details: validDetails }]);
    setInfoInput({ sectionTitle: '', details: [{ key: '', value: '' }] });
  };

  const removeInfoSection = (index) => {
    setProductInformation(productInformation.filter((_, i) => i !== index));
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setImageProcessing(true);
    const processedFiles = [];
    const newPreviews = [];

    try {
      for (const file of files) {
        const finalFile = await processUploadFile(file, 0.5, 1200);
        processedFiles.push(finalFile);
        newPreviews.push(URL.createObjectURL(finalFile));
      }
      setImageFiles(prev => [...prev, ...processedFiles]);
      setPreviews(prev => [...prev, ...newPreviews]);
    } catch (err) {
      console.error("Image processing error:", err);
      setMessage({ type: 'error', text: 'Failed to process images.' });
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
        canvas.width = img.width; 
        canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(objectUrl);
          resolve(new File([blob], file.name.split('.')[0] + '.webp', { type: 'image/webp' }));
        }, 'image/webp', 0.8);
      };
      img.onerror = (err) => { 
        URL.revokeObjectURL(objectUrl); 
        reject(err); 
      };
    });
  };

  const removeImage = (index) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleModel3dChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = /\.(glb|gltf)$/i;
    if (!allowedExtensions.test(file.name)) {
      setMessage({ type: 'error', text: 'Only .glb or .gltf 3D model files are allowed.' });
      return;
    }

    setModel3dFile(file);
    setMessage({ type: 'success', text: `3D model selected: ${file.name}` });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.brand || !formData.category || !formData.sellingPrice || !formData.mrp || !formData.stock) {
        return setMessage({ type: 'error', text: "Validation Failed: Mandatory fields missing." });
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const keywords = generateKeywordsOnTheFly(formData.name, formData.description).slice(0, 50);

      const data = new FormData();
      Object.keys(formData).forEach(key => {
          const val = (key === 'sellingPrice' || key === 'mrp' || key === 'stock') ? Number(formData[key]) : formData[key];
          data.append(key, val);
      });
      
      data.append('seoKeywords', keywords.join(', ')); 
      data.append('sizes', JSON.stringify(sizesList));
      
      const colorsPayload = colorVariants.map(c => ({
        name: c.name,
        label: c.name,
        price: c.price,
        mrp: c.mrp
      }));
      const colorsJson = JSON.stringify(colorsPayload);
      data.append('colors', colorsJson);
      data.append('colorVariants', colorsJson); // fallback for alternate backend keys
      data.append('variants', colorsJson); // additional compatibility fallback

      // ✅ Append Dynamic Color Images (Multiple Images per Variant)
      colorVariants.forEach((variant, variantIdx) => {
        if (variant.imageFiles && variant.imageFiles.length > 0) {
          variant.imageFiles.forEach((file) => {
            data.append(`color_images_${variantIdx}[]`, file);
          });
        }
      });

      // ✅ Append Product Information
      if (productInformation.length > 0) {
        data.append('productInformation', JSON.stringify(productInformation));
      }

      imageFiles.forEach(file => data.append('images', file));
      if (model3dFile) data.append('model3d', model3dFile);

      const res = await createProductAPI(data);

      if (res.success) {
        setMessage({ type: 'success', text: 'Product created. SEO draft is ready for manual review.' });
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
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-900 rounded-lg hover:bg-gray-800 transition-all text-gray-500">
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
        
        {/* Main Product Gallery & 3D Model */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl">
            <h3 className="text-xs font-black uppercase text-gray-500 mb-4 tracking-widest">Main Product Gallery</h3>
            
            <label className={`group h-48 border-2 border-dashed border-gray-800 bg-gray-950 rounded-2xl flex flex-col items-center justify-center transition-all ${imageProcessing ? 'cursor-wait opacity-50' : 'cursor-pointer hover:border-emerald-500/50'}`}>
              {imageProcessing ? (
                <Loader2 className="animate-spin text-emerald-500" size={32} />
              ) : (
                <>
                  <div className="p-4 bg-gray-900 rounded-full text-gray-500 group-hover:text-emerald-500 group-hover:scale-110 transition-all">
                    <Upload size={24} />
                  </div>
                  <span className="text-[10px] font-black text-gray-500 mt-3 uppercase tracking-tighter">Click to upload main images</span>
                </>
              )}
              <input type="file" disabled={imageProcessing} multiple className="hidden" onChange={handleImageChange} accept="image/*" />
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

            <div className="mt-6">
              <label className="block text-[10px] font-black uppercase text-gray-500 mb-3 tracking-widest">3D Model File</label>
              <label className="group cursor-pointer border-2 border-dashed border-gray-800 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 text-sm text-gray-500 hover:border-emerald-500 transition-all">
                <div className="flex items-center gap-2">
                  <Upload size={18} className="text-emerald-500" />
                  <span>{model3dFile ? model3dFile.name : 'Upload .glb / .gltf file'}</span>
                </div>
                <input type="file" accept=".glb,.gltf" className="hidden" onChange={handleModel3dChange} />
              </label>
            </div>
          </div>
        </div>

        {/* Form Details, Sizes & Multi-Image Color Variants */}
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
                <select value={formData.subCategory} onChange={(e) => setFormData({...formData, subCategory: e.target.value})} disabled={subCategoriesList.length === 0} className="w-full p-3.5 bg-gray-950 border border-gray-800 rounded-xl outline-none focus:border-emerald-500 text-gray-300 font-bold transition-all appearance-none disabled:opacity-50">
                    <option value="">{subCategoriesList.length === 0 ? "No Sub-categories" : "Choose Sub Category"}</option>
                    {subCategoriesList.map((sub, idx) => <option key={idx} value={sub}>{sub}</option>)}
                </select>
            </div>
            <input type="number" placeholder="Selling Price (₹) *" value={formData.sellingPrice} onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})} className="p-3.5 bg-gray-950 border border-gray-800 rounded-xl outline-none focus:border-emerald-500 text-emerald-400 font-black" />
            <input type="number" placeholder="MRP (₹) *" value={formData.mrp} onChange={(e) => setFormData({...formData, mrp: e.target.value})} className="p-3.5 bg-gray-950 border border-gray-800 rounded-xl outline-none focus:border-rose-500 text-gray-500 font-bold" />
            <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Stock *" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="p-3.5 bg-gray-950 border border-gray-800 rounded-xl outline-none focus:border-emerald-500 text-white font-bold w-full" />
                <input type="text" placeholder="SKU Code" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} className="p-3.5 bg-gray-950 border border-gray-800 rounded-xl outline-none focus:border-blue-500 text-blue-400 font-mono text-xs uppercase" />
            </div>
          </div>

          {/* SIZES SECTION */}
          <div className="bg-gray-950 p-5 rounded-xl border border-gray-800 space-y-3">
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
              <Ruler size={14} className="text-emerald-500" /> Available Sizes
            </label>
            <div className="flex gap-2">
              <input type="text" placeholder="e.g. 16 X 24 Inch or XL" value={sizeInput} onChange={(e) => setSizeInput(e.target.value)} className="flex-1 p-3 bg-gray-900 border border-gray-800 rounded-xl outline-none focus:border-emerald-500 text-sm text-white" />
              <button type="button" onClick={addSize} className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1 text-xs">
                <Plus size={16} /> Add Size
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-2">
              {sizesList.map((size, idx) => (
                <span key={idx} className="bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-300 flex items-center gap-2">
                  {size}
                  <button type="button" onClick={() => removeSize(idx)} className="text-rose-400 hover:text-rose-200"><X size={12} /></button>
                </span>
              ))}
            </div>
          </div>

          {/* COLOR VARIANTS (MULTI-IMAGE UP TO 10) */}
          <div className="bg-gray-950 p-5 rounded-xl border border-gray-800 space-y-4">
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
              <Palette size={14} className="text-emerald-500" /> Color Variants (Add as many images as needed)
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input type="text" placeholder="Color Name (e.g. Royal Blue)" value={colorInput.name} onChange={(e) => setColorInput({...colorInput, name: e.target.value})} className="p-3 bg-gray-900 border border-gray-800 rounded-xl outline-none focus:border-emerald-500 text-xs text-white" />
              <input type="number" placeholder="Variant Price (₹)" value={colorInput.price} onChange={(e) => setColorInput({...colorInput, price: e.target.value})} className="p-3 bg-gray-900 border border-gray-800 rounded-xl outline-none focus:border-emerald-500 text-xs text-emerald-400" />
              <input type="number" placeholder="Variant MRP (₹)" value={colorInput.mrp} onChange={(e) => setColorInput({...colorInput, mrp: e.target.value})} className="p-3 bg-gray-900 border border-gray-800 rounded-xl outline-none focus:border-rose-500 text-xs text-gray-500" />
            </div>

            {/* Multiple Upload Field */}
            <label className="p-3 bg-gray-900 border border-gray-800 rounded-xl cursor-pointer hover:border-emerald-500 flex items-center justify-center gap-2 text-xs text-gray-500 w-full">
              <Upload size={14} className="text-emerald-500" />
              <span>Select variant images (multiple files at once)</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleColorImagesChange} />
            </label>

            {/* Selected Images Preview in Input State */}
            {colorInput.previews.length > 0 && (
              <div className="flex gap-2 overflow-x-auto py-2">
                {colorInput.previews.map((img, i) => (
                  <div key={i} className="relative w-12 h-12 flex-shrink-0">
                    <img src={img} className="w-full h-full object-cover rounded-lg border border-gray-700" alt="variant preview" />
                    <button type="button" onClick={() => removeColorImageInput(i)} className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-0.5"><X size={10} /></button>
                  </div>
                ))}
              </div>
            )}

            <button type="button" onClick={addColorVariant} className="w-full py-2.5 bg-gray-900 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all rounded-xl font-bold text-xs flex items-center justify-center gap-2">
              <Plus size={16} /> Add Color Variant
            </button>

            {/* Added Color Variants List */}
            <div className="space-y-2 pt-2">
              {colorVariants.map((col, idx) => (
                <div key={idx} className="p-3 bg-gray-900 rounded-xl border border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1 overflow-x-auto max-w-[150px]">
                      {col.previews && col.previews.map((previewUrl, pIdx) => (
                        <img key={pIdx} src={previewUrl} alt={col.name} className="w-8 h-8 object-cover rounded-md border border-gray-700 flex-shrink-0" />
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{col.name} <span className="text-[10px] text-gray-500">({col.imageFiles.length} Images)</span></p>
                      <p className="text-[10px] text-emerald-400 font-mono">₹{col.price} <span className="text-gray-500 line-through">₹{col.mrp}</span></p>
                    </div>
                  </div>
                  <button type="button" onClick={() => removeColorVariant(idx)} className="text-rose-400 hover:text-rose-200 p-2">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* PRODUCT INFORMATION SECTION */}
          <div className="bg-gray-950 p-5 rounded-xl border border-gray-800 space-y-4">
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
              <Box size={14} className="text-emerald-500" /> Product Information (Amazon-style accordion)
            </label>
            
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl space-y-4">
              <input type="text" placeholder="Section Title (e.g. Item details)" value={infoInput.sectionTitle} onChange={handleInfoSectionTitleChange} className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl outline-none focus:border-emerald-500 text-sm text-white" />
              
              <div className="space-y-2">
                <p className="text-[10px] uppercase text-gray-500 font-bold ml-1">Key-Value Pairs</p>
                {infoInput.details.map((detail, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input type="text" placeholder="Key (e.g. Material)" value={detail.key} onChange={(e) => handleInfoDetailChange(idx, 'key', e.target.value)} className="flex-1 p-2 bg-gray-950 border border-gray-800 rounded-lg outline-none focus:border-emerald-500 text-xs text-white" />
                    <input type="text" placeholder="Value (e.g. 100% Cotton)" value={detail.value} onChange={(e) => handleInfoDetailChange(idx, 'value', e.target.value)} className="flex-1 p-2 bg-gray-950 border border-gray-800 rounded-lg outline-none focus:border-emerald-500 text-xs text-white" />
                    <button type="button" onClick={() => removeInfoDetailRow(idx)} disabled={infoInput.details.length === 1} className="p-2 text-rose-500 hover:text-rose-400 disabled:opacity-50">
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addInfoDetailRow} className="text-[10px] uppercase tracking-wider text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 mt-2">
                  <Plus size={12} /> Add Row
                </button>
              </div>

              <button type="button" onClick={addInfoSection} className="w-full py-2.5 bg-gray-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors">
                <Plus size={16} /> Add Information Section
              </button>
            </div>

            {/* Added Sections List */}
            {productInformation.length > 0 && (
              <div className="space-y-3 pt-2">
                {productInformation.map((section, idx) => (
                  <div key={idx} className="p-3 bg-gray-900 border border-gray-800 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-white">{section.sectionTitle}</h4>
                      <button type="button" onClick={() => removeInfoSection(idx)} className="text-rose-400 hover:text-rose-200">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="bg-gray-950 rounded-lg p-2 space-y-1">
                      {section.details.map((detail, dIdx) => (
                        <div key={dIdx} className="flex text-xs">
                          <span className="w-1/3 text-gray-500 font-medium">{detail.key}</span>
                          <span className="w-2/3 text-gray-300">{detail.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-1 tracking-widest">Detailed Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={10}
              className="w-full min-h-[220px] p-4 bg-gray-950 border border-gray-800 rounded-2xl text-sm text-gray-200 outline-none focus:border-emerald-500"
              placeholder="Write your product description here..."
            />
          </div>

          <button type="submit" disabled={loading || imageProcessing} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-900/20 active:scale-95 disabled:opacity-50 text-xs">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {loading ? 'Publishing Product...' : imageProcessing ? 'Processing Images...' : 'Publish to Store'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;  