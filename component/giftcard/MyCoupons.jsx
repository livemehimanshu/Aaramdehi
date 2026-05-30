import React, { useState, useEffect } from 'react';
import { api } from '../../src/utils/authUtils';
import { Ticket, Loader2 } from 'lucide-react';

const MyCoupons = () => {
    const [activeTab, setActiveTab] = useState('available');
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const res = await api.get('/coupons/my-coupons');
                if (res.data.success) setCoupons(res.data.data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchCoupons();
    }, []);

    const filtered = coupons.filter(c => activeTab === 'available' ? !c.isUsed : c.isUsed);

    return (
        <div className="flex-1 bg-white p-6 md:p-10 shadow-sm border border-gray-100 rounded-[30px] min-h-[600px]">
            <h2 className="text-2xl font-black text-blue-900 uppercase mb-8">My Coupons</h2>
            
            <div className="flex gap-4 mb-10 border-b border-gray-50 pb-4">
                {['available', 'used'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${activeTab === tab ? 'bg-blue-900 text-white shadow-lg' : 'text-gray-400 hover:text-blue-900'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-900" /></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filtered.length === 0 ? (
                        <p className="text-gray-400 italic text-sm text-center col-span-2">No {activeTab} coupons found.</p>
                    ) : filtered.map(coupon => (
                        <div key={coupon._id} className={`p-6 rounded-[25px] border-2 border-dashed relative overflow-hidden ${activeTab === 'available' ? 'border-emerald-100 bg-emerald-50/30' : 'border-gray-100 bg-gray-50 grayscale opacity-60'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activeTab === 'available' ? 'bg-emerald-500 text-white' : 'bg-gray-400 text-white'}`}>
                                    <Ticket size={24} />
                                </div>
                                <div>
                                    <p className="text-lg font-black text-gray-900 tracking-tighter">{coupon.code}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{coupon.description}</p>
                                </div>
                            </div>
                            {activeTab === 'available' && <button onClick={() => {navigator.clipboard.writeText(coupon.code); toast.success("Code Copied!")}} className="mt-4 w-full py-2 bg-white border border-emerald-200 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all">Copy Code</button>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyCoupons;