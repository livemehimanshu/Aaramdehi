import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoCloudUploadOutline, IoArrowBackOutline, IoSaveOutline } from 'react-icons/io5';
import { Loader2 } from 'lucide-react';
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
    const [existingImages, setExistingImages] = useState([]); // Preserve old images
    const [selectedFiles, setSelectedFiles] = useState([]); // ✅ Store actual File objects
    const [previews, setPreviews] = useState([]); // Images preview ke liye

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
                    if (p.images) {
                        const previewUrls = p.images.map(img => img.url || img);
                        setPreviews(previewUrls);
                        setExistingImages(Array.isArray(p.images) ? p.images : []);
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
        const compressedFiles = [];
        const previewUrls = [];

        try {
            for (const file of files) {
                const compressedFile = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1000 });
                const webpFile = await convertToWebP(compressedFile); 
                
                compressedFiles.push(webpFile);
                previewUrls.push(URL.createObjectURL(webpFile));
            }
            setSelectedFiles(compressedFiles); // ✅ Store compressed/webp files
            setPreviews(previewUrls); // ✅ Update previews
        } catch (err) {
            console.error("Image processing failed:", err);
            // Optionally show a message to the user
        } finally {
            setImageProcessing(false); // ✅ End image processing
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

        formData.append('seoKeywords', JSON.stringify(updatedKeywords)); // backend expects seoKeywords
        if (existingImages.length > 0) {
            formData.append('existingImages', JSON.stringify(existingImages));
        }

        // Backend 'images' (plural) expect karta hai
        selectedFiles.forEach(file => {
            formData.append('images', file);
        });

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
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition">
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
                        <label className="text-[10px] font-black uppercase text-slate-500">Images (Select multiple to replace old ones)</label>
                        <div className="border-2 border-dashed border-gray-800 bg-gray-950 rounded-xl p-6 flex flex-col items-center justify-center hover:bg-gray-800/50 transition-colors cursor-pointer relative">
                            <IoCloudUploadOutline size={40} className="text-gray-600 mb-2" />
                            <p className="text-xs text-slate-500 font-bold">Click or Drag images here</p>
                            <input type="file" name="images" multiple onChange={handleFileChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                    </div>

                    {/* Image Previews */}
                    <div className="flex gap-4 overflow-x-auto py-2">
                        {previews.map((src, idx) => (
                            <div key={idx} className="w-24 h-24 rounded-lg border border-gray-800 overflow-hidden flex-shrink-0 bg-gray-950">
                                <img src={src} className="w-full h-full object-contain" alt="preview" />
                            </div>
                        ))}
                    </div>

                    <button 
                        type="submit" 
                        disabled={submitting}
                        className="w-full bg-blue-600 text-white py-4 rounded-lg font-black uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center justify-center gap-2 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed" // ✅ Disable cursor
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