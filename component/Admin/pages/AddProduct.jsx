import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Quill ka CSS import karna zaroori hai
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { ref, push, set } from "firebase/database"; // ✅ Import Firebase methods
import { db } from '../../../src/api/firebase'; // ✅ Import initialized DB instance
import { createProductAPI } from '../../../src/api/authAndAdminApi'; // Assuming you have this API
import { generateKeywordsOnTheFly } from '../../../src/utils/searchIndexer'; // Example utility path

// ✅ Move modules outside to prevent React 19 re-initialization crashes
const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link', 'image', 'video'], 
    [{ 'color': [] }, { 'background': [] }],
    ['clean'] 
  ],
};

const AddProduct = () => {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState(''); // ✅ Rich Text Description State
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Basic validation
      if (!productName || !category || !price || !description) {
        setMessage({ type: 'error', text: 'Please fill all required fields.' });
        setLoading(false);
        return;
      }

      // ✅ ENGINEERED PAYLOAD: Generate Keywords using optimized parser
      const keywords = generateKeywordsOnTheFly(productName, description);

      const finalPayload = {
        name: productName,
        category: category,
        price: parseFloat(price),
        description: description, 
        searchKeywords: keywords, // 🔥 The Index Field
        indexedAt: new Date().toISOString(),
        visibility: 'public'
      };

      // 🔥 FIREBASE REALTIME DB WRITE: Sync for Search Engine indexing
      const indexRef = ref(db, 'product_indexes');
      await set(push(indexRef), finalPayload);

      const res = await createProductAPI(finalPayload); // ✅ Fixed: Use finalPayload instead of undefined productData

      if (res.success) {
        setMessage({ type: 'success', text: res.message || 'Product added successfully!' });
        // Clear form
        setProductName('');
        setCategory('');
        setPrice('');
        setDescription('');
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to add product.' });
      }
    } catch (error) {
      console.error("Error adding product:", error);
      setMessage({ type: 'error', text: error.message || 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6 text-gray-200">
      <div className="max-w-4xl mx-auto bg-gray-900 p-8 rounded-lg shadow-lg border border-gray-800">
        <h2 className="text-3xl font-bold mb-6 text-blue-500">Add New Product</h2>

        {message.text && (
          <div className={`p-3 mb-4 rounded-md flex items-center gap-2 ${message.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="productName" className="block text-sm font-medium mb-2">Product Name</label>
            <input type="text" id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-blue-500 focus:border-blue-500" required />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2">Category</label>
            <input type="text" id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-blue-500 focus:border-blue-500" required />
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium mb-2">Price</label>
            <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-blue-500 focus:border-blue-500" required />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">Description</label>
            {/* ✅ ReactQuill Integration */}
            <ReactQuill theme="snow" value={description} onChange={setDescription} modules={modules} placeholder="Enter product description..." className="bg-gray-800 rounded-md text-gray-200 h-64 mb-12" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
            {loading ? 'Adding Product...' : 'Add Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;