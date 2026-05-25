import React, { useState } from 'react';

const AccountSettings = () => {
    const [isEdit, setIsEdit] = useState({ personal: false, email: false, mobile: false });
    const [data, setData] = useState({
        first: "Himanshu",
        last: "Srivastava",
        gender: "Male",
        email: "17hshri@gmail.com",
        mobile: "+918979482251"
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData({ ...data, [name]: value });
    };

    const handleToggle = (key) => {
        setIsEdit({ ...isEdit, [key]: !isEdit[key] });
    };

    return (
        <div className="flex-1 bg-white p-8 ml-4 shadow-sm border border-gray-100 rounded-sm min-h-[600px]">
            {/* Personal Information */}
            <div className="mb-10">
                <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-lg font-bold text-gray-800">Personal Information</h2>
                    <button 
                        onClick={() => handleToggle('personal')} 
                        className="text-blue-600 font-bold text-sm hover:underline"
                    >
                        {isEdit.personal ? "Save" : "Edit"}
                    </button>
                </div>
                <div className="flex gap-4 mb-6">
                    <input 
                        type="text" 
                        name="first"
                        value={data.first} 
                        onChange={handleChange}
                        disabled={!isEdit.personal} 
                        className={`border p-3 w-64 rounded-sm outline-none transition-all ${isEdit.personal ? 'border-blue-500 bg-white' : 'bg-gray-50 text-gray-500 border-gray-200'}`} 
                    />
                    <input 
                        type="text" 
                        name="last"
                        value={data.last} 
                        onChange={handleChange}
                        disabled={!isEdit.personal} 
                        className={`border p-3 w-64 rounded-sm outline-none transition-all ${isEdit.personal ? 'border-blue-500 bg-white' : 'bg-gray-50 text-gray-500 border-gray-200'}`} 
                    />
                </div>
                
                <p className="text-sm text-gray-700 mb-3 font-medium">Your Gender</p>
                <div className="flex gap-6">
                    {['Male', 'Female'].map(g => (
                        <label key={g} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input 
                                type="radio" 
                                name="gender" 
                                value={g}
                                onChange={handleChange}
                                checked={data.gender === g} 
                                disabled={!isEdit.personal} 
                                className="w-4 h-4 accent-blue-600" 
                            /> {g}
                        </label>
                    ))}
                </div>
            </div>

            {/* Email Address */}
            <div className="mb-10">
                <div className="flex items-center gap-4 mb-4">
                    <h2 className="text-lg font-bold text-gray-800">Email Address</h2>
                    <button onClick={() => handleToggle('email')} className="text-blue-600 font-bold text-sm hover:underline">{isEdit.email ? "Save" : "Edit"}</button>
                </div>
                <input 
                    type="email" 
                    name="email"
                    value={data.email} 
                    onChange={handleChange}
                    disabled={!isEdit.email} 
                    className={`border p-3 w-64 rounded-sm outline-none transition-all ${isEdit.email ? 'border-blue-500 bg-white' : 'bg-gray-50 text-gray-500 border-gray-200'}`} 
                />
            </div>

            {/* Mobile Number */}
            <div className="mb-12">
                <div className="flex items-center gap-4 mb-4">
                    <h2 className="text-lg font-bold text-gray-800">Mobile Number</h2>
                    <button onClick={() => handleToggle('mobile')} className="text-blue-600 font-bold text-sm hover:underline">{isEdit.mobile ? "Save" : "Edit"}</button>
                </div>
                <input 
                    type="text" 
                    name="mobile"
                    value={data.mobile} 
                    onChange={handleChange}
                    disabled={!isEdit.mobile} 
                    className={`border p-3 w-64 rounded-sm outline-none transition-all ${isEdit.mobile ? 'border-blue-500 bg-white' : 'bg-gray-50 text-gray-500 border-gray-200'}`} 
                />
            </div>

            {/* FAQ Section */}
            <div className="mt-10 border-t pt-8">
                <h4 className="font-bold text-gray-800 mb-4 uppercase text-xs tracking-wider">FAQs</h4>
                <div className="mb-8">
                    <p className="text-sm font-bold text-gray-800 mb-2">What happens when I update my email address (or mobile number)?</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Your login email id (or mobile number) changes, likewise. You'll receive all your account related communication on your updated email address (or mobile number).
                    </p>
                </div>
                
                <div className="space-y-4">
                    <button className="text-blue-600 font-bold text-sm hover:underline block">Deactivate Account</button>
                    <button className="text-red-500 font-bold text-sm hover:underline block">Delete Account</button>
                </div>
            </div>
        </div>
    );
};

export default AccountSettings;