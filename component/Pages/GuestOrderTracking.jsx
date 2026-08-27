import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IoSearchOutline, IoCheckmarkCircleOutline, IoCubeOutline } from 'react-icons/io5';
import { trackGuestOrderAPI } from '../../src/api/authAndAdminApi';
import Header from '../header';

const statusSteps = ['Processing', 'Shipped', 'Delivered'];

const GuestOrderTracking = () => {
    const [credentials, setCredentials] = useState({ orderNumber: '', contact: '' });
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setOrder(null);
        setLoading(true);
        const contact = credentials.contact.trim();
        const payload = contact.includes('@')
            ? { orderNumber: credentials.orderNumber, email: contact }
            : { orderNumber: credentials.orderNumber, mobile: contact };
        const response = await trackGuestOrderAPI(payload);
        if (response.success) setOrder(response.data);
        else setError(response.message || 'Order not found. Check your details and try again.');
        setLoading(false);
    };

    const statusIndex = statusSteps.indexOf(order?.orderStatus);

    return (
        <>
            <Header hideNav={true} />
            <main className="min-h-screen bg-gray-100 py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-2">
                            <IoCubeOutline className="text-blue-700" size={28} />
                            <h1 className="text-2xl font-black text-gray-900">Track Your Order</h1>
                        </div>
                        <p className="text-sm text-gray-500 mb-6">Enter your order number and the email or mobile used at checkout.</p>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                required
                                value={credentials.orderNumber}
                                onChange={(event) => setCredentials({ ...credentials, orderNumber: event.target.value })}
                                placeholder="Order number, e.g. ORD123456"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-600"
                            />
                            <input
                                required
                                value={credentials.contact}
                                onChange={(event) => setCredentials({ ...credentials, contact: event.target.value })}
                                placeholder="Email address or 10-digit mobile"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-600"
                            />
                            <button disabled={loading} className="w-full bg-blue-700 disabled:opacity-60 text-white py-3 rounded-lg font-bold flex justify-center items-center gap-2">
                                <IoSearchOutline size={19} /> {loading ? 'Checking...' : 'Track Order'}
                            </button>
                        </form>
                        {error && <p className="mt-4 text-sm text-red-600 font-semibold">{error}</p>}
                    </div>

                    {order && (
                        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                            <div className="flex justify-between gap-4 border-b border-gray-100 pb-5">
                                <div>
                                    <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Order number</p>
                                    <p className="text-xl font-black text-gray-900">{order.orderNumber}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Total</p>
                                    <p className="text-xl font-black text-blue-700">₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 my-6">
                                {statusSteps.map((step, index) => {
                                    const complete = statusIndex >= index;
                                    return <div key={step} className={`text-center text-xs font-bold ${complete ? 'text-green-600' : 'text-gray-400'}`}>
                                        <IoCheckmarkCircleOutline className="mx-auto mb-1" size={22} />
                                        {step}
                                    </div>;
                                })}
                            </div>
                            <div className="border-t border-gray-100 pt-5 space-y-3">
                                {(order.orderItems || []).map((item, index) => <div key={`${item.name}-${index}`} className="flex justify-between text-sm text-gray-700">
                                    <span>{item.name} x {item.quantity}</span>
                                    <span className="font-bold">₹{(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString('en-IN')}</span>
                                </div>)}
                            </div>
                            <div className="mt-6 bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                                <p className="font-bold text-gray-900">Delivery details</p>
                                <p>{order.shippingAddress?.fullName || 'Customer'}</p>
                                <p>{order.shippingAddress?.address}, {order.shippingAddress?.city} - {order.shippingAddress?.postalCode || order.shippingAddress?.pincode}</p>
                            </div>
                        </div>
                    )}

                    <div className="text-center mt-6 text-sm text-gray-600">
                        Have an account? <Link to="/login" className="font-bold text-blue-700 hover:underline">Sign in</Link>
                    </div>
                </div>
            </main>
        </>
    );
};

export default GuestOrderTracking;
