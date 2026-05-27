import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Edit3, Search, Plus, Loader2, AlertCircle, PackageOpen, Save, X, Edit } from 'lucide-react';
import { getAllProductsAPI, deleteProductAPI, getAllCategoriesAPI, updateProductAPI } from '../../../src/api/authAndAdminApi';
import { useNavigate } from 'react-router-dom';


const AllProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingProductId, setEditingProductId] = useState(null); // Kis product ka stock edit ho raha hai
  const [currentEditingStock, setCurrentEditingStock] = useState(''); // Edit ho rahe stock ki value
  const [updatingStockId, setUpdatingStockId] = useState(null); // Kis product ka stock update ho raha hai (API call)

const [dynamicCategories, setDynamicCategories] = useState([]);
 useEffect(() => {
    const getCats = async () => {
        try {
            setLoading(true);
            const res = await getAllCategoriesAPI();

            // Agar res.success true hai aur res.data ek array hai
            if (res && res.success && Array.isArray(res.data)) {
                setDynamicCategories(res.data);
            } else if (Array.isArray(res)) { 
                setDynamicCategories(res);
            }
        } catch (err) {
            console.error("Component fetch error:", err);
            setMessage({ type: 'error', text: 'Categories load nahi ho payi' });
        } finally {
            setLoading(false);
        }
    };
    getCats();
}, []);
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      console.log("🔍 Fetching with:", { page, searchTerm, category });
      const response = await getAllProductsAPI({
        page,
        limit: 10,
        search: searchTerm || undefined,
        category: category || undefined
      });

      if (response && response.success) {
        setProducts(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
        console.log("📦 Products Loaded:", response.data.length);
      } else {
        setProducts([]);
        setMessage({ type: 'error', text: response?.message || 'Failed to fetch products' });
      }
    } catch (error) {
      console.error('❌ Connection Error:', error);
      setProducts([]);
      setMessage({ type: 'error', text: 'Server connection failed.' });
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, category]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchProducts]);

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setDeleting(id);
    try {
      const response = await deleteProductAPI(id);
      if (response.success) {
        setMessage({ type: 'success', text: 'Product deleted successfully' });
        setProducts(prev => prev.filter(p => p._id !== id));
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error deleting product' });
    } finally {
      setDeleting(null);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  // Stock inline edit functionality
  const handleEditStockClick = (product) => {
    setEditingProductId(product._id);
    setCurrentEditingStock(product.stock.toString()); // Convert to string for input value
  };

  const handleStockChange = (e) => {
    setCurrentEditingStock(e.target.value);
  };

  const handleSaveStock = async (productId) => {
    setUpdatingStockId(productId);
    try {
      const newStock = parseInt(currentEditingStock, 10);
      if (isNaN(newStock) || newStock < 0) {
        setMessage({ type: 'error', text: 'Invalid stock quantity.' });
        return;
      }

      const formData = new FormData();
      formData.append('stock', newStock);

      // Assuming updateProductAPI exists and takes (id, formData)
      const response = await updateProductAPI(productId, formData);
      if (response.success) {
        setMessage({ type: 'success', text: 'Stock updated successfully!' });
        setProducts(prev => prev.map(p => p._id === productId ? { ...p, stock: newStock } : p));
        setEditingProductId(null); // Exit edit mode
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to update stock.' });
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Server error updating stock.' });
    } finally {
      setUpdatingStockId(null);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-950 min-h-screen text-gray-200 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2 uppercase tracking-tight">
            <PackageOpen className="text-emerald-500" /> All Products
          </h1>
          <p className="text-slate-400 text-xs">Aaramdehi Inventory Management System</p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button onClick={() => navigate('/admin/add-product')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20">
            <Plus size={18} /> Add Product
          </button>
          
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => {setPage(1); setSearchTerm(e.target.value);}}
              className="bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-emerald-500 text-white w-full md:w-64" 
            />
          </div>
          
        <div className="relative group">
  <select 
    value={category}
    onChange={(e) => {
      setPage(1); 
      setCategory(e.target.value);
    }}
    className="appearance-none bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 pr-10 text-sm outline-none focus:border-emerald-500 text-white cursor-pointer transition-all hover:bg-gray-800 shadow-lg"
  >
    <option value="">All Categories</option>
    {dynamicCategories && dynamicCategories.length > 0 ? (
      dynamicCategories.map((cat) => (
        <option key={cat._id} value={cat.name} className="bg-gray-900 text-white">
          {cat.name}
        </option>
      ))
    ) : (
      <option disabled>Loading Categories...</option>
    )}
  </select>
  
  {/* Chota arrow icon dropdown ke liye */}
  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-500">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  </div>
</div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading && products.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64 gap-3">
          <Loader2 className="animate-spin text-emerald-500" size={32} />
          <p className="text-slate-500 text-sm animate-pulse">Syncing Database...</p>
        </div>
      ) : products.length > 0 ? (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-800/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-gray-800">
                  <th className="p-5">Product Details</th>
                  <th className="p-5">Category</th>
                  <th className="p-5">Price (INR)</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-800/20 transition-colors">
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <img 
                          src={product.thumbnail || (product.images && product.images[0]?.url) || 'https://placehold.co/100x100?text=No+Image'} 
                          className="w-12 h-12 rounded-lg object-cover border border-gray-800" 
                          alt={product.name}
                        />
                        <div>
                          <p className="font-bold text-sm text-white">{product.name}</p>
                          <p className="text-[10px] text-slate-500 uppercase">{product.brand || 'No Brand'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="bg-gray-800 text-slate-300 px-3 py-1 rounded-full text-[10px] font-bold">
                        {product.category}
                      </span>
                    </td>
                    <td className="p-5">
                      <p className="text-emerald-400 font-black text-sm">₹{product.sellingPrice?.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-500 line-through">₹{product.mrp}</p>
                    </td>
                    <td className="p-5">
                        <div className={`text-[10px] font-bold inline-block px-2 py-0.5 rounded ${product.stock < 10 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                            {product.stock} IN STOCK
                        </div>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => navigate(`/admin/edit-product/${product._id}`)} className="p-2 bg-gray-800 rounded-lg text-slate-400 hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDeleteProduct(product._id)} disabled={deleting === product._id} className="p-2 bg-gray-800 rounded-lg text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                          {deleting === product._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
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
            <PackageOpen className="text-gray-800 mb-4" size={64} />
            <h2 className="text-xl font-black text-white mb-2">No Products in Inventory</h2>
            <p className="text-slate-500 text-sm max-w-sm">Aapke database mein abhi koi product nahi hai. Naya product add karne ke liye upar diye gaye button ka use karein.</p>
        </div>
      )}
    </div>
  );
};

export default AllProducts;