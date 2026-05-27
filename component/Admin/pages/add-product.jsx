import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Link } from '@tiptap/extension-link';
import { Upload, Save, Box, DollarSign, ListChecks, Loader2, X, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { useNavigate } from 'react-router-dom';
import { createProductAPI, getAllCategoriesAPI } from '@/api/authAndAdminApi';

// ✅ Expert Indexing: Stop-words for clean keyword generation
const STOPWORDS = new Set(['for', 'the', 'a', 'in', 'with', 'hai', 'ko', 'ka', 'me', 'and', 'to', 'is', 'of', 'this', 'that', 'on', 'at', 'by', 'an', 'each', 'from', 'are']);

// ✅ Fix: Move extensions outside the component to prevent duplicate registration warnings
const extensions = [
  StarterKit,
  TextStyle,
  Color,
  Link.configure({ openOnClick: false }),
];

export default function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [categoriesList, setCategoriesList] = useState([]);

  // ✅ Professional Keyword Parser (Data Engineering Pattern)
  const generateKeywordsOnTheFly = (title, htmlDescription) => {
    if (!title) return [];
    const plainDesc = htmlDescription ? htmlDescription.replace(/<[^>]*>/g, ' ') : '';
    const combinedText = `${title} ${plainDesc}`.toLowerCase();
    
    // Punctuation and Special characters removal
    const cleanText = combinedText.replace(/[.,\-/;:!?"'\[\]{}_\+=\*&^%$#@~`|<>\\\[\]]/g, ' ');
    const tokens = cleanText.split(/\s+/).filter(word => 
      word.length > 2 && !STOPWORDS.has(word)
    );

    // Contextual Synonyms Injection
    const additionalKeywords = [];
    tokens.forEach(token => {
      if (token === 'pillow' || token === 'pillows') {
        additionalKeywords.push('takiya', 'headrest', 'cushion', 'neck');
      }
      if (token === 'mattress' || token === 'mattresses') {
        additionalKeywords.push('gaddi', 'bed', 'mattres', 'back');
      }
    });
    
    return [...new Set([...tokens, ...additionalKeywords])];
  };

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    description: '',
    shortDescription: '',
    category: '', 
    subCategory: '',
    tags: '',
    mrp: '0', // Default to '0' to avoid empty string issues
    sellingPrice: '0', // Default to '0'
    discountPercent: '0',
    stock: '0', // Default to '0'
    sku: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    material: '',
    dimensions: '',
    weight: '',
    color: '',
    warranty: ''
  });

  // ✅ React 19 Compatible Editor (Tiptap)
  const editor = useEditor({
    extensions,
    content: formData.description,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({ ...prev, description: editor.getHTML() }));
    },
    editorProps: {
      attributes: {
        class: 'p-4 min-h-[200px] focus:outline-none text-white bg-gray-950 prose prose-invert max-w-none',
      },
    },
  });

  // ✅ Database se Categories fetch karna
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllCategoriesAPI();
        
        // Robust check for different API response structures
        let cats = [];
        if (res && res.success && Array.isArray(res.data)) cats = res.data;
        else if (res && Array.isArray(res.data)) cats = res.data;
        else if (Array.isArray(res)) cats = res;

        if (cats.length > 0) {
          setCategoriesList(cats);
          // Pehli category ko default set karein
          setFormData(prev => ({ ...prev, category: cats[0].name }));
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setMessage({ type: 'error', text: 'Failed to load categories from database' });
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setLoading(true);
    const compressedFiles = [];
    const previewUrls = [];

    try {
      for (const file of files) {
        const compressedFile = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1000 });
        const webpFile = await convertToWebP(compressedFile);
        
        compressedFiles.push(webpFile);
        previewUrls.push(URL.createObjectURL(webpFile));
      }

      setImageFiles(prev => [...prev, ...compressedFiles]);
      setPreviews(prev => [...prev, ...previewUrls]);
      setMessage({ type: 'success', text: `${files.length} images added ✓` });
    } catch (err) {
      setMessage({ type: 'error', text: 'Image processing failed' });
    } finally {
      setLoading(false);
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
    
    // ✅ Improved Validation: Check precisely which fields are missing
    const requiredTextFields = ['name', 'category'];
    const requiredNumberFields = ['mrp', 'sellingPrice', 'stock'];

    const missing = requiredTextFields.filter(field => !formData[field]?.trim());
    // For number fields, check if they are empty strings or undefined/null, but allow 0
    const missingNumbers = requiredNumberFields.filter(field => 
      formData[field] === "" || formData[field] === undefined || formData[field] === null
    );

    const allMissing = [...missing, ...missingNumbers];

    if (allMissing.length > 0) {
      setMessage({ 
        type: 'error', 
        text: `Required fields missing: ${allMissing.join(', ')}. Please fill all details.` 
      });
      return;
    }

    setSubmitting(true);
    try {
      const submitData = new FormData();

      // ✅ SMART INDEXING: Append generated keywords for the search engine
      const keywords = generateKeywordsOnTheFly(formData.name, formData.description);
      submitData.append('searchKeywords', JSON.stringify(keywords)); // Array ko string bhej rahe hain

      Object.keys(formData).forEach(key => {
        if (key !== 'material' && key !== 'dimensions' && key !== 'weight' && key !== 'color' && key !== 'warranty') {
          // ✅ Convert empty string for number fields to 0 before appending
          if (requiredNumberFields.includes(key) && formData[key] === "") {
            submitData.append(key, "0"); // Send 0 instead of empty string
          } else if (formData[key] !== null && formData[key] !== undefined) {
            // Only append if not null/undefined to avoid sending "null" or "undefined" strings
            submitData.append(key, formData[key]);
          }
        }
      });

      const specifications = JSON.stringify({
        material: formData.material,
        dimensions: formData.dimensions,
        weight: formData.weight,
        color: formData.color,
        warranty: formData.warranty
      });
      submitData.append('specifications', specifications);

      // Backend expect 'images' key for multiple files
      imageFiles.forEach(file => {
        submitData.append('images', file);
      });

      const response = await createProductAPI(submitData);
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Product published! 🎉' });
        setTimeout(() => navigate('/admin/products'), 2000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Server Error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-950 min-h-screen text-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Box className="text-emerald-500" /> Add New Product
            </h1>
            <p className="text-slate-400 text-sm">Aaramdehi Inventory System</p>
          </div>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Products</span>
          </button>
        </div>
      
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
          message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-semibold mb-4 text-emerald-400">📝 Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="name" value={formData.name} onChange={handleInputChange} className="w-full p-3 bg-gray-950 border border-gray-800 rounded-lg outline-none focus:border-emerald-500 text-white" placeholder="Product Name *" />
              <input name="brand" value={formData.brand} onChange={handleInputChange} className="w-full p-3 bg-gray-950 border border-gray-800 rounded-lg outline-none focus:border-emerald-500 text-white" placeholder="Brand Name" />
              
              {/* ✅ Dynamic Dropdown */}
              <select 
                name="category" 
                value={formData.category} 
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-950 border border-gray-800 rounded-lg outline-none focus:border-emerald-500 text-white"
              >
                {categoriesList.length === 0 && <option value="">Loading Categories...</option>}
                {categoriesList.map(cat => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <input name="subCategory" value={formData.subCategory} onChange={handleInputChange} className="w-full p-3 bg-gray-950 border border-gray-800 rounded-lg outline-none focus:border-emerald-500 text-white" placeholder="Sub Category" />
            </div>
            
            <div className="mt-6">
              <label className="text-xs font-bold text-slate-500 mb-2 block uppercase">Product Description (Rich Text)</label>
              <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                {/* Simple Tiptap Toolbar */}
                <div className="flex flex-wrap gap-1.5 p-2 border-b border-gray-800 bg-gray-900/50">
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`px-2.5 py-1 text-xs rounded border border-gray-700 font-bold ${editor?.isActive('heading', { level: 1 }) ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}
                  >
                    H1
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`px-2.5 py-1 text-xs rounded border border-gray-700 font-bold ${editor?.isActive('heading', { level: 2 }) ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}
                  >
                    H2
                  </button>
                  <div className="w-px h-6 bg-gray-800 mx-1 self-center" />
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    className={`px-2.5 py-1 text-xs rounded border border-gray-700 font-bold ${editor?.isActive('bold') ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}
                  >
                    Bold
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    className={`px-2.5 py-1 text-xs rounded border border-gray-700 italic ${editor?.isActive('italic') ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}
                  >
                    Italic
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleStrike().run()}
                    className={`px-2.5 py-1 text-xs rounded border border-gray-700 line-through ${editor?.isActive('strike') ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}
                  >
                    Strike
                  </button>
                  <div className="w-px h-6 bg-gray-800 mx-1 self-center" />
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    className={`px-2.5 py-1 text-xs rounded border border-gray-700 ${editor?.isActive('bulletList') ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}
                  >
                    Bullet List
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                    className={`px-2.5 py-1 text-xs rounded border border-gray-700 ${editor?.isActive('orderedList') ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}
                  >
                    Ordered List
                  </button>
                  <div className="w-px h-6 bg-gray-800 mx-1 self-center" />
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                    className={`px-2.5 py-1 text-xs rounded border border-gray-700 ${editor?.isActive('blockquote') ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}
                  >
                    Quote
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().setHorizontalRule().run()}
                    className={`px-2.5 py-1 text-xs rounded border border-gray-700 text-gray-400 hover:bg-gray-800`}
                  >
                    Divider
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().unsetAllMarks().run()}
                    className={`px-2.5 py-1 text-xs rounded border border-gray-700 text-gray-400 hover:text-rose-400`}
                  >
                    Clear
                  </button>
                </div>
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-semibold mb-4 text-emerald-400 flex items-center gap-2"><DollarSign size={18}/> Pricing</h3>
            <div className="grid grid-cols-3 gap-4">
              <input name="mrp" type="number" value={formData.mrp} onChange={handleInputChange} className="p-3 bg-gray-950 border border-gray-800 rounded-lg outline-none focus:border-emerald-500 text-white" placeholder="MRP *" min="0" />
              <input name="sellingPrice" type="number" value={formData.sellingPrice} onChange={handleInputChange} className="p-3 bg-gray-950 border border-gray-800 rounded-lg outline-none focus:border-emerald-500 text-white" placeholder="Selling Price *" min="0" />
              <input name="discountPercent" type="number" value={formData.discountPercent} onChange={handleInputChange} className="p-3 bg-gray-950 border border-gray-800 rounded-lg outline-none focus:border-emerald-500 text-white" placeholder="Discount %" min="0" max="100" />
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-semibold mb-4 text-emerald-400 flex items-center gap-2"><ListChecks size={18}/> Inventory</h3>
            <div className="grid grid-cols-2 gap-4">
              <input name="stock" type="number" value={formData.stock} onChange={handleInputChange} className="w-full p-3 bg-gray-950 border border-gray-800 rounded-lg outline-none focus:border-emerald-500 text-white" placeholder="Stock Quantity *" min="0" />
              <input name="sku" value={formData.sku} onChange={handleInputChange} className="w-full p-3 bg-gray-950 border border-gray-800 rounded-lg outline-none focus:border-emerald-500 text-white" placeholder="SKU (Optional)" />
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-semibold mb-4 text-emerald-400 flex items-center gap-2"><ListChecks size={18}/> Specifications</h3>
            <div className="grid grid-cols-2 gap-4">
              <input name="material" value={formData.material} onChange={handleInputChange} className="p-3 bg-gray-950 border border-gray-800 rounded-lg outline-none focus:border-emerald-500 text-white" placeholder="Material" />
              <input name="color" value={formData.color} onChange={handleInputChange} className="p-3 bg-gray-950 border border-gray-800 rounded-lg outline-none focus:border-emerald-500 text-white" placeholder="Color" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 sticky top-8">
            <h3 className="text-sm font-bold mb-4 text-slate-400 uppercase">📸 Product Image</h3>
            <div className="space-y-4">
              <div className="relative border-2 border-dashed border-gray-700 h-32 flex flex-col items-center justify-center rounded-lg hover:border-emerald-500 cursor-pointer transition-colors">
                <Upload className="text-gray-500" size={32} />
                <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase">Add Multiple Images</p>
                <input type="file" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {previews.map((url, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-800">
                    <img src={url} className="w-full h-full object-cover" alt="preview" />
                    <button type="button" onClick={() => {
                      setPreviews(previews.filter((_, i) => i !== idx));
                      setImageFiles(imageFiles.filter((_, i) => i !== idx));
                    }} className="absolute top-1 right-1 bg-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X size={10}/></button>
                  </div>
                ))}
              </div>
            </div>
            {loading && <p className="text-emerald-500 text-xs mt-2 animate-pulse">Processing...</p>}
          </div>

          <button type="submit" disabled={submitting} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {submitting ? "Publishing..." : "Publish Product"}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}