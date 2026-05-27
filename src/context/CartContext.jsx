import React, { createContext, useEffect, useState, useContext } from 'react'

export const CartContext = createContext(null)

// ✅ Custom Hook banayein taaki components use kar sakein
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart')) || [] } catch { return [] }
  })
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wishlist')) || [] } catch { return [] }
  })

  useEffect(() => {
    try { localStorage.setItem('cart', JSON.stringify(cart)) } catch {}
  }, [cart])
  useEffect(() => {
    try { localStorage.setItem('wishlist', JSON.stringify(wishlist)) } catch {}
  }, [wishlist])

  const addToCart = (product) => {
    setCart(prev => {
      const idx = prev.findIndex(p => p.id === product.id)
      if (idx !== -1) {
        const copy = [...prev]
        copy[idx] = { ...copy[idx], quantity: (copy[idx].quantity || 1) + (product.quantity || 1) }
        return copy
      }
      return [...prev, { ...product, quantity: product.quantity || 1 }]
    })
  }
  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => 
      (item._id || item.id) === id ? { ...item, quantity: Math.max(1, (item.quantity || 1) + delta) } : item
    ))
  }
  const removeFromCart = (id) => setCart(prev => prev.filter(p => p.id !== id))

  const addToWishlist = (product) => setWishlist(prev => prev.find(p => p.id === product.id) ? prev : [...prev, product])
  const removeFromWishlist = (id) => setWishlist(prev => prev.filter(p => p.id !== id))
  const isInWishlist = (id) => wishlist.some(p => p.id === id)

  const cartCount = cart.reduce((s, p) => s + (p.quantity || 1), 0)
  const wishlistCount = wishlist.length

  return (
    <CartContext.Provider value={{ cart, wishlist, addToCart, removeFromCart, updateQty, addToWishlist, removeFromWishlist, isInWishlist, cartCount, wishlistCount }}>
      {children}
    </CartContext.Provider>
  )
}
