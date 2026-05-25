import React from 'react';

const MyCoupons = () => {
    const coupons = [
        { id: 1, title: 'Get product at Rs.1', validity: '30 Apr, 2026', type: 'Available' },
        { id: 2, title: '10% off on Men\'s Clothing', validity: '15 Jun, 2026', type: 'Upcoming' },
        { id: 3, title: 'Extra ₹500 Off on Air Conditioners', validity: '01 Apr, 2026', type: 'Expired' }
    ];

    const CouponRow = ({ item }) => (
        <div className="flex items-center justify-between p-6 border-b hover:bg-gray-50">
            <div>
                <p className={`text-sm font-bold ${item.type === 'Expired' ? 'text-gray-400' : 'text-green-600'}`}>
                    {item.title}
                </p>
                <p className="text-[11px] text-gray-500 mt-1">Valid till {item.validity}</p>
                <p className="text-[10px] text-blue-600 font-bold mt-2 cursor-pointer uppercase">View T&C</p>
            </div>
            {item.type !== 'Expired' && (
                <button className="text-blue-600 font-bold text-sm">DETAILS</button>
            )}
        </div>
    );

    return (
        <div className="flex-1 bg-white ml-4 shadow-sm border border-gray-100 rounded-sm overflow-hidden">
            <div className="p-4 border-b">
                <h2 className="text-lg font-bold">Available Coupons</h2>
            </div>
            
            {coupons.filter(c => c.type === 'Available').map(c => <CouponRow key={c.id} item={c} />)}
            
            <div className="bg-gray-50 p-3 border-b">
                <h2 className="text-sm font-bold text-gray-600 uppercase">Upcoming Coupons</h2>
            </div>
            {coupons.filter(c => c.type === 'Upcoming').map(c => <CouponRow key={c.id} item={c} />)}

            <div className="bg-gray-50 p-3 border-b">
                <h2 className="text-sm font-bold text-gray-600 uppercase">Expired Coupons</h2>
            </div>
            {coupons.filter(c => c.type === 'Expired').map(c => <CouponRow key={c.id} item={c} />)}
        </div>
    );
};

export default MyCoupons;