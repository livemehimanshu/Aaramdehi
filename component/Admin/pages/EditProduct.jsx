import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoCloudUploadOutline, IoArrowBackOutline, IoSaveOutline } from 'react-icons/io5';
import { Loader2, Plus, Palette, Trash2 } from 'lucide-react';
import { getProductByIdAPI, updateProductAPI, getAllCategoriesAPI } from '../../../src/api/authAndAdminApi';
import imageCompression from 'browser-image-compression'; // ✅ Import imageCompression

const EditProduct = () => {
    const { id } = useParams(); // URL se ID nikalne ke liye
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Form State
    const [imageProcessing, setImageProcessing] = useState(false); // ✅ Add image processing state
    const [productData, setProductData] = useState({
        name: '',
        brand: '',
        category: '',
        subCategory: '',
        mrp: '',
        sellingPrice: '',
        stock: '',
        description: '',
        tags: '',
        specifications: '{}'
    });
    
    const [categoriesList, setCategoriesList] = useState([]);
    const [subCategoriesList, setSubCategoriesList] = useState([]);
    const [mainImages, setMainImages] = useState([]); // Unified image list for ordering
    const [model3dFile, setModel3dFile] = useState(null);
    const [existingModel3dUrl, setExistingModel3dUrl] = useState('');
    const [removeExistingModel3d, setRemoveExistingModel3d] = useState(false);

    const [colorVariants, setColorVariants] = useState([]);
    const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
    const [colorInput, setColorInput] = useState({ name: '', price: '', mrp: '', imageFiles: [], previews: [] });
    const [customAttributes, setCustomAttributes] = useState([]);
    const [customAttributeInput, setCustomAttributeInput] = useState({ title: '', options: [{ label: '', priceModifier: '', mrpModifier: '', stock: '' }] });

    // ✅ Product Information State
    const [productInformation, setProductInformation] = useState([]);
    const [infoInput, setInfoInput] = useState({ sectionTitle: '', details: [{ key: '', value: '' }] });

    // ✅ Pre-Indexing Helpers
    const STOPWORDS = ["is", "the", "a", "an", "and", "for", "ke", "liye", "mujhe", "chahiye", "ko", "par", "ek", "hai", "mein", "this", "that", "with"];

    const createSearchKeywords = (title, htmlDescription) => {
        if (!title || !htmlDescription) return [];
        // HTML tags remove karein
        const plainDescription = htmlDescription.replace(/<[^>]*>/g, ' ');
        const combinedText = `${title} ${plainDescription}`.toLowerCase();
        
        const cleanWords = combinedText.replace(/[^\w\s]/g, ' ').split(/\s+/);
        
        return [...new Set(cleanWords.filter(word => word.length > 2 && !STOPWORDS.includes(word)))];
    };

    // 1. Load Existing Product Data
    useEffect(() => {
        const fetchCats = async () => {
            const res = await getAllCategoriesAPI();
            if (res.success) setCategoriesList(res.data);
        };
        fetchCats();
    }, []);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const res = await getProductByIdAPI(id);
                if (res.success) {
                    const p = res.data;
                    setProductData({
                        name: p.name || '',
                        brand: p.brand || '',
                        category: p.category || '',
                        subCategory: p.subCategory || '',
                        mrp: p.mrp || '',
                        sellingPrice: p.sellingPrice || '',
                        stock: p.stock || '',
                        description: p.description || '',
                        tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
                        specifications: JSON.stringify(p.specifications || {}, null, 2)
                    });
                    if (Array.isArray(p.images)) {
                        setMainImages(p.images.map((img, index) => ({
                            id: `existing-${index}`,
                            isExisting: true,
                            data: img,
                            file: null,
                            preview: img.url || img
                        })));
                    }
                    setExistingModel3dUrl(p.model3dUrl || p.modelUrl || '');

                    if (Array.isArray(p.colors)) {
                        setColorVariants(p.colors.map((color) => ({
                            name: color.name || color.label || '',
                            price: color.price ?? p.sellingPrice ?? 0,
                            mrp: color.mrp ?? p.mrp ?? 0,
                            imageFiles: [],
                            previews: Array.isArray(color.images) ? color.images.map(img => img.url || img) : [],
                            existingImages: Array.isArray(color.images) ? color.images : []
                        })));
                    }

                    if (Array.isArray(p.productInformation)) {
                        setProductInformation(p.productInformation);
                    }
                }
            } catch (error) {
                console.error("❌ Fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    // ✅ Sync subcategories when categories and product data are both available
    useEffect(() => {
        if (categoriesList.length > 0 && productData.category) {
            const selectedCat = categoriesList.find(cat => cat.name === productData.category);
            if (selectedCat && Array.isArray(selectedCat.subCategories)) {
                setSubCategoriesList(selectedCat.subCategories);
            }
        }
    }, [categoriesList, productData.category]);

    const handleChange = (e) => {
        setProductData({ ...productData, [e.target.name]: e.target.value });
    };

    const handleCategoryChange = (e) => {
        const categoryName = e.target.value;
        setProductData(prev => ({ ...prev, category: categoryName, subCategory: '' }));

        const selectedCat = categoriesList.find(cat => cat.name === categoryName);
        if (selectedCat && Array.isArray(selectedCat.subCategories)) {
            setSubCategoriesList(selectedCat.subCategories);
        } else {
            setSubCategoriesList([]);
        }
    };

    // 2. Multiple File Selection Logic
    const handleFileChange = async (e) => { // ✅ Make async
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setImageProcessing(true); // ✅ Start image processing
        const newMainImages = [];

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const compressedFile = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1000 });
                const webpFile = await convertToWebP(compressedFile);
                const previewUrl = URL.createObjectURL(webpFile);

                newMainImages.push({
                    id: `new-${Date.now()}-${i}`,
                    isExisting: false,
                    data: null,
                    file: webpFile,
                    preview: previewUrl
                });
            }

            setMainImages(prev => [...prev, ...newMainImages]);
        } catch (err) {
            console.error("Image processing failed:", err);
            // Optionally show a message to the user
        } finally {
            setImageProcessing(false); // ✅ End image processing
        }
    };

    const moveMainImage = (index, direction) => {
        setMainImages(prev => {
            const next = [...prev];
            const targetIndex = direction === 'left' ? index - 1 : index + 1;
            if (targetIndex < 0 || targetIndex >= next.length) return prev;
            [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
            return next;
        });
    };

    const removeMainImage = (index) => {
        setMainImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleModel3dChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedExtensions = /\.(glb|gltf)$/i;
        if (!allowedExtensions.test(file.name)) {
            alert('Only .glb or .gltf 3D model files are allowed.');
            return;
        }

        setRemoveExistingModel3d(false);
        setModel3dFile(file);
    };

    const removeModel3d = () => {
        setModel3dFile(null);
    };

    const handleColorFilesChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        try {
            const processedFiles = [];
            const previewUrls = [];

            for (const file of files) {
                const compressedFile = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1000 });
                const webpFile = await convertToWebP(compressedFile);
                processedFiles.push(webpFile);
                previewUrls.push(URL.createObjectURL(webpFile));
            }

            setColorInput(prev => ({
                ...prev,
                imageFiles: [...prev.imageFiles, ...processedFiles],
                previews: [...prev.previews, ...previewUrls]
            }));
        } catch (error) {
            console.error('Color images processing failed:', error);
        }
    };

    const removeColorImage = (index) => {
        setColorInput(prev => ({
            ...prev,
            imageFiles: prev.imageFiles.filter((_, i) => i !== index),
            previews: prev.previews.filter((_, i) => i !== index)
        }));
    };

    const addColorVariant = () => {
        if (!colorInput.name.trim()) return;

        setColorVariants(prev => {
            const next = [
                ...prev,
                {
                    name: colorInput.name.trim(),
                    price: Number(colorInput.price || productData.sellingPrice || 0),
                    mrp: Number(colorInput.mrp || productData.mrp || 0),
                    imageFiles: colorInput.imageFiles,
                    previews: colorInput.previews,
                    existingImages: []
                }
            ];
            setSelectedVariantIndex(next.length - 1);
            return next;
        });

        setColorInput({ name: '', price: '', mrp: '', imageFiles: [], previews: [] });
    };

    const removeColorVariant = (index) => {
        setColorVariants(prev => prev.filter((_, i) => i !== index));
        setSelectedVariantIndex(prev => {
            if (prev === index) return Math.max(0, prev - 1);
            if (prev > index) return prev - 1;
            return prev;
        });
    };

    const handleVariantFieldChange = (index, key, value) => {
        setColorVariants(prev => prev.map((variant, idx) => idx === index ? { ...variant, [key]: value } : variant));
    };

    const removeExistingVariantImage = (variantIndex, imageIndex) => {
        setColorVariants(prev => prev.map((variant, idx) => {
            if (idx !== variantIndex) return variant;
            return {
                ...variant,
                existingImages: variant.existingImages?.filter((_, imgIdx) => imgIdx !== imageIndex) || []
            };
        }));
    };

    const removeVariantPreviewImage = (variantIndex, imageIndex) => {
        setColorVariants(prev => prev.map((variant, idx) => {
            if (idx !== variantIndex) return variant;
            return {
                ...variant,
                previews: variant.previews?.filter((_, imgIdx) => imgIdx !== imageIndex) || [],
                imageFiles: variant.imageFiles?.filter((_, imgIdx) => imgIdx !== imageIndex) || []
            };
        }));
    };

    const moveVariantImage = (variantIndex, imageIndex, direction, isExisting = false) => {
        setColorVariants(prev => prev.map((variant, idx) => {
            if (idx !== variantIndex) return variant;
            if (isExisting) {
                const existing = [...(variant.existingImages || [])];
                const targetIndex = direction === 'left' ? imageIndex - 1 : imageIndex + 1;
                if (targetIndex < 0 || targetIndex >= existing.length) return variant;
                [existing[imageIndex], existing[targetIndex]] = [existing[targetIndex], existing[imageIndex]];
                return { ...variant, existingImages: existing };
            }
            const previews = [...(variant.previews || [])];
            const imageFiles = [...(variant.imageFiles || [])];
            const targetIndex = direction === 'left' ? imageIndex - 1 : imageIndex + 1;
            if (targetIndex < 0 || targetIndex >= previews.length) return variant;
            [previews[imageIndex], previews[targetIndex]] = [previews[targetIndex], previews[imageIndex]];
            [imageFiles[imageIndex], imageFiles[targetIndex]] = [imageFiles[targetIndex], imageFiles[imageIndex]];
            return { ...variant, previews, imageFiles };
        }));
    };

    const resetCustomAttributeInput = () => {
        setCustomAttributeInput({ title: '', options: [{ label: '', priceModifier: '', mrpModifier: '', stock: '' }] });
    };

    const addCustomAttributeOptionRow = () => {
        setCustomAttributeInput(prev => ({
            ...prev,
            options: [...prev.options, { label: '', priceModifier: '', mrpModifier: '', stock: '' }]
        }));
    };

    const handleCustomAttributeInputChange = (key, value) => {
        setCustomAttributeInput(prev => ({ ...prev, [key]: value }));
    };

    const handleCustomAttributeOptionInputChange = (index, key, value) => {
        setCustomAttributeInput(prev => ({
            ...prev,
            options: prev.options.map((option, idx) => idx === index ? { ...option, [key]: value } : option)
        }));
    };

    const addCustomAttribute = () => {
        if (!customAttributeInput.title.trim()) return;
        const formattedOptions = customAttributeInput.options
            .filter(opt => opt.label.trim())
            .map(opt => ({
                label: opt.label.trim(),
                priceModifier: Number(opt.priceModifier || 0),
                mrpModifier: Number(opt.mrpModifier || 0),
                stock: Number(opt.stock || 0)
            }));
        if (formattedOptions.length === 0) return;
        setCustomAttributes(prev => ([...prev, { title: customAttributeInput.title.trim(), options: formattedOptions }]));
        resetCustomAttributeInput();
    };

    const handleCustomAttributeChange = (attrIndex, key, value) => {
        setCustomAttributes(prev => prev.map((attr, idx) => idx === attrIndex ? { ...attr, [key]: value } : attr));
    };

    const handleCustomAttributeOptionChange = (attrIndex, optionIndex, key, value) => {
        setCustomAttributes(prev => prev.map((attr, idx) => {
            if (idx !== attrIndex) return attr;
            return {
                ...attr,
                options: attr.options.map((option, optIdx) => optIdx === optionIndex ? { ...option, [key]: value } : option)
            };
        }));
    };

    const addCustomAttributeOption = (attrIndex) => {
        setCustomAttributes(prev => prev.map((attr, idx) => idx === attrIndex ? {
            ...attr,
            options: [...(attr.options || []), { label: '', priceModifier: '', mrpModifier: '', stock: '' }]
        } : attr));
    };

    const removeCustomAttributeOption = (attrIndex, optionIndex) => {
        setCustomAttributes(prev => prev.map((attr, idx) => {
            if (idx !== attrIndex) return attr;
            return {
                ...attr,
                options: attr.options.filter((_, optIdx) => optIdx !== optionIndex)
            };
        }));
    };

    const removeCustomAttribute = (attrIndex) => {
        setCustomAttributes(prev => prev.filter((_, idx) => idx !== attrIndex));
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
            return alert('Section title is required.');
        }
        const validDetails = infoInput.details.filter(d => d.key.trim() && d.value.trim());
        if (validDetails.length === 0) {
            return alert('At least one valid detail (key and value) is required.');
        }

        setProductInformation([...productInformation, { sectionTitle: infoInput.sectionTitle.trim(), details: validDetails }]);
        setInfoInput({ sectionTitle: '', details: [{ key: '', value: '' }] });
    };

    const removeInfoSection = (index) => {
        setProductInformation(productInformation.filter((_, i) => i !== index));
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
                    URL.revokeObjectURL(objectUrl); // ✅ Memory management
                    resolve(new File([blob], file.name.split('.')[0] + '.webp', { type: 'image/webp' }));
                }, 'image/webp', 0.8);
            };

            img.onerror = (err) => {
                URL.revokeObjectURL(objectUrl);
                reject(err);
            };
        });
    };

    // 3. Update Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        // ✅ SMART IDEA: Generate updated keywords
        const updatedKeywords = createSearchKeywords(productData.name, productData.description);

        const formData = new FormData();
        
        Object.keys(productData).forEach(key => {
            formData.append(key, productData[key]);
        });

        formData.append('seoKeywords', JSON.stringify(updatedKeywords));

        const orderedMainImages = mainImages;
        const existingImagesPayload = orderedMainImages
            .filter(item => item.isExisting)
            .map(item => {
                if (!item.data) return { url: item.preview };
                return typeof item.data === 'string' ? { url: item.data } : item.data;
            });
        const newMainFiles = orderedMainImages
            .filter(item => !item.isExisting)
            .map(item => item.file);

        formData.append('existingImages', JSON.stringify(existingImagesPayload));
        if (orderedMainImages.length > 0) {
            formData.append('imageOrder', JSON.stringify(orderedMainImages.map(item => item.isExisting ? { type: 'existing' } : { type: 'new' })));
        }

        if (model3dFile) {
            formData.append('model3d', model3dFile);
        }

        if (removeExistingModel3d) {
            formData.append('removeModel3d', 'true');
        }

        // Backend 'images' (plural) expect karta hai
        newMainFiles.forEach(file => {
            formData.append('images', file);
        });

        if (colorVariants.length > 0) {
            const variantsPayload = colorVariants.map(({ name, price, mrp, existingImages }) => ({
                name,
                price,
                mrp,
                images: existingImages || []
            }));
            const colorsJson = JSON.stringify(variantsPayload);
            formData.append('colors', colorsJson);
            formData.append('colorVariants', colorsJson); // backend compatibility fallback
            formData.append('variants', colorsJson);

            colorVariants.forEach((variant, variantIdx) => {
                variant.imageFiles?.forEach((file) => {
                    formData.append(`color_images_${variantIdx}[]`, file);
                });
            });
        }

        if (customAttributes.length > 0) {
            formData.append('customAttributes', JSON.stringify(customAttributes));
        }

        // ✅ Append Product Information
        if (productInformation.length > 0) {
            formData.append('productInformation', JSON.stringify(productInformation));
        }

        try {
            const res = await updateProductAPI(id, formData);
            if (res.success) {
                alert("✅ Product updated successfully!");
                navigate('/admin/products');
            }
        } catch (error) {
            alert("❌ Update failed: " + (error.response?.data?.message || error.message)); // ✅ Better error message
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen bg-gray-950"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>; // ✅ Better loading indicator

    return (
        <div className="p-6 bg-gray-950 min-h-screen text-gray-200">
            <div className="max-w-4xl mx-auto bg-gray-900 rounded-xl shadow-2xl border border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-white transition">
                        <IoArrowBackOutline /> Back
                    </button>
                    <h2 className="text-xl font-black uppercase tracking-tighter text-white">Edit Product</h2>
                    <div className="w-10"></div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-500">Product Name</label>
                            <input name="name" value={productData.name} onChange={handleChange} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-lg focus:border-blue-600 outline-none font-bold text-white" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-500">Brand</label>
                            <input name="brand" value={productData.brand} onChange={handleChange} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-lg focus:border-blue-600 outline-none font-bold text-white" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-500">MRP (₹)</label>
                            <input name="mrp" type="number" value={productData.mrp} onChange={handleChange} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-lg focus:border-blue-600 outline-none font-bold text-rose-500" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-500">Selling Price (₹)</label>
                            <input name="sellingPrice" type="number" value={productData.sellingPrice} onChange={handleChange} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-lg focus:border-blue-600 outline-none font-bold text-emerald-500" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-500">Stock Quantity</label>
                            <input name="stock" type="number" value={productData.stock} onChange={handleChange} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-lg focus:border-blue-600 outline-none font-bold text-white" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-500">Category</label>
                            <select name="category" value={productData.category} onChange={handleCategoryChange} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-lg focus:border-blue-600 outline-none font-bold text-white appearance-none">
                                <option value="">Select Category</option>
                                {categoriesList.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-500">Sub Category</label>
                            <select name="subCategory" value={productData.subCategory} onChange={handleChange} disabled={subCategoriesList.length === 0} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-lg focus:border-blue-600 outline-none font-bold text-white appearance-none disabled:opacity-50 disabled:cursor-not-allowed">
                                <option value="">{subCategoriesList.length === 0 ? "No Sub-categories Available" : "Choose Sub Category"}</option>
                                {subCategoriesList.map((sub, idx) => <option key={idx} value={sub}>{sub}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-500">Description</label>
                        <textarea 
                            name="description" 
                            value={productData.description} 
                            onChange={handleChange} 
                            rows="5"
                            className="w-full bg-gray-950 border border-gray-800 p-3 rounded-lg focus:border-emerald-600 outline-none text-white resize-y"
                            placeholder="Enter product description..."
                        ></textarea>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-500">Main Images (Upload new images and reorder as needed)</label>
                        <div className="border-2 border-dashed border-gray-800 bg-gray-950 rounded-xl p-6 flex flex-col items-center justify-center hover:bg-gray-800/50 transition-colors cursor-pointer relative">
                            <IoCloudUploadOutline size={40} className="text-gray-600 mb-2" />
                            <p className="text-xs text-slate-500 font-bold">Click or Drag images here</p>
                            <input type="file" name="images" multiple onChange={handleFileChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-500">3D Model File</label>
                        <div className="border-2 border-dashed border-gray-800 bg-gray-950 rounded-xl p-4">
                            <label className="flex flex-col gap-2 cursor-pointer">
                                <span className="text-xs text-slate-500 font-bold">Upload .glb / .gltf file to replace existing model</span>
                                <input type="file" accept=".glb,.gltf" onChange={handleModel3dChange} className="w-full text-slate-200" />
                            </label>
                            {(existingModel3dUrl || model3dFile) && (
                                <div className="mt-3 p-3 rounded-xl border border-gray-800 bg-gray-900 text-sm text-white space-y-2">
                                    {existingModel3dUrl && !model3dFile && (
                                        <p className="truncate">Current model: <a href={existingModel3dUrl} target="_blank" rel="noreferrer" className="text-emerald-400 hover:text-emerald-200">View</a></p>
                                    )}
                                    {model3dFile && (
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="truncate">Selected file: {model3dFile.name}</p>
                                            <button type="button" onClick={removeModel3d} className="text-xs font-black uppercase tracking-[0.24em] text-rose-400 hover:text-rose-200">Remove</button>
                                        </div>
                                    )}
                                    {existingModel3dUrl && !model3dFile && (
                                        <label className="inline-flex items-center gap-2 mt-2 text-xs text-gray-300">
                                            <input type="checkbox" checked={removeExistingModel3d} onChange={(e) => setRemoveExistingModel3d(e.target.checked)} className="form-checkbox h-4 w-4 text-emerald-500 rounded" />
                                            Remove existing 3D model without uploading replacement
                                        </label>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Image Previews */}
                    <p className="text-[10px] text-slate-500 mb-2">Use the arrows to reorder main images and the trash icon to remove one.</p>
                    <div className="flex gap-4 overflow-x-auto py-2">
                        {mainImages.map((image, idx) => (
                            <div key={image.id} className="relative w-28 h-28 rounded-xl border border-gray-800 overflow-hidden flex-shrink-0 bg-gray-950">
                                <img src={image.preview} className="w-full h-full object-contain" alt={`preview-${idx}`} />
                                <div className="absolute inset-0 flex flex-col justify-between p-2">
                                    <div className="flex justify-end gap-1">
                                        <button
                                            type="button"
                                            disabled={idx === 0}
                                            onClick={() => moveMainImage(idx, 'left')}
                                            className="w-7 h-7 rounded-full bg-black/70 text-white disabled:opacity-40"
                                        >
                                            ←
                                        </button>
                                        <button
                                            type="button"
                                            disabled={idx === mainImages.length - 1}
                                            onClick={() => moveMainImage(idx, 'right')}
                                            className="w-7 h-7 rounded-full bg-black/70 text-white disabled:opacity-40"
                                        >
                                            →
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeMainImage(idx)}
                                        className="w-7 h-7 rounded-full bg-rose-500 text-white self-end"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Color Variants Editor */}
                    <div className="bg-gray-950 p-5 rounded-xl border border-gray-800 space-y-5">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Color Variants</h3>
                                <p className="text-[11px] text-gray-500">Add / edit color variants and upload multiple images per variant.</p>
                            </div>
                            <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-400">CRUD ready</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input value={colorInput.name} onChange={(e) => setColorInput(prev => ({ ...prev, name: e.target.value }))} placeholder="Variant name" className="p-3 bg-gray-900 border border-gray-800 rounded-xl outline-none focus:border-emerald-500 text-xs text-white" />
                            <input value={colorInput.price} onChange={(e) => setColorInput(prev => ({ ...prev, price: e.target.value }))} type="number" placeholder="Variant price" className="p-3 bg-gray-900 border border-gray-800 rounded-xl outline-none focus:border-emerald-500 text-xs text-emerald-400" />
                            <input value={colorInput.mrp} onChange={(e) => setColorInput(prev => ({ ...prev, mrp: e.target.value }))} type="number" placeholder="Variant MRP" className="p-3 bg-gray-900 border border-gray-800 rounded-xl outline-none focus:border-rose-500 text-xs text-gray-500" />
                        </div>

                        <label className="p-3 bg-gray-900 border border-gray-800 rounded-xl cursor-pointer hover:border-emerald-500 text-xs text-gray-500 flex items-center justify-center gap-2">
                            Upload variant images (multiple)
                            <input type="file" accept="image/*" multiple className="hidden" onChange={handleColorFilesChange} />
                        </label>

                        {colorInput.previews.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto py-2">
                                {colorInput.previews.map((src, idx) => (
                                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-800">
                                        <img src={src} alt="variant preview" className="w-full h-full object-cover" />
                                        <button type="button" className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full" onClick={() => removeColorImage(idx)}><Trash2 size={12} /></button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button type="button" onClick={addColorVariant} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-emerald-500 transition-all">
                            <div className="flex items-center justify-center gap-2"><Plus size={16} /> Add / Update Variant</div>
                        </button>

                        {colorVariants.length > 0 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {colorVariants.map((variant, idx) => (
                                        <button
                                            type="button"
                                            key={`variant-card-${idx}`}
                                            onClick={() => setSelectedVariantIndex(idx)}
                                            className={`rounded-2xl border p-3 text-left transition ${selectedVariantIndex === idx ? 'border-emerald-500 bg-emerald-950/70 shadow-sm' : 'border-gray-800 bg-gray-900 hover:border-emerald-500'}`}
                                        >
                                            <p className="text-sm font-semibold text-white truncate">{variant.name || `Variant ${idx + 1}`}</p>
                                            <p className="text-[11px] text-gray-500">₹{variant.price} · ₹{variant.mrp}</p>
                                            <p className="mt-2 text-[10px] uppercase tracking-[0.28em] text-slate-500">Click to preview</p>
                                        </button>
                                    ))}
                                </div>

                                <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
                                    <div className="flex items-center justify-between gap-3 mb-3">
                                        <div>
                                            <p className="text-sm font-bold text-white">Selected variant</p>
                                            <p className="text-[11px] text-gray-500">{colorVariants[selectedVariantIndex]?.name || `Variant ${selectedVariantIndex + 1}`}</p>
                                        </div>
                                        <div className="text-right text-[11px] text-gray-500">
                                            <p>Images: {((colorVariants[selectedVariantIndex]?.existingImages?.length || 0) + (colorVariants[selectedVariantIndex]?.previews?.length || 0))}</p>
                                            <p>Price: ₹{colorVariants[selectedVariantIndex]?.price} · MRP: ₹{colorVariants[selectedVariantIndex]?.mrp}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {(colorVariants[selectedVariantIndex]?.existingImages || []).map((img, imgIdx) => (
                                            <div key={`selected-existing-${imgIdx}`} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-800 bg-gray-950">
                                                <img src={img.url || img} alt="variant existing" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 flex items-end justify-between p-1 bg-gradient-to-t from-black/70 to-transparent">
                                                    <button type="button" onClick={() => removeExistingVariantImage(selectedVariantIndex, imgIdx)} className="rounded-full bg-rose-500 p-1 text-white text-[10px]">Del</button>
                                                    <div className="flex gap-1">
                                                        <button type="button" disabled={imgIdx === 0} onClick={() => moveVariantImage(selectedVariantIndex, imgIdx, 'left', true)} className="rounded-full bg-black/70 p-1 text-white text-[10px]">←</button>
                                                        <button type="button" disabled={imgIdx === (colorVariants[selectedVariantIndex]?.existingImages?.length || 0) - 1} onClick={() => moveVariantImage(selectedVariantIndex, imgIdx, 'right', true)} className="rounded-full bg-black/70 p-1 text-white text-[10px]">→</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {(colorVariants[selectedVariantIndex]?.previews || []).map((src, imgIdx) => (
                                            <div key={`selected-new-${imgIdx}`} className="relative w-20 h-20 rounded-xl overflow-hidden border border-emerald-600 bg-gray-950">
                                                <img src={src} alt="variant preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 flex items-end justify-between p-1 bg-gradient-to-t from-black/70 to-transparent">
                                                    <button type="button" onClick={() => removeVariantPreviewImage(selectedVariantIndex, imgIdx)} className="rounded-full bg-rose-500 p-1 text-white text-[10px]">Del</button>
                                                    <div className="flex gap-1">
                                                        <button type="button" disabled={imgIdx === 0} onClick={() => moveVariantImage(selectedVariantIndex, imgIdx, 'left')} className="rounded-full bg-black/70 p-1 text-white text-[10px]">←</button>
                                                        <button type="button" disabled={imgIdx === (colorVariants[selectedVariantIndex]?.previews?.length || 0) - 1} onClick={() => moveVariantImage(selectedVariantIndex, imgIdx, 'right')} className="rounded-full bg-black/70 p-1 text-white text-[10px]">→</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {((colorVariants[selectedVariantIndex]?.existingImages?.length || 0) + (colorVariants[selectedVariantIndex]?.previews?.length || 0)) === 0 && (
                                            <p className="text-xs text-gray-500">No images uploaded yet for this variant.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {colorVariants.map((variant, idx) => (
                                <div key={idx} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                                        <div>
                                            <p className="text-sm font-bold text-white">{variant.name || `Variant ${idx + 1}`}</p>
                                            <p className="text-[11px] text-gray-500">Price: ₹{variant.price} · MRP: ₹{variant.mrp}</p>
                                        </div>
                                        <button type="button" onClick={() => removeColorVariant(idx)} className="text-rose-400 hover:text-rose-200 text-xs uppercase tracking-[0.24em]">Remove</button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                        <input value={variant.name} onChange={(e) => handleVariantFieldChange(idx, 'name', e.target.value)} placeholder="Variant name" className="p-3 bg-gray-950 border border-gray-800 rounded-xl outline-none focus:border-emerald-500 text-xs text-white" />
                                        <input value={variant.price} onChange={(e) => handleVariantFieldChange(idx, 'price', e.target.value)} type="number" placeholder="Price" className="p-3 bg-gray-950 border border-gray-800 rounded-xl outline-none focus:border-emerald-500 text-xs text-emerald-400" />
                                        <input value={variant.mrp} onChange={(e) => handleVariantFieldChange(idx, 'mrp', e.target.value)} type="number" placeholder="MRP" className="p-3 bg-gray-950 border border-gray-800 rounded-xl outline-none focus:border-rose-500 text-xs text-gray-500" />
                                    </div>

                                    {(variant.previews?.length > 0 || variant.existingImages?.length > 0) && (
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap gap-2">
                                                {variant.existingImages?.map((img, imgIdx) => (
                                                    <div key={`existing-${imgIdx}`} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-800">
                                                        <img src={img.url || img} alt="existing variant" className="w-full h-full object-cover" />
                                                        <button type="button" onClick={() => removeExistingVariantImage(idx, imgIdx)} className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full opacity-90 hover:bg-rose-400">
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                                {variant.previews?.map((src, imgIdx) => (
                                                    <div key={`new-${imgIdx}`} className="w-16 h-16 rounded-lg overflow-hidden border border-emerald-600 ring-1 ring-emerald-600">
                                                        <img src={src} alt="new variant" className="w-full h-full object-cover" />
                                                    </div>
                                                ))}
                                            </div>
                                            {variant.existingImages?.length > 0 && (
                                                <p className="text-[10px] text-gray-500">Click the trash icon to remove an existing variant image from this color.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* PRODUCT INFORMATION SECTION */}
                    <div className="bg-gray-950 p-5 rounded-xl border border-gray-800 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Product Information (Amazon-style)</h3>
                                <p className="text-[11px] text-gray-500">Add grouped key-value specifications for the product.</p>
                            </div>
                        </div>
                        
                        <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl space-y-4">
                            <input type="text" placeholder="Section Title (e.g. Item details)" value={infoInput.sectionTitle} onChange={handleInfoSectionTitleChange} className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl outline-none focus:border-emerald-500 text-sm text-white" />
                            
                            <div className="space-y-2">
                                <p className="text-[10px] uppercase text-gray-500 font-bold ml-1">Key-Value Pairs</p>
                                {infoInput.details.map((detail, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <input type="text" placeholder="Key (e.g. Material)" value={detail.key} onChange={(e) => handleInfoDetailChange(idx, 'key', e.target.value)} className="flex-1 p-2 bg-gray-950 border border-gray-800 rounded-lg outline-none focus:border-emerald-500 text-xs text-white" />
                                        <input type="text" placeholder="Value (e.g. 100% Cotton)" value={detail.value} onChange={(e) => handleInfoDetailChange(idx, 'value', e.target.value)} className="flex-1 p-2 bg-gray-950 border border-gray-800 rounded-lg outline-none focus:border-emerald-500 text-xs text-white" />
                                        <button type="button" onClick={() => removeInfoDetailRow(idx)} disabled={infoInput.details.length === 1} className="p-2 text-rose-500 hover:text-rose-400 disabled:opacity-50">
                                            <Trash2 size={16} />
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

                    <div className="bg-gray-950 p-5 rounded-xl border border-gray-800 space-y-5">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Custom Attributes / Set Count</h3>
                                <p className="text-[11px] text-gray-500">Add dynamic attributes with modifiers and stock per option.</p>
                            </div>
                            <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-400">Flexible</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                                value={customAttributeInput.title}
                                onChange={(e) => handleCustomAttributeInputChange('title', e.target.value)}
                                placeholder="Attribute title (e.g. Select Set)"
                                className="p-3 bg-gray-900 border border-gray-800 rounded-xl outline-none focus:border-emerald-500 text-xs text-white"
                            />
                            <button type="button" onClick={addCustomAttribute} className="p-3 bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-emerald-500 transition-all">
                                Add Attribute Group
                            </button>
                        </div>

                        <div className="space-y-3">
                            {customAttributeInput.options.map((option, optIdx) => (
                                <div key={optIdx} className="grid grid-cols-1 gap-3 md:grid-cols-5 items-end">
                                    <input
                                        value={option.label}
                                        onChange={(e) => handleCustomAttributeOptionInputChange(optIdx, 'label', e.target.value)}
                                        placeholder="Option label"
                                        className="col-span-2 p-3 bg-gray-900 border border-gray-800 rounded-xl outline-none focus:border-emerald-500 text-xs text-white"
                                    />
                                    <input
                                        value={option.priceModifier}
                                        onChange={(e) => handleCustomAttributeOptionInputChange(optIdx, 'priceModifier', e.target.value)}
                                        type="number"
                                        placeholder="Price modifier"
                                        className="p-3 bg-gray-900 border border-gray-800 rounded-xl outline-none focus:border-emerald-500 text-xs text-emerald-400"
                                    />
                                    <input
                                        value={option.mrpModifier}
                                        onChange={(e) => handleCustomAttributeOptionInputChange(optIdx, 'mrpModifier', e.target.value)}
                                        type="number"
                                        placeholder="MRP modifier"
                                        className="p-3 bg-gray-900 border border-gray-800 rounded-xl outline-none focus:border-rose-500 text-xs text-gray-500"
                                    />
                                    <input
                                        value={option.stock}
                                        onChange={(e) => handleCustomAttributeOptionInputChange(optIdx, 'stock', e.target.value)}
                                        type="number"
                                        placeholder="Stock"
                                        className="p-3 bg-gray-900 border border-gray-800 rounded-xl outline-none focus:border-blue-600 text-xs text-white"
                                    />
                                </div>
                            ))}
                            <button type="button" onClick={addCustomAttributeOptionRow} className="w-full py-3 bg-gray-900 border border-emerald-500 text-emerald-400 rounded-xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-emerald-500 hover:text-white transition-all">
                                + Add New Option
                            </button>
                        </div>

                        {customAttributes.length > 0 && (
                            <div className="space-y-4">
                                {customAttributes.map((attribute, attrIdx) => (
                                    <div key={attrIdx} className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                                            <div>
                                                <p className="text-sm font-bold text-white">{attribute.title}</p>
                                                <p className="text-[11px] text-gray-500">{attribute.options.length} option(s)</p>
                                            </div>
                                            <button type="button" onClick={() => removeCustomAttribute(attrIdx)} className="text-rose-400 hover:text-rose-200 text-xs uppercase tracking-[0.24em]">Remove</button>
                                        </div>
                                        <div className="space-y-3">
                                            {attribute.options.map((option, optionIndex) => (
                                                <div key={optionIndex} className="grid grid-cols-1 gap-3 md:grid-cols-5 items-center">
                                                    <input
                                                        value={option.label}
                                                        onChange={(e) => handleCustomAttributeOptionChange(attrIdx, optionIndex, 'label', e.target.value)}
                                                        placeholder="Option label"
                                                        className="col-span-2 p-3 bg-gray-950 border border-gray-800 rounded-xl outline-none focus:border-emerald-500 text-xs text-white"
                                                    />
                                                    <input
                                                        value={option.priceModifier}
                                                        onChange={(e) => handleCustomAttributeOptionChange(attrIdx, optionIndex, 'priceModifier', e.target.value)}
                                                        type="number"
                                                        placeholder="Price modifier"
                                                        className="p-3 bg-gray-950 border border-gray-800 rounded-xl outline-none focus:border-emerald-500 text-xs text-emerald-400"
                                                    />
                                                    <input
                                                        value={option.mrpModifier}
                                                        onChange={(e) => handleCustomAttributeOptionChange(attrIdx, optionIndex, 'mrpModifier', e.target.value)}
                                                        type="number"
                                                        placeholder="MRP modifier"
                                                        className="p-3 bg-gray-950 border border-gray-800 rounded-xl outline-none focus:border-rose-500 text-xs text-gray-500"
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            value={option.stock}
                                                            onChange={(e) => handleCustomAttributeOptionChange(attrIdx, optionIndex, 'stock', e.target.value)}
                                                            type="number"
                                                            placeholder="Stock"
                                                            className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl outline-none focus:border-blue-600 text-xs text-white"
                                                        />
                                                        <button type="button" onClick={() => removeCustomAttributeOption(attrIdx, optionIndex)} className="rounded-xl bg-rose-500 px-3 py-3 text-xs font-bold text-white">Del</button>
                                                    </div>
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => addCustomAttributeOption(attrIdx)} className="w-full py-3 bg-gray-900 border border-emerald-500 text-emerald-400 rounded-xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-emerald-500 hover:text-white transition-all">
                                                + Add Option
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        disabled={submitting}
                        className="w-full bg-blue-600 text-white py-4 rounded-lg font-black uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center justify-center gap-2 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                        <IoSaveOutline size={20} />
                        {submitting ? 'Updating...' : 'Update Product'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProduct;