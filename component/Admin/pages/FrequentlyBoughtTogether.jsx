import React, { useState, useEffect } from 'react';
import { Plus, Check } from 'lucide-react';
import { getAllProductsAPI } from '../../src/api/authAndAdminApi';
import { useCart } from '../../../src/hooks/useCart';

const FrequentlyBoughtTogether = ({ mainProduct }) => {
    const [bundleItems, setBundleItems] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchRelatedProducts = async () => {
            if (!mainProduct) return;
            try {
                setLoading(true);
                
                // ✅ Category ID को सही तरीके से निकालें (String या Object handling)
                const catId = typeof mainProduct.category === 'object' 
                    ? mainProduct.category?._id 
                    : mainProduct.category;

                // 1. पहले उसी कैटेगरी के प्रोडक्ट्स ढूँढें
                const res = await getAllProductsAPI({ 
                    category: catId, 
                    limit: 5 
                });
                
                let related = [];
                if (res && res.success && Array.isArray(res.data)) {
                    related = res.data.filter(p => String(p._id) !== String(mainProduct._id));
                }

                // 2. ✅ Fallback: अगर कैटेगरी में कोई और प्रोडक्ट नहीं है, तो कोई भी लेटेस्ट प्रोडक्ट दिखाएं
                if (related.length === 0) {
                    const fallbackRes = await getAllProductsAPI({ limit: 5 });
                    if (fallbackRes.success) related = fallbackRes.data.filter(p => String(p._id) !== String(mainProduct._id));
                }

                if (related.length > 0) {
                    const bundle = [mainProduct, ...related.slice(0, 2)];
                    setBundleItems(bundle);
                    setSelectedIds(bundle.map(item => item._id));
                }
            } catch (err) {
                console.error("FBT Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRelatedProducts();
    }, [mainProduct]);

    const toggleItem = (id) => {
        // मुख्य प्रोडक्ट हमेशा सिलेक्टेड रहेगा
        if (id === mainProduct._id) return; 
        
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const calculateTotal = () => {
        return bundleItems
            .filter(item => selectedIds.includes(item._id))
            .reduce((sum, item) => sum + (item.sellingPrice || item.price), 0);
    };

    const handleAddBundleToCart = () => {
        const itemsToAdd = bundleItems.filter(item => selectedIds.includes(item._id));
        
        // Add each selected product to the centralized cart state
        itemsToAdd.forEach(product => addToCart(product, 1));
        alert(`${itemsToAdd.length} items added to your cart together!`);
    };

    if (loading || bundleItems.length < 2) return null;

    return (
        <div className="my-12 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black uppercase tracking-tight text-blue-900 mb-6">Frequently Bought Together</h2>
            
            <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Images Row */}
                <div className="flex items-center gap-4">
                    {bundleItems.map((item, index) => (
                        <React.Fragment key={item._id}>
                            <div 
                                className={`relative w-24 h-24 md:w-32 md:h-32 rounded-2xl border-2 transition-all cursor-pointer overflow-hidden bg-gray-50 flex items-center justify-center p-4 ${selectedIds.includes(item._id) ? 'border-blue-500 opacity-100' : 'border-transparent opacity-40'}`}
                                onClick={() => toggleItem(item._id)}
                            >
                                {/* ✅ बेहतर इमेज हैंडलिंग */}
                                <img src={item.thumbnail || (item.images && item.images[0]?.url) || item.image} alt={item.name} className="max-h-full object-contain mix-blend-multiply" />
                                {selectedIds.includes(item._id) && (
                                    <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-0.5">
                                        <Check size={12} strokeWidth={4} />
                                    </div>
                                )}
                            </div>
                            {index < bundleItems.length - 1 && <Plus className="text-gray-300" size={20} />}
                        </React.Fragment>
                    ))}
                </div>

                {/* Selection Details & Price */}
                <div className="flex-1 space-y-3">
                    <div className="space-y-2">
                        {bundleItems.map(item => (
                            <label key={item._id} className="flex items-center gap-3 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    checked={selectedIds.includes(item._id)} 
                                    onChange={() => toggleItem(item._id)}
                                    disabled={item._id === mainProduct._id}
                                    className="w-4 h-4 rounded accent-blue-600"
                                />
                                <span className={`text-sm ${selectedIds.includes(item._id) ? 'text-gray-800 font-bold' : 'text-gray-400 font-medium'}`}>
                                    {item._id === mainProduct._id ? <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded mr-2 uppercase">This Item</span> : ''}
                                    {item.name}
                                </span>
                                <span className="text-sm font-black text-blue-900 ml-auto">₹{(item.sellingPrice || item.price).toLocaleString()}</span>
                            </label>
                        ))}
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Total Bundle Price</p>
                            <p className="text-2xl font-black text-gray-900">₹{calculateTotal().toLocaleString()}</p>
                        </div>
                        <button 
                            onClick={handleAddBundleToCart}
                            className="bg-yellow-400 hover:bg-yellow-500 text-blue-950 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-yellow-400/20 active:scale-95"
                        >
                            Add {selectedIds.length} items to cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FrequentlyBoughtTogether;