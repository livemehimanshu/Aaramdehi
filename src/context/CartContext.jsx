import React, { createContext, useEffect, useState, useContext } from 'react';
import { saveAbandonedCartAPI } from '../api/authAndAdminApi';

export const CartContext = createContext(null);

// ✅ Custom Hook
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

export const CartProvider = ({ children }) => {
  const getCartItemKey = (product) => {
    const productId = String(product._id || product.id || '');
    const size = String(product.selectedSize || product.size?.label || product.size?.name || product.size || '');
    const color = typeof product.color === 'object'
      ? String(product.color.label || product.color.name || product.color.value || '')
      : String(product.color || '');
    return `${productId}::${size}::${color}`;
  };

  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart')) || []; } catch { return []; }
  });

  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wishlist')) || []; } catch { return []; }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync state to LocalStorage
  useEffect(() => {
    try { localStorage.setItem('cart', JSON.stringify(cart)); } catch {}
    if (!cart.length) return undefined;

    let email = localStorage.getItem('userEmail') || '';
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      email = userData.email || email;
    } catch {}
    if (!email) return undefined;

    const timer = window.setTimeout(() => {
      saveAbandonedCartAPI(email, cart).catch(() => {});
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [cart]);

  useEffect(() => {
    try { localStorage.setItem('wishlist', JSON.stringify(wishlist)); } catch {}
  }, [wishlist]);

  // Sync state with external tabs/events
  useEffect(() => {
    const syncCart = () => {
      try { setCart(JSON.parse(localStorage.getItem('cart')) || []); } catch {}
    };
    window.addEventListener('cartUpdated', syncCart);
    window.addEventListener('storage', syncCart);
    return () => {
      window.removeEventListener('cartUpdated', syncCart);
      window.removeEventListener('storage', syncCart);
    };
  }, []);

  // ✅ 1. ADD TO CART (Fixes ID mismatch & ensures standard product structure)
  const addToCart = (product) => {
    const targetId = String(product._id || product.id || Date.now());

    const normalizedProduct = {
      ...product,
      id: targetId,
      _id: targetId,
      name: product.name || product.title || 'Product',
      price: Number(product.sellingPrice || product.price || product.mrp || 0),
      sellingPrice: Number(product.sellingPrice || product.price || product.mrp || 0),
      quantity: product.quantity || 1,
      image: product.image || product.thumbnail || (product.images && product.images[0]?.url) || ''
    };
    normalizedProduct.cartKey = getCartItemKey(normalizedProduct);

    setCart(prev => {
      const idx = prev.findIndex(p => (p.cartKey || getCartItemKey(p)) === normalizedProduct.cartKey);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = { 
          ...copy[idx], 
          quantity: (copy[idx].quantity || 1) + (normalizedProduct.quantity || 1) 
        };
        return copy;
      }
      return [...prev, normalizedProduct];
    });
  };

  // ✅ 2. UPDATE QUANTITY (Fixes string/number ID comparison)
  const updateQty = (id, delta) => {
    const targetKey = typeof id === 'object' ? (id.cartKey || getCartItemKey(id)) : String(id);
    setCart(prev => prev.map(item => 
      (typeof id === 'object' ? (item.cartKey || getCartItemKey(item)) === targetKey : String(item._id || item.id) === targetKey)
        ? { ...item, quantity: Math.max(1, (item.quantity || 1) + delta) } 
        : item
    ));
  };

  // ✅ 3. REMOVE FROM CART (Fixes ID mismatch bug)
  const removeFromCart = (id) => {
    const targetKey = typeof id === 'object' ? (id.cartKey || getCartItemKey(id)) : String(id);
    setCart(prev => prev.filter(p => typeof id === 'object'
      ? (p.cartKey || getCartItemKey(p)) !== targetKey
      : String(p._id || p.id) !== targetKey));
  };

  // ✅ 4. WISHLIST FUNCTIONS
  const addToWishlist = (product) => {
    const targetId = String(product._id || product.id);
    setWishlist(prev => prev.find(p => String(p._id || p.id) === targetId) ? prev : [...prev, product]);
  };

  const removeFromWishlist = (id) => {
    const targetId = String(id);
    setWishlist(prev => prev.filter(p => String(p._id || p.id) !== targetId));
  };

  const isInWishlist = (id) => {
    const targetId = String(id);
    return wishlist.some(p => String(p._id || p.id) === targetId);
  };

  // Counts calculation
  const cartCount = cart.reduce((s, p) => s + (p.quantity || 1), 0);
  const wishlistCount = wishlist.length;

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        wishlist, 
        addToCart, 
        removeFromCart, 
        updateQty, 
        addToWishlist, 
        removeFromWishlist, 
        isInWishlist, 
        cartCount, 
        wishlistCount, 
        isCartOpen, 
        setIsCartOpen 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};