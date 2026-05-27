import React, { useState, useEffect } from 'react';
import { Store, User, Phone, MapPin, Search, Loader2, Plus, AlertCircle, X, RefreshCw, Trash2, Edit, DownloadCloud } from 'lucide-react';
import api from '@/utils/authUtils'; // ✅ Use the centralized Axios instance
import { generateShopLedgerPDF } from './generateShopLedgerPDF'; // ✅ New utility

export default function ShopsPage() {
    const [shops, setShops] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showProducts, setShowProducts] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [showOrderHistoryModal, setShowOrderHistoryModal] = useState(false);
    const [selectedShop, setSelectedShop] = useState(null);
    const [shopOrders, setShopOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        owner: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
    });
    const [paymentData, setPaymentData] = useState({
        amount: '',
        type: 'credit',
    });
    const [orderData, setOrderData] = useState({
        productId: '',
        quantity: 1,
        price: '',
    });
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const fetchShops = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(`/shops`, { // ✅ Use authUtils.api
                // Headers are automatically handled
            });
            if (response.data.success) {
                setShops(response.data.data || []);
            }
        } catch (err) {
            console.error("Failed to load shops:", err);
            setError(err.response?.data?.message || `Network Error: ${err.message}. Please check if the Node.js backend is running.`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShops();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddShop = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            
            const response = await api.post(`/shops`, formData, { // ✅ Use authUtils.api
                // Headers are automatically handled
            });

            if (response.data.success) {
                setShops([...shops, response.data.data]);
                setFormData({
                    name: '',
                    owner: '',
                    phone: '',
                    address: '',
                    city: '',
                    state: '',
                    pincode: '',
                });
                setShowAddModal(false);
                alert('Shop added successfully!');
            }
        } catch (error) {
            console.error("Failed to add shop:", error);
            alert('Error adding shop: ' + (error.response?.data?.message || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteShop = async (id) => {
        if (!window.confirm("Are you sure you want to delete this shop? This will remove all balance history for this partner.")) return;
        try {
            const response = await api.delete(`/shops/${id}`);
            if (response.data.success) {
                setShops(shops.filter(s => s._id !== id));
                alert('Shop deleted successfully');
            }
        } catch (error) {
            console.error("Failed to delete shop:", error);
            alert('Error deleting shop: ' + (error.response?.data?.message || error.message));
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await api.get(`/products`, { // ✅ Use authUtils.api
                // Headers are automatically handled
            });
            if (response.data.success) {
                setProducts(response.data.data || []);
            }
        } catch (error) {
            console.error("Failed to load products:", error);
        }
    };

    const fetchShopOrders = async (shopId) => {
        try {
            setLoadingOrders(true);
            const response = await api.get(`/order/shop/${shopId}`, { // ✅ Use authUtils.api
                // Headers are automatically handled
            });
            if (response.data.success) {
                setShopOrders(response.data.data || []);
            }
        } catch (error) {
            console.error("Failed to load shop orders:", error);
            setShopOrders([]);
        } finally {
            setLoadingOrders(false);
        }
    };

    const handleOpenPayments = (shop) => {
        setSelectedShop(shop);
        setShowPaymentModal(true);
    };

    const handleOpenOrder = (shop) => {
        setSelectedShop(shop);
        fetchProducts();
        setShowOrderModal(true);
    };

    const handleOpenEdit = (shop) => {
        setSelectedShop(shop);
        setFormData({
            name: shop.name,
            owner: shop.owner,
            phone: shop.phone || shop.mobile || '',
            address: shop.address,
            city: shop.city,
            state: shop.state,
            pincode: shop.pincode,
        });
        setShowEditModal(true);
    };

    const handleOpenOrderHistory = (shop) => {
        setSelectedShop(shop);
        fetchShopOrders(shop._id);
        setShowOrderHistoryModal(true);
    };

    const handleUpdateShop = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const response = await api.put(`/shops/${selectedShop._id}`, formData);
            if (response.data.success) {
                setShops(shops.map(s => s._id === selectedShop._id ? response.data.data : s));
                setShowEditModal(false);
                alert('Shop updated successfully!');
            }
        } catch (error) {
            alert('Error updating shop: ' + (error.response?.data?.message || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!paymentData.amount) {
                alert('Please enter amount');
                return;
            }
            setSubmitting(true);
            
            const response = await api.put(`/shops/${selectedShop._id}/balance`, paymentData, { // ✅ Use authUtils.api
                // Headers are automatically handled
            });

            if (response.data.success) {
                setShops(shops.map(s => s._id === selectedShop._id ? response.data.data : s));
                setPaymentData({ amount: '', type: 'credit' });
                setShowPaymentModal(false);
                alert('Balance updated successfully!');
            }
        } catch (error) {
            console.error("Failed to update balance:", error);
            alert('Error updating balance: ' + (error.response?.data?.message || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleOrderChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'productId') {
            // When product is selected, auto-populate the price
            const selectedProduct = products.find(p => p._id === value);
            const price = selectedProduct ? (selectedProduct.sellingPrice || selectedProduct.mrp || 0) : '';
            setOrderData(prev => ({
                ...prev,
                [name]: value,
                price: price
            }));
        } else {
            setOrderData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleAddProductToOrder = () => {
        if (!orderData.productId || !orderData.quantity || !orderData.price) {
            alert('Please select product, quantity, and price');
            return;
        }

        const selectedProduct = products.find(p => p._id === orderData.productId);
        const price = parseFloat(orderData.price) || 0;
        const quantity = parseInt(orderData.quantity);

        // Check if product already exists in selected list
        const existingIndex = selectedProducts.findIndex(p => p.productId === orderData.productId);
        
        if (existingIndex >= 0) {
            // Update quantity and recalculate total if product already exists
            const updated = [...selectedProducts];
            updated[existingIndex].quantity += quantity;
            updated[existingIndex].totalPrice = updated[existingIndex].price * updated[existingIndex].quantity;
            setSelectedProducts(updated);
        } else {
            // Add new product
            setSelectedProducts([...selectedProducts, {
                productId: orderData.productId,
                name: selectedProduct?.name,
                quantity: quantity,
                price: price,
                image: selectedProduct?.thumbnail || (selectedProduct?.images?.[0]?.url),
                totalPrice: price * quantity
            }]);
        }

        // Clear form
        setOrderData({ productId: '', quantity: 1, price: '' });
    };

    const handleRemoveProductFromOrder = (productId) => {
        setSelectedProducts(selectedProducts.filter(p => p.productId !== productId));
    };

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        try {
            if (selectedProducts.length === 0) {
                alert('Please add at least one product to order');
                return;
            }

            // FEATURE 4: Credit Limit Guard (₹50,000)
            const subtotal = selectedProducts.reduce((sum, p) => sum + p.totalPrice, 0);
            if ((selectedShop.outstandingBalance + subtotal) > 50000) {
                alert(`ORDER BLOCKED: This shop has exceeded its credit limit of ₹50,000. Current Balance: ₹${selectedShop.outstandingBalance}`);
                return;
            }

            setSubmitting(true);
            
            const response = await api.post(`/order/create`, { // ✅ Use authUtils.api
                orderItems: selectedProducts.map(p => ({
                    productId: p.productId,
                    name: p.name,
                    quantity: p.quantity,
                    price: p.price,
                    image: p.image
                })),
                shippingAddress: {
                    fullName: selectedShop.owner,
                    address: selectedShop.address,
                    city: selectedShop.city,
                    postalCode: selectedShop.pincode,
                    mobile: selectedShop.phone,
                    detail: `${selectedShop.address}, ${selectedShop.city}, ${selectedShop.state}`
                },
                paymentMethod: 'Shop Credit',
                totalAmount: subtotal,
                shopId: selectedShop._id,
            }, {}); // ✅ Headers automatically handled

            if (response.data.success) {
                setSelectedProducts([]);
                setShowOrderModal(false);
                const orderNum = response.data.data.orderNumber || 'New Order';
                alert(`Order created successfully! Order #${orderNum}`);
                
                // ✅ Trigger Automatic WhatsApp Notification
                sendWhatsAppOrderConfirmation(selectedShop, response.data.data, subtotal);

                // Refresh shops list
                fetchShops();
            }
        } catch (error) {
            console.error("Failed to create order:", error.response?.data || error);
            alert('Error creating order: ' + (error.response?.data?.message || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    const sendWhatsAppReminder = (shop) => {
        // केवल नंबर्स निकालें और सुनिश्चित करें कि फोन नंबर मौजूद है
        let phone = (shop.mobile || shop.phone || "").replace(/\D/g, ''); 
        if (!phone) return alert("Mobile number not found for this shop!");

        // भारत के लिए 91 प्रीफिक्स हैंडल करें (अगर 10 डिजिट है तो 91 जोड़ें)
        if (phone.length === 10) phone = '91' + phone;
        else if (phone.length === 12 && phone.startsWith('91')) phone = phone;

        // Balance ko safely handle karein taaki crash na ho
        const balance = Number(shop.outstandingBalance || 0).toLocaleString('en-IN');
        
        // शुद्ध पेमेंट रिमाइंडर मैसेज (बिना रेफरल कोड के)
        const message = `*PAYMENT REMINDER* 📢\n\nHello ${shop.owner},\nThis is a payment reminder from *Aaramdehi*. Your current outstanding balance is *₹${balance}*.\n\nPlease clear the dues at the earliest to continue your credit limit and process upcoming orders.\n\nThank you for your business!`;
        
        const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const sendWhatsAppOrderConfirmation = (shop, order, total) => {
        let phone = (shop.mobile || shop.phone || "").replace(/\D/g, ''); 
        if (!phone) return;

        if (phone.length === 10) phone = '91' + phone;
        else if (phone.length === 12 && phone.startsWith('91')) phone = phone;

        const orderNum = order.orderNumber || order._id?.slice(-6);
        const newBalance = Number((shop.outstandingBalance || 0) + total).toLocaleString('en-IN');
        
        const message = `*ORDER PLACED* ✅\n\nHello ${shop.owner},\nYour order *#${orderNum}* has been successfully created.\n\n*Order Details:*\nTotal Amount: ₹${Number(total).toLocaleString('en-IN')}\nNew Outstanding Balance: ₹${newBalance}\n\nThank you for your business!`;
        
        const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const filteredShops = shops.filter(shop => 
        shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.owner.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-950 gap-4">
                <Loader2 className="animate-spin text-emerald-500" size={40} />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Syncing Shops...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-rose-500 flex flex-col items-center gap-4 bg-gray-950 min-h-screen justify-center">
                <AlertCircle size={48} />
                <p className="font-bold text-lg">{error}</p>
                <button onClick={fetchShops} className="bg-gray-800 px-6 py-2 rounded-xl text-white font-bold hover:bg-gray-700 transition-all flex items-center gap-2">
                    <RefreshCw size={16} /> Retry Connection
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-gray-950 min-h-screen text-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                        <Store className="text-emerald-500" /> Khata Book (Shops)
                    </h1>
                    <p className="text-slate-500 text-xs font-bold uppercase mt-1">Manage partner shops and balances</p>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-black transition-all"
                >
                    <Plus size={20} /> Add New Shop
                </button>
            </div>

            <div className="mb-6 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                    type="text" 
                    placeholder="Search shops or owners..."
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-emerald-500 transition-all text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredShops.map((shop) => (
                    <div key={shop._id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all shadow-xl group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex gap-2">
                                <div className="p-3 bg-emerald-500/10 rounded-xl">
                                    <Store className="text-emerald-500" size={24} />
                                </div>
                                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleOpenEdit(shop)}
                                        className="p-1.5 bg-blue-500/10 rounded-lg text-blue-500 hover:bg-blue-500 hover:text-white transition-all"
                                    >
                                        <Edit size={14} />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteShop(shop._id)}
                                        className="p-1.5 bg-rose-500/10 rounded-lg text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-gray-500 uppercase">Balance</p>
                                <p className={`text-xl font-black ${shop.outstandingBalance > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    ₹{Number(shop.outstandingBalance || 0).toLocaleString('en-IN')}
                                </p>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{shop.name}</h3>
                        
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <User size={14} className="text-gray-600" />
                                <span>{shop.owner}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Phone size={14} className="text-gray-600" />
                                <span>{shop.mobile || shop.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <MapPin size={14} className="text-gray-600" />
                                <span className="truncate">{shop.address}</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-800 flex gap-3">
                            <button 
                                onClick={() => handleOpenOrderHistory(shop)}
                                className="flex-1 bg-purple-600/10 text-purple-400 hover:bg-purple-600 hover:text-white py-2 rounded-lg text-xs font-bold transition-all"
                            >
                                Orders
                            </button>
                            <button 
                                onClick={() => handleOpenOrder(shop)}
                                className="flex-1 bg-gray-800 hover:bg-gray-700 py-2 rounded-lg text-xs font-bold transition-all"
                            >
                                Rates
                            </button>
                            <button 
                                onClick={() => sendWhatsAppReminder(shop)}
                                className="flex-1 bg-green-600/10 text-green-500 hover:bg-green-600 hover:text-white py-2 rounded-lg text-xs font-bold transition-all"
                            >
                                Reminder
                            </button>
                            <button 
                                onClick={() => handleOpenPayments(shop)}
                                className="flex-1 bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600 hover:text-white py-2 rounded-lg text-xs font-bold transition-all"
                            >
                                Payments
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            {filteredShops.length === 0 && (
                <div className="p-20 text-center text-gray-600 font-bold uppercase tracking-widest text-xs bg-gray-900 rounded-2xl border border-dashed border-gray-800">
                    No shops found
                </div>
            )}

            {/* Products Section */}
            <div className="mt-12 pt-8 border-t border-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-white">Products Inventory</h2>
                    <button 
                        onClick={() => {
                            setShowProducts(!showProducts);
                            if (!showProducts) fetchProducts();
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-all text-sm"
                    >
                        {showProducts ? 'Hide Products' : 'Show Products'}
                    </button>
                </div>

                {showProducts && (
                    <div className="overflow-x-auto bg-gray-900 border border-gray-800 rounded-xl">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-800">
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-400">Image</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-400">Product Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-400">Size</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-400">Price</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-400">Category</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length > 0 ? (
                                    products.map((product) => (
                                        <tr key={product._id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-all">
                                            <td className="px-6 py-4">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-800">
                                                    <img 
                                                        src={product.thumbnail || (product.images && product.images[0]?.url) || 'https://placehold.co/48x48?text=📦'} 
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-white">{product.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-400">
                                                {product.sizes && product.sizes.length > 0 
                                                    ? product.sizes.map(s => typeof s === 'string' ? s : s.size).join(', ')
                                                    : 'N/A'
                                                }
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-emerald-400">
                                                ₹{Number(product.sellingPrice || product.mrp || 0).toLocaleString('en-IN')}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400">
                                                {product.category || 'Uncategorized'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500 font-bold">
                                            No products found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Shop Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gray-900 p-6 border-b border-gray-800 flex justify-between items-center">
                            <h2 className="text-2xl font-black text-white">Add New Shop</h2>
                            <button 
                                onClick={() => setShowAddModal(false)}
                                className="p-2 hover:bg-gray-800 rounded-lg transition-all"
                            >
                                <X size={24} className="text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleAddShop} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Shop Name *</label>
                                <input 
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                                    placeholder="Enter shop name"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Owner Name *</label>
                                <input 
                                    type="text"
                                    name="owner"
                                    value={formData.owner}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                                    placeholder="Enter owner name"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Phone</label>
                                <input 
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                                    placeholder="Enter phone number"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Address</label>
                                <input 
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                                    placeholder="Enter address"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">City</label>
                                    <input 
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-emerald-500 transition-all text-sm"
                                        placeholder="City"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">State</label>
                                    <input 
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-emerald-500 transition-all text-sm"
                                        placeholder="State"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Pincode</label>
                                    <input 
                                        type="text"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-emerald-500 transition-all text-sm"
                                        placeholder="Pincode"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg font-bold transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white py-2 rounded-lg font-bold transition-all"
                                >
                                    {submitting ? 'Adding...' : 'Add Shop'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Shop Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                            <h2 className="text-2xl font-black text-white">Edit Shop Details</h2>
                            <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-800 rounded-lg transition-all"><X size={24} className="text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleUpdateShop} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Shop Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:border-emerald-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Owner Name</label>
                                <input type="text" name="owner" value={formData.owner} onChange={handleInputChange} required className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:border-emerald-500 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Phone</label>
                                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:border-emerald-500 outline-none text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Pincode</label>
                                    <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:border-emerald-500 outline-none text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Address</label>
                                <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:border-emerald-500 outline-none" />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 bg-gray-800 text-white py-2 rounded-lg font-bold">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-bold">{submitting ? 'Updating...' : 'Save Changes'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && selectedShop && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                            <h2 className="text-2xl font-black text-white">Update Balance</h2>
                            <button 
                                onClick={() => setShowPaymentModal(false)}
                                className="p-2 hover:bg-gray-800 rounded-lg transition-all"
                            >
                                <X size={24} className="text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
                                <p className="text-xs text-blue-400 uppercase font-bold mb-1">Shop</p>
                                <p className="text-lg font-bold text-white">{selectedShop.name}</p>
                                <p className="text-sm text-gray-400">Owner: {selectedShop.owner}</p>
                                <p className="text-sm font-bold mt-2">Current Balance: <span className={selectedShop.outstandingBalance > 0 ? 'text-rose-400' : 'text-emerald-400'}>₹{Number(selectedShop.outstandingBalance || 0).toLocaleString('en-IN')}</span></p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Amount *</label>
                                <input 
                                    type="number"
                                    step="0.01"
                                    value={paymentData.amount}
                                    onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                                    required
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                                    placeholder="Enter amount"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Type *</label>
                                <select 
                                    value={paymentData.type}
                                    onChange={(e) => setPaymentData(prev => ({ ...prev, type: e.target.value }))}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                                >
                                    <option value="credit">Credit (Payment Received)</option>
                                    <option value="debit">Debit (Amount Due)</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg font-bold transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white py-2 rounded-lg font-bold transition-all"
                                >
                                    {submitting ? 'Updating...' : 'Update Balance'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Order Modal */}
            {showOrderModal && selectedShop && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gray-900 p-6 border-b border-gray-800 flex justify-between items-center">
                            <h2 className="text-2xl font-black text-white">Create Order</h2>
                            <button 
                                onClick={() => {
                                    setShowOrderModal(false);
                                    setSelectedProducts([]);
                                    setOrderData({ productId: '', quantity: 1 });
                                }}
                                className="p-2 hover:bg-gray-800 rounded-lg transition-all"
                            >
                                <X size={24} className="text-gray-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Shop Info */}
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                                <p className="text-xs text-blue-400 uppercase font-bold mb-1">Shop</p>
                                <p className="text-lg font-bold text-white">{selectedShop.name}</p>
                                <p className="text-sm text-gray-400">Owner: {selectedShop.owner}</p>
                            </div>

                            {/* Add Product Form */}
                            <div className="space-y-4 bg-gray-800/30 p-4 rounded-lg border border-gray-800">
                                <p className="text-xs font-bold text-gray-300 uppercase">Add Products to Order</p>
                                
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Product *</label>
                                    <select 
                                        name="productId"
                                        value={orderData.productId}
                                        onChange={handleOrderChange}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                                    >
                                        <option value="">Select Product</option>
                                        {products.map(product => (
                                            <option key={product._id} value={product._id}>
                                                {product.name} - ₹{Number(product.sellingPrice || product.mrp).toLocaleString('en-IN')}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Quantity *</label>
                                    <input 
                                        type="number"
                                        name="quantity"
                                        min="1"
                                        value={orderData.quantity}
                                        onChange={handleOrderChange}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                                        placeholder="1"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Price (₹) *</label>
                                    <input 
                                        type="number"
                                        name="price"
                                        step="0.01"
                                        min="0"
                                        value={orderData.price}
                                        onChange={handleOrderChange}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                                        placeholder="Enter price per unit"
                                    />
                                    {orderData.price && orderData.quantity && (
                                        <p className="text-xs text-emerald-400 mt-2">
                                            Line Total: ₹{(parseFloat(orderData.price) * parseInt(orderData.quantity)).toLocaleString('en-IN')}
                                        </p>
                                    )}
                                </div>

                                <button 
                                    type="button"
                                    onClick={handleAddProductToOrder}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold transition-all text-sm"
                                >
                                    + Add Product
                                </button>
                            </div>

                            {/* Selected Products List */}
                            {selectedProducts.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-gray-300 uppercase">Selected Products ({selectedProducts.length})</p>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {selectedProducts.map((product, index) => (
                                            <div key={index} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="font-bold text-white text-sm">{product.name}</p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Qty: <span className="font-bold">{product.quantity}</span> × ₹{Number(product.price).toLocaleString('en-IN')} = <span className="text-emerald-400 font-bold">₹{Number(product.totalPrice).toLocaleString('en-IN')}</span>
                                                    </p>
                                                </div>
                                                <button 
                                                    type="button"
                                                    onClick={() => handleRemoveProductFromOrder(product.productId)}
                                                    className="ml-4 p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-all"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Total Amount */}
                                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mt-4">
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm font-bold text-gray-300">Total Amount:</p>
                                            <p className="text-2xl font-black text-emerald-400">₹{Number(selectedProducts.reduce((sum, p) => sum + p.totalPrice, 0)).toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t border-gray-800">
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setShowOrderModal(false);
                                        setSelectedProducts([]);
                                        setOrderData({ productId: '', quantity: 1 });
                                    }}
                                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg font-bold transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button"
                                    onClick={handleCreateOrder}
                                    disabled={submitting || selectedProducts.length === 0}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 rounded-lg font-bold transition-all"
                                >
                                    {submitting ? 'Creating Order...' : `Create Order (${selectedProducts.length})`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Order History Modal */}
            {showOrderHistoryModal && selectedShop && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gray-900 p-6 border-b border-gray-800 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black text-white">Order History</h2>
                                <p className="text-sm text-gray-400 mt-1">{selectedShop.name}</p>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => generateShopLedgerPDF(selectedShop, shopOrders)}
                                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all"
                                >
                                    <DownloadCloud size={16} /> Export Statement
                                </button>
                                <button onClick={() => setShowOrderHistoryModal(false)} className="p-2 hover:bg-gray-800 rounded-lg transition-all"><X size={24} className="text-gray-400" /></button>
                            </div>
                        </div>

                        <div className="p-6">
                            {loadingOrders ? (
                                <div className="flex justify-center items-center py-12">
                                    <Loader2 className="animate-spin text-emerald-500" size={32} />
                                </div>
                            ) : shopOrders.length > 0 ? (
                                <div className="space-y-4">
                                    {shopOrders.map((order) => (
                                        <div key={order._id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-emerald-500/50 transition-all">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className="font-bold text-white">Order #{order.orderNumber || order._id?.slice(-6)}</p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                                                            year: 'numeric', 
                                                            month: 'short', 
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-bold px-3 py-1 rounded-full text-xs ${
                                                        order.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400' :
                                                        order.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                                                        order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                                                        'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                        {order.status || 'Pending'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Order Items */}
                                            <div className="bg-gray-900/50 rounded-lg p-3 mb-3 space-y-2">
                                                {order.orderItems && order.orderItems.length > 0 ? (
                                                    order.orderItems.map((item, idx) => (
                                                        <div key={idx} className="flex justify-between text-sm">
                                                            <span className="text-gray-300">{item.name} <span className="text-gray-500">×{item.quantity}</span></span>
                                                            <span className="text-emerald-400 font-bold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-500 text-sm">No items</p>
                                                )}
                                            </div>

                                            {/* Order Total */}
                                            <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                                                <p className="text-gray-400 text-sm">Total Amount:</p>
                                                <p className="font-black text-emerald-400 text-lg">₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <AlertCircle size={48} className="mx-auto text-gray-600 mb-3" />
                                    <p className="text-gray-400 font-bold">No orders found for this shop</p>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-gray-800 p-6">
                            <button 
                                onClick={() => setShowOrderHistoryModal(false)}
                                className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg font-bold transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}