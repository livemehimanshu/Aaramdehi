import React, { useState, useEffect } from 'react';
import { IoCloseOutline, IoTrashOutline, IoAddOutline, IoRemoveOutline } from "react-icons/io5";

// ===== CART DRAWER COMPONENT =====
// Yeh component right side se slide out hota hai jab cart icon click hote ho
// Ismein cart ke sabhi items dikhte hain, quantity change kar sakte ho, delete kar sakte ho

const CartDrawer = ({ isOpen, onClose }) => {
  // localStorage se cart items load karna
  const [cartItems, setCartItems] = useState([]); // Cart mein jo products hain
  const [shipping] = useState(50); // Shipping charges (fixed ₹50)

  // useEffect: Component load hone par localStorage ko sync karna
  useEffect(() => {
    // localStorage se cart data lana
    const loadCart = () => {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartItems(cart);
    };

    loadCart();

    // Jab kisi aur component se cart update ho toh yeh component bhi update ho
    window.addEventListener("cartUpdated", loadCart);

    // Cleanup: component unmount hone par listener remove karna
    return () => {
      window.removeEventListener("cartUpdated", loadCart);
    };
  }, []);

  // Function: Cart mein item ki quantity increase/decrease karna
  // id = product ki id, delta = kitna increase/decrease karna
  const updateQty = (id, delta) => {
    const updatedCart = cartItems.map(item => 
      item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    // Event trigger karo Header ko notify karne ke liye
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // Function: Cart se item completely remove karna
  const removeItem = (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    // Event trigger karo Header ko notify karne ke liye
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // Calculations: Subtotal aur Total
  const subtotal = cartItems.reduce((acc, item) => acc + ((item.price || item.newPrice || 0) * item.qty), 0);
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
                    <p className="text-orange-600 font-bold mt-1">₹{(item.price || item.newPrice || 0).toLocaleString()}</p>
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
                <span className="text-gray-900 font-bold">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 font-medium">
                <span>Shipping:</span>
                <span className="text-gray-900 font-bold">₹{shipping.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                <span className="text-base font-bold text-gray-800 uppercase">Total:</span>
                <span className="text-xl font-bold text-orange-600">₹{total.toLocaleString()}</span>
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