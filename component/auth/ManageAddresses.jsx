import React, { useState } from 'react';
import toast from 'react-hot-toast';

const ManageAddresses = () => {
	const [showForm, setShowForm] = useState(false);
	const savedAddresses = [
		{ id: 1, type: 'HOME', name: 'Himanshu Srivastava', mobile: '8979482251', detail: 'New durga puri colony, near by itc, Saharanpur, Uttar Pradesh - 247001' },
		{ id: 2, type: 'WORK', name: 'Himanshu Srivastava', mobile: '8979482251', detail: 'Quantum University, Roorkee - 247667' }
	];

	return (
		<div className="flex-1 bg-white p-6 md:p-10 shadow-sm border border-gray-100 rounded-[30px] min-h-[600px]">
			<h2 className="text-2xl font-black text-blue-900 uppercase tracking-tight mb-8">Manage Addresses</h2>
            
			<button 
				onClick={() => setShowForm(!showForm)}
				className="w-full text-left border-2 border-dashed border-gray-100 p-5 text-blue-900 font-black text-[10px] tracking-[0.2em] mb-10 flex items-center justify-center gap-3 rounded-2xl hover:bg-gray-50 hover:border-blue-900 transition-all group"
			>
				<span className="text-2xl group-hover:scale-125 transition-transform">+</span> ADD A NEW ADDRESS
			</button>

			{showForm && (
				<div className="bg-blue-50/50 p-6 md:p-8 rounded-[25px] border border-blue-100 mb-10 animate-fadeIn">
					<h3 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-6">Address Details</h3>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
						<input type="text" placeholder="Full Name" className="p-4 bg-white border-2 border-transparent focus:border-blue-900 outline-none rounded-xl font-bold text-sm" />
						<input type="text" placeholder="10-digit mobile number" className="p-4 bg-white border-2 border-transparent focus:border-blue-900 outline-none rounded-xl font-bold text-sm" />
						<input type="text" placeholder="Pincode" className="p-4 bg-white border-2 border-transparent focus:border-blue-900 outline-none rounded-xl font-bold text-sm" />
						<input type="text" placeholder="Locality" className="p-4 bg-white border-2 border-transparent focus:border-blue-900 outline-none rounded-xl font-bold text-sm" />
					</div>
					<textarea placeholder="Address (Area and Street)" className="w-full p-4 bg-white border-2 border-transparent focus:border-blue-900 outline-none rounded-xl font-bold text-sm mb-6 h-24 resize-none"></textarea>
					<div className="flex items-center gap-6">
						<button 
                            className="bg-blue-900 text-white px-10 py-4 font-black text-[10px] tracking-widest rounded-xl shadow-lg hover:bg-black transition-all active:scale-95"
                            onClick={() => {
                                toast.success("Address saved successfully!");
                                setShowForm(false);
                            }}
                        >SAVE</button>
						<button onClick={() => setShowForm(false)} className="text-gray-400 font-black text-[10px] tracking-widest hover:text-rose-600 transition-colors">CANCEL</button>
					</div>
				</div>
			)}

			<div className="space-y-6">
				{savedAddresses.map(addr => (
					<div key={addr.id} className="border border-gray-100 p-6 md:p-8 rounded-[25px] flex justify-between group hover:border-blue-900/10 hover:bg-blue-50/10 transition-all">
						<div className="flex-1">
							<span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] ${addr.type === 'HOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>{addr.type}</span>
							<div className="flex flex-wrap gap-x-4 gap-y-1 mt-4">
								<span className="font-black text-gray-800 uppercase tracking-tight">{addr.name}</span>
								<span className="font-bold text-blue-900 text-sm">{addr.mobile}</span>
							</div>
							<p className="text-xs font-bold text-gray-400 mt-3 max-w-lg leading-relaxed uppercase tracking-wider">{addr.detail}</p>
						</div>
						<button className="text-gray-300 font-bold text-xl hover:text-blue-900 transition-colors px-2">⋮</button>
					</div>
				))}
			</div>
		</div>
	);
};

export default ManageAddresses;
