import React, { useState, useEffect } from 'react';
import { IoClose, IoHeartOutline, IoSyncOutline, IoStar, IoStarOutline } from "react-icons/io5";

const QuickViewModal = ({ product, isOpen, onClose }) => {
    const [quantity, setQuantity] = useState(1);

    // जब भी नया प्रोडक्ट खुले, क्वांटिटी 1 पर रीसेट हो जाए
    useEffect(() => {
        if (isOpen) setQuantity(1);
    }, [isOpen, product]);

    if (!isOpen || !product) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 transition-all duration-300">
            <div className="bg-white w-full max-w-5xl rounded-sm shadow-2xl relative flex flex-col md:flex-row overflow-hidden max-h-[90vh] animate-in fade-in zoom-in duration-300">
                
                {/* Close Button */}
                <button 
                    onClick={onClose} 
                    className="absolute right-4 top-4 text-2xl text-gray-400 hover:text-red-500 z-50 bg-gray-100 rounded-full p-1 transition-all"
                >
                    <IoClose />
                </button>

                {/* Left: Product Image */}
                <div className="md:w-1/2 p-8 bg-[#fcfcfc] flex items-center justify-center border-r">
                    <img 
                        src={product.image} 
                        alt={product.name} 
                        className="max-h-[380px] object-contain mix-blend-multiply transition-transform hover:scale-105 duration-500" 
                    />
                </div>

                {/* Right: Product Details */}
                <div className="md:w-1/2 p-10 overflow-y-auto">
                    <h1 className="text-2xl font-black text-gray-900 leading-tight mb-2 uppercase tracking-tighter">
                        {product.name}
                    </h1>
                    
                    <div className="flex items-center gap-4 mb-5 border-b pb-4">
                        <div className="flex text-yellow-400 text-sm">
                            {[...Array(5)].map((_, i) => (
                                i < Math.floor(product.rating || 4) ? <IoStar key={i} /> : <IoStarOutline key={i} />
                            ))}
                        </div>
                        <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">
                            (1 Customer Review)
                        </span>
                    </div>

                    <div className="space-y-1 mb-6">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Brand: <span className="text-gray-900 ml-2 font-black">{product.brand || "Aaramdehi"}</span>
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Stock: <span className="text-green-600 ml-2 font-black">{product.stock || "In Stock"}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-4xl font-black text-red-500">₹{product.newPrice || product.price}</span>
                        <span className="text-xl text-gray-200 line-through font-bold">₹{product.oldPrice}</span>
                    </div>

                    <p className="text-sm text-gray-500 leading-relaxed mb-8">
                        {product.description || "Premium home furnishing products by Aaramdehi for ultimate comfort."}
                    </p>

                    {/* Quantity & Add to Cart */}
                    <div className="flex gap-4 mb-8">
                        <div className="flex items-center border border-gray-200 h-14 rounded-sm bg-white overflow-hidden">
                            <button 
                                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                                className="px-5 h-full hover:bg-gray-50 font-black transition-all text-gray-400 border-r"
                            >
                                －
                            </button>
                            <span className="w-12 text-center font-black text-sm text-gray-800 select-none">
                                {quantity}
                            </span>
                            <button 
                                onClick={() => setQuantity(quantity + 1)}
                                className="px-5 h-full hover:bg-gray-50 font-black transition-all text-gray-400 border-l"
                            >
                                ＋
                            </button>
                        </div>
                        
                        <button className="flex-1 bg-red-500 text-white h-14 px-8 font-black uppercase text-xs tracking-[2px] hover:bg-black transition-all shadow-xl shadow-red-500/20 active:translate-y-1">
                            Add to Cart
                        </button>
                    </div>

                    {/* Meta Info */}
                    <div className="flex gap-8 border-t pt-6">
                        <button className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 hover:text-red-500 transition-all tracking-widest uppercase">
                            <IoHeartOutline size={16}/> Wishlist
                        </button>
                        <button className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 hover:text-red-500 transition-all tracking-widest uppercase">
                            <IoSyncOutline size={16}/> Compare
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickViewModal;