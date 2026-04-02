import React, { useState, useEffect } from 'react';
import { IoCloseOutline, IoTrashOutline, IoAddOutline, IoRemoveOutline } from "react-icons/io5";

const CartDrawer = ({ isOpen, onClose }) => {
  // Demo Data - Asli project mein ye Redux ya Context se aayega
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Mens Cotton Casual Short Sleeve T-Shirts",
      price: 86.00,
      qty: 1,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200"
    }
  ]);

  const [shipping] = useState(7.00);

  // Function: Quantity badhane ke liye
  const updateQty = (id, delta) => {
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    ));
  };

  // Function: Item delete karne ke liye
  const removeItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const total = cartItems.length > 0 ? subtotal + shipping : 0;

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      />

      {/* Side Panel */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-[380px] bg-white z-[101] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 uppercase tracking-tight">Shopping Cart ({cartItems.length})</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <IoCloseOutline size={28} className="text-gray-500" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 border-b border-gray-50 pb-4 mb-4">
                <div className="w-20 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-[13px] font-semibold text-gray-700 leading-tight">{item.name}</h3>
                      <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500">
                        <IoTrashOutline size={18} />
                      </button>
                    </div>
                    <p className="text-orange-600 font-bold mt-1">${item.price.toFixed(2)}</p>
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-gray-200 rounded">
                      <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-gray-100"><IoRemoveOutline size={14} /></button>
                      <span className="px-3 text-sm font-bold">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-gray-100"><IoAddOutline size={14} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <p className="mt-2">Your cart is empty</p>
            </div>
          )}
        </div>

        {/* Bottom Section (Sticky) */}
        {cartItems.length > 0 && (
          <div className="p-5 bg-gray-50 border-t border-gray-100">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-gray-600 font-medium">
                <span>Subtotal:</span>
                <span className="text-gray-900 font-bold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 font-medium">
                <span>Shipping:</span>
                <span className="text-gray-900 font-bold">${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                <span className="text-base font-bold text-gray-800 uppercase">Total:</span>
                <span className="text-xl font-bold text-orange-600">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button className="w-full bg-orange-500 text-white py-3 rounded font-bold uppercase text-[12px] tracking-widest hover:bg-orange-600 shadow-lg shadow-orange-100 transition-all">
                Proceed to Checkout
              </button>
              <button onClick={onClose} className="w-full text-gray-500 py-2 text-[11px] uppercase font-bold hover:text-gray-800">
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;