import React, { useState } from 'react';

const ManageAddresses = () => {
    const [showForm, setShowForm] = useState(false);
    const savedAddresses = [
        { id: 1, type: 'HOME', name: 'Himanshu Srivastava', mobile: '8979482251', detail: 'New durga puri colony, near by itc, Saharanpur, Uttar Pradesh - 247001' },
        { id: 2, type: 'WORK', name: 'Himanshu Srivastava', mobile: '8979482251', detail: 'Quantum University, Roorkee - 247667' }
    ];

    return (
        <div className="flex-1 bg-white p-6 ml-4 shadow-sm border border-gray-100 rounded-sm">
            <h2 className="text-lg font-bold mb-6">Manage Addresses</h2>
            
            <button 
                onClick={() => setShowForm(!showForm)}
                className="w-full text-left border border-gray-200 p-4 text-blue-600 font-bold text-sm mb-6 flex items-center gap-2 hover:bg-gray-50 transition-all"
            >
                <span className="text-xl">+</span> ADD A NEW ADDRESS
            </button>

            {showForm && (
                <div className="bg-blue-50 p-6 border border-gray-200 mb-8 animate-fadeIn">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <input type="text" placeholder="Name" className="p-3 border outline-none focus:border-blue-500 rounded-sm" />
                        <input type="text" placeholder="10-digit mobile number" className="p-3 border outline-none focus:border-blue-500 rounded-sm" />
                        <input type="text" placeholder="Pincode" className="p-3 border outline-none focus:border-blue-500 rounded-sm" />
                        <input type="text" placeholder="Locality" className="p-3 border outline-none focus:border-blue-500 rounded-sm" />
                    </div>
                    <textarea placeholder="Address (Area and Street)" className="w-full p-3 border outline-none focus:border-blue-500 rounded-sm mb-4 h-24"></textarea>
                    <div className="flex gap-4 mb-6">
                        <button className="bg-blue-600 text-white px-10 py-3 font-bold rounded-sm shadow-md">SAVE</button>
                        <button onClick={() => setShowForm(false)} className="text-blue-600 font-bold px-6">CANCEL</button>
                    </div>
                </div>
            )}

            <div className="space-y-0">
                {savedAddresses.map(addr => (
                    <div key={addr.id} className="border border-gray-100 p-6 flex justify-between group hover:bg-gray-50">
                        <div>
                            <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-sm text-gray-500 font-bold">{addr.type}</span>
                            <div className="flex gap-4 mt-2">
                                <span className="font-bold text-sm">{addr.name}</span>
                                <span className="font-bold text-sm">{addr.mobile}</span>
                            </div>
                            <p className="text-sm text-gray-700 mt-2 max-w-lg">{addr.detail}</p>
                        </div>
                        <button className="text-gray-400 font-bold text-xl opacity-0 group-hover:opacity-100 transition-opacity">⋮</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManageAddresses;