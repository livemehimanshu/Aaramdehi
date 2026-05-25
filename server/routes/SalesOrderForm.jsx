import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { IoStorefrontOutline, IoBagAddOutline, IoSaveOutline } from "react-icons/io5";

const SalesOrderForm = () => {
    const [shops, setShops] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedShop, setSelectedShop] = useState(null);
    const [cart, setCart] = useState([]);
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000";

    useEffect(() => {
        const fetchData = async () => {
            const shopRes = await axios.get(`${apiBase}/api/shops`);
            const prodRes = await axios.get(`${apiBase}/api/products`);
            setShops(shopRes.data.data);
            setProducts(prodRes.data.data);
        };
        fetchData();
    }, []);

    const handleShopChange = (e) => {
        const shop = shops.find(s => s._id === e.target.value);
        setSelectedShop(shop);
        setCart([]); // Clear cart when shop changes
    };

    const addToCart = (product) => {
        // ✅ SMART PRICING: Check if shop has a special rate, else use default sellingPrice
        const finalPrice = selectedShop?.specialRates?.[product._id] || product.sellingPrice;
        
        const existing = cart.find(item => item.productId === product._id);
        if (existing) {
            setCart(cart.map(item => item.productId === product._id ? { ...item, qty: item.qty + 1 } : item));
        } else {
            setCart([...cart, { productId: product._id, name: product.name, price: finalPrice, qty: 1 }]);
        }
    };

    const calculateTotal = () => cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

    const handleSubmitOrder = async () => {
        if (!selectedShop || cart.length === 0) return toast.error("Please select shop and items");

        try {
            const payload = {
                shopId: selectedShop._id,
                orderItems: cart,
                totalAmount: calculateTotal(),
                paymentMethod: 'credit', // Default for Khata system
            };
            const token = localStorage.getItem('accessToken');
            await axios.post(`${apiBase}/api/order/create`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Order Placed on Credit (Khata)!");
            setCart([]);
        } catch (error) {
            toast.error("Order failed");
        }
    };

    return (
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                <IoBagAddOutline className="text-red-500" /> Sales Order Form
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Shop & Product Selection */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Select Target Shop</label>
                        <select onChange={handleShopChange} className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-red-500 outline-none">
                            <option value="">-- Choose Shop --</option>
                            {shops.map(shop => <option key={shop._id} value={shop._id}>{shop.name} ({shop.owner})</option>)}
                        </select>
                    </div>

                    {selectedShop && (
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <h3 className="font-bold text-gray-800 mb-4">Available Products</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {products.map(prod => {
                                    const rate = selectedShop.specialRates?.[prod._id] || prod.sellingPrice;
                                    return (
                                        <div key={prod._id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                                            <span className="text-sm font-medium">{prod.name}</span>
                                            <div className="flex items-center gap-4">
                                                <span className="font-black text-red-600">₹{rate}</span>
                                                <button onClick={() => addToCart(prod)} className="bg-gray-900 text-white p-1 rounded-md hover:bg-red-600 transition">
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Order Summary */}
                <div className="border-l pl-8 border-gray-100">
                    <h3 className="font-bold text-lg mb-4">Current Order</h3>
                    {cart.length === 0 ? (
                        <p className="text-gray-400 italic">No items added yet...</p>
                    ) : (
                        <div className="space-y-3">
                            {cart.map(item => (
                                <div key={item.productId} className="flex justify-between items-center text-sm border-b pb-2">
                                    <span>{item.name} x {item.qty}</span>
                                    <span className="font-bold">₹{item.price * item.qty}</span>
                                </div>
                            ))}
                            <div className="flex justify-between items-center pt-4 text-xl font-black text-gray-900">
                                <span>Total Amount</span>
                                <span>₹{calculateTotal()}</span>
                            </div>
                            <button 
                                onClick={handleSubmitOrder}
                                className="w-full mt-6 bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 flex items-center justify-center gap-2"
                            >
                                <IoSaveOutline size={20} /> Save Order to Khata
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SalesOrderForm;