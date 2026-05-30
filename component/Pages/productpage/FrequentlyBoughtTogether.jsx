import React, { useState, useEffect, useMemo } from 'react';
import { FiPlus } from 'react-icons/fi';
import { api } from '../../../src/utils/authUtils';
import { useCart } from '../../../src/hooks/useCart';
import toast from 'react-hot-toast';

const FrequentlyBoughtTogether = ({ mainProduct, mainProductPrice }) => {
    const [recommendations, setRecommendations] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    const PLACEHOLDER_IMAGE = "https://placehold.co/100x100?text=Product";

    useEffect(() => {
        const fetchRecs = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/order/recommendations/${mainProduct.id || mainProduct._id}`);
                if (res.data.success) {
                    setRecommendations(res.data.data);
                    setSelectedItems(res.data.data.map(item => item._id || item.id));
                }
            } catch (err) {
                console.error("Recommendations fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        if (mainProduct) fetchRecs();
    }, [mainProduct]);

    const toggleItem = (id) => {
        setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const bundleTotal = useMemo(() => {
        let total = Number(mainProductPrice || 0);
        recommendations.forEach(item => {
            if (selectedItems.includes(item._id || item.id)) {
                total += Number(item.sellingPrice || item.price || 0);
            }
        });
        return total;
    }, [mainProductPrice, recommendations, selectedItems]);

    const handleAddBundle = () => {
        addToCart({ ...mainProduct, price: mainProductPrice }, 1);
        recommendations.filter(item => selectedItems.includes(item._id || item.id)).forEach(item => {
            addToCart({ ...item, price: item.sellingPrice || item.price }, 1);
        });
        toast.success("Combo bundle added to cart!");
    };

    if (loading || recommendations.length === 0) return null;

    return (
        <div className="mt-20">
            <h2 className="text-xl font-black uppercase tracking-tighter mb-6">Frequently Bought Together</h2>
            <div className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm flex flex-col lg:flex-row items-center gap-8">
                <div className="flex items-center gap-4">
                    <img 
                        src={(mainProduct.images?.[0]?.url || mainProduct.images?.[0]) || mainProduct.thumbnail || PLACEHOLDER_IMAGE} 
                        className="w-16 h-16 md:w-24 md:h-24 object-contain bg-gray-50 rounded-xl border-2 border-blue-900 p-1" 
                        alt="main" 
                    />
                    {recommendations.map(item => (
                        <React.Fragment key={item._id || item.id}>
                            <FiPlus className="text-gray-300" />
                            <img 
                                src={item.thumbnail || (item.images && item.images[0]?.url) || PLACEHOLDER_IMAGE} 
                                onClick={() => toggleItem(item._id || item.id)}
                                className={`w-16 h-16 md:w-24 md:h-24 object-contain bg-gray-50 rounded-xl cursor-pointer transition-all ${selectedItems.includes(item._id || item.id) ? 'opacity-100 ring-2 ring-blue-900' : 'opacity-30'}`} 
                                alt="recommended" 
                            />
                        </React.Fragment>
                    ))}
                </div>
                <div className="w-full lg:pl-10 lg:border-l flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <p className="text-[10px] font-black text-gray-400 tracking-widest mb-1 uppercase">Total Bundle</p>
                        <p className="text-4xl font-black text-blue-900">₹{bundleTotal.toLocaleString()}</p>
                    </div>
                    <button onClick={handleAddBundle} className="w-full md:w-auto bg-blue-900 text-white px-8 py-4 rounded-xl font-black text-[10px] tracking-widest uppercase shadow-lg active:scale-95">
                        Add Bundle to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};
export default FrequentlyBoughtTogether;