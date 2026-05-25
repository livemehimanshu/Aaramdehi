import React, { useMemo } from 'react';
import { IoCloseOutline, IoTrashOutline, IoAddOutline, IoRemoveOutline, IoCartOutline } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../src/hooks/useCart'; // ✅ Path updated to your hook

// ===== CART DRAWER COMPONENT =====
const CartDrawer = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    
    // ✅ Direct Context Access (Single Source of Truth)
    const { 
        cart, 
        removeFromCart, 
        updateCartQuantity, 
        cartCount 
    } = useCart();

    // ✅ Lightning Fast Calculations
    const subtotal = useMemo(() => {
        return cart.reduce((total, item) => total + ((item.price || 0) * (item.qty || 1)), 0);
    }, [cart]);

    const handleCheckout = () => {
        onClose();
        navigate('/checkout');
    };

  return (
    <>
            {/* 1. Backdrop Overlay (Premium Blur Effect) */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            {/* 2. Side Panel (Elite UI Design) */}
            <div className={`fixed top-0 right-0 h-full w-full max-w-[400px] bg-white z-[101] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white sticky top-0">
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight text-gray-800">Shopping Cart</h2>
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">{cartCount} Items</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-800">
            <IoCloseOutline size={26} />
          </button>
        </div>

        {/* Items List (No Scrollbar Design) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">
            {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
                        <IoCartOutline size={48} className="text-gray-200" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-gray-800 font-bold uppercase text-sm">Your cart is empty</p>
                        <p className="text-gray-400 text-xs">Aaramdehi quality comfort awaits you!</p>
                    </div>
                    <button onClick={onClose} className="bg-gray-950 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-600 transition-all active:scale-95">
                        Start Shopping
                    </button>
                </div>
            ) : (
                cart.map((item) => (
                    <div key={item._id || item.id} className="flex gap-4 p-4 bg-gray-50 rounded-[24px] border border-gray-100 group hover:border-orange-100 hover:bg-orange-50/20 transition-all shadow-sm">
                        <div className="w-20 h-20 bg-white rounded-2xl overflow-hidden flex-shrink-0 p-2 shadow-sm border border-gray-50">
                            <img 
                                src={item.image || item.thumbnail || (item.images && item.images[0]?.url)} 
                                alt={item.name} 
                                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" 
                            />
                        </div>
                        
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start gap-2">
                                    <h3 className="text-sm font-bold text-gray-800 truncate group-hover:text-orange-600 transition-colors">{item.name}</h3>
                                    <button onClick={() => removeFromCart(item._id || item.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                                        <IoTrashOutline size={18} />
                                    </button>
                                </div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{item.brand || 'Aaramdehi Luxe'}</p>
                            </div>

                            <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-2 py-1.5 shadow-sm">
                                    <button onClick={() => updateCartQuantity(item._id || item.id, Math.max(1, (item.qty || 1) - 1))} className="text-gray-400 hover:text-orange-500"><IoRemoveOutline size={16} /></button>
                                    <span className="text-xs font-black text-gray-800 w-5 text-center">{item.qty || 1}</span>
                                    <button onClick={() => updateCartQuantity(item._id || item.id, (item.qty || 1) + 1)} className="text-gray-400 hover:text-orange-500"><IoAddOutline size={16} /></button>
                                </div>
                                <p className="text-xs font-black text-gray-900">₹{((item.price || 0) * (item.qty || 1)).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>

        {/* Bottom Summary Section (Sticky) */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-white space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
            <div className="space-y-2 mb-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Estimated Subtotal</span>
                <span className="text-2xl font-black text-gray-900 tracking-tighter">₹{subtotal.toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-emerald-600 font-bold uppercase text-center bg-emerald-50 py-1.5 rounded-lg">
                 ✨ Free Delivery Eligible
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleCheckout}
                className="w-full bg-gray-950 text-white font-black py-4 rounded-[20px] uppercase text-xs tracking-[2px] shadow-xl shadow-gray-950/20 active:scale-95 transition-all hover:bg-orange-600"
              >
                Checkout Now
              </button>
              <button onClick={onClose} className="w-full text-gray-400 font-bold uppercase text-[10px] tracking-widest hover:text-gray-800 transition-colors">
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </>
  );
};

export default CartDrawer;