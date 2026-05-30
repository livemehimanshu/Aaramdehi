import React, { useState, useEffect, useMemo } from 'react';
import { FiPlus } from 'react-icons/fi';
import { api } from '../../../src/utils/authUtils';
import { useCart } from '../../../src/hooks/useCart';
import toast from 'react-hot-toast';

const FrequentlyBoughtTogether = ({ mainProduct, mainProductPrice }) => {
    const [recommendations, setRecommendations] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addToCart, setIsCartOpen } = useCart();

    const PLACEHOLDER_IMAGE = "https://placehold.co/100x100?text=Product";

    useEffect(() => {
        const fetchRecs = async () => {
            try {
                setLoading(true);
                setError(null);
                const pId = mainProduct._id || mainProduct.id;
                const res = await api.get(`/order/recommendations/${pId}`);
                if (res.data.success) {
                    setRecommendations(res.data.data);
                    setSelectedItems(res.data.data.map(item => item._id || item.id));
                }
            } catch (err) {
                console.error("Recommendations fetch error:", err);
                setError("Could not load recommendations at this time.");
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
        try {
            // 1. Pehle current cart nikalein localStorage se (Single source of truth)
            let cart = JSON.parse(localStorage.getItem("cart")) || [];
            
            // 2. Main Product add karein
            const mainId = mainProduct._id || mainProduct.id;
            const isMainExist = cart.find(item => String(item.id) === String(mainId));
            
            if (isMainExist) {
                cart = cart.map(item => String(item.id) === String(mainId) ? { ...item, qty: item.qty + 1 } : item);
            } else {
                cart.push({ 
                    ...mainProduct, 
                    id: mainId, 
                    qty: 1, 
                    price: Number(mainProductPrice),
                    image: (mainProduct.images?.[0]?.url || mainProduct.images?.[0]) || mainProduct.thumbnail 
                });
            }

            // 3. Recommended Items add karein
            const selectedRecs = recommendations.filter(item => selectedItems.includes(item._id || item.id));
            selectedRecs.forEach(item => {
                const recId = item._id || item.id;
                const isRecExist = cart.find(cartItem => String(cartItem.id) === String(recId));
                if (isRecExist) {
                    cart = cart.map(cartItem => String(cartItem.id) === String(recId) ? { ...cartItem, qty: cartItem.qty + 1 } : cartItem);
                } else {
                    cart.push({ ...item, id: recId, qty: 1, price: Number(item.sellingPrice || item.price || 0), image: item.thumbnail || (item.images && item.images[0]?.url) });
                }
            });

            // 4. Save karein aur events fire karein taaki Sidebar update ho jaye
            localStorage.setItem("cart", JSON.stringify(cart));
            window.dispatchEvent(new Event("cartUpdated"));
            window.dispatchEvent(new Event("storage")); // Cross-tab sync ke liye
            
            // 5. Automatic Sidebar Open
            if (typeof setIsCartOpen === 'function') setIsCartOpen(true);

            toast.success("Combo bundle added to cart!");
        } catch (error) {
            console.error("Bundle Add Error:", error);
            toast.error("Failed to add bundle to cart");
        }
    };

    if (loading) return (
        <div className="mt-20 p-10 text-center bg-gray-50 rounded-[30px] border border-dashed border-gray-200 text-gray-400 font-bold animate-pulse uppercase tracking-widest">
            Finding perfect matches for you...
        </div>
    );

    if (error) return (
        <div className="mt-20 p-6 text-center text-rose-500 bg-rose-50 rounded-xl border border-rose-100 italic text-[10px] uppercase font-bold tracking-widest">
            {error}
        </div>
    );

    if (recommendations.length === 0) return null;

    return (
        <div className="mt-20">
            <h2 className="text-xl font-black uppercase tracking-tighter mb-6">Frequently Bought Together</h2>
            <div className="bg-white p-6 md:p-8 rounded-[30px] border border-gray-100 shadow-sm flex flex-col lg:flex-row items-center gap-10">
                <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
                    <img 
                        src={(mainProduct.images?.[0]?.url || mainProduct.images?.[0]) || mainProduct.thumbnail || PLACEHOLDER_IMAGE} 
                        className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 object-contain bg-gray-50 rounded-xl border-2 border-blue-900 p-1" 
                        alt="main" 
                    />
                    {recommendations.map(item => (
                        <React.Fragment key={item._id || item.id}>
                            <FiPlus className="text-gray-300" />
                            <img 
                                src={item.thumbnail || (item.images && item.images[0]?.url) || PLACEHOLDER_IMAGE} 
                                onClick={() => toggleItem(item._id || item.id)}
                                className={`w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 object-contain bg-gray-50 rounded-xl cursor-pointer transition-all ${selectedItems.includes(item._id || item.id) ? 'opacity-100 ring-2 ring-blue-900' : 'opacity-30 hover:opacity-50'}`} 
                                alt="recommended" 
                            />
                        </React.Fragment>
                    ))}
                </div>
                <div className="w-full lg:pl-10 lg:border-l border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                        <p className="text-[10px] md:text-xs font-black text-gray-400 tracking-widest mb-1 uppercase">Total Bundle Price</p>
                        <p className="text-3xl md:text-5xl font-black text-blue-900">₹{bundleTotal.toLocaleString()}</p>
                    </div>
                    <button onClick={handleAddBundle} className="w-full sm:w-auto bg-blue-900 text-white px-10 py-5 rounded-2xl font-black text-[10px] md:text-xs tracking-widest uppercase shadow-xl hover:shadow-blue-200 transition-all active:scale-95">
                        Add Bundle to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};
export default FrequentlyBoughtTogether;