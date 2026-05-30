import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../src/utils/authUtils';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AccountSettings = () => {
    const navigate = useNavigate();
    const [isEdit, setIsEdit] = useState({ personal: false, email: false, mobile: false });
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        first: "",
        last: "",
        gender: "",
        email: "",
        mobile: ""
    });

    // Load data from localStorage on mount
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("userData"));
        if (user) {
            const names = user.name?.split(' ') || ["", ""];
            setData({
                first: names[0] || "",
                last: names.slice(1).join(' ') || "",
                gender: user.gender || "Male",
                email: user.email || "",
                mobile: user.mobile || ""
            });
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData({ ...data, [name]: value });
    };

    const handleToggle = async (key) => {
        if (isEdit[key]) { // Clicking 'Save'
            try {
                setLoading(true);
                const payload = {
                    name: `${data.first} ${data.last}`.trim(),
                    gender: data.gender,
                    mobile: data.mobile
                };
                const res = await api.put('/user/update-profile', payload);
                if (res.data.success) {
                    localStorage.setItem("userData", JSON.stringify(res.data.user));
                    window.dispatchEvent(new Event('userDataUpdated'));
                    toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} updated!`);
                }
            } catch (err) {
                toast.error(err.response?.data?.message || "Update failed");
                return; // Don't close edit mode on error
            } finally {
                setLoading(false);
            }
        }
        setIsEdit({ ...isEdit, [key]: !isEdit[key] });
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm("⚠️ WARNING: Are you sure you want to delete your account? This action is permanent and all your data (orders, addresses) will be lost forever.");
        if (confirmed) {
            try {
                setLoading(true);
                const res = await api.delete('/user/delete-account');
                if (res.data.success) {
                    toast.success("Account deleted successfully.");
                    localStorage.clear();
                    window.location.href = '/login';
                }
            } catch (err) {
                toast.error(err.response?.data?.message || "Failed to delete account");
            } finally { setLoading(false); }
        }
    };

    return (
        <div className="flex-1 bg-white p-6 md:p-10 shadow-sm border border-gray-100 rounded-[30px] min-h-[600px]">
            {/* Personal Information */}
            <div className="mb-10">
                <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-xl font-black text-blue-900 uppercase tracking-tight">Personal Information</h2>
                    <button 
                        onClick={() => handleToggle('personal')} 
                        className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline"
                    >
                        {isEdit.personal ? "Save" : "Edit"}
                    </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <input 
                        type="text" 
                        name="first"
                        value={data.first} 
                        onChange={handleChange}
                        disabled={!isEdit.personal} 
                        className={`border-2 p-4 w-full sm:w-64 rounded-xl font-bold text-sm outline-none transition-all ${isEdit.personal ? 'border-blue-900 bg-white' : 'bg-gray-50 text-gray-400 border-transparent'}`} 
                    />
                    <input 
                        type="text" 
                        name="last"
                        value={data.last} 
                        onChange={handleChange}
                        disabled={!isEdit.personal} 
                        className={`border-2 p-4 w-full sm:w-64 rounded-xl font-bold text-sm outline-none transition-all ${isEdit.personal ? 'border-blue-900 bg-white' : 'bg-gray-50 text-gray-400 border-transparent'}`} 
                    />
                </div>
                
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Your Gender</p>
                <div className="flex gap-6">
                    {['Male', 'Female'].map(g => (
                        <label key={g} className="flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer group">
                            <input 
                                type="radio" 
                                name="gender" 
                                value={g}
                                onChange={handleChange}
                                checked={data.gender === g} 
                                disabled={!isEdit.personal} 
                                className="w-4 h-4 accent-blue-900" 
                            /> <span className="group-hover:text-blue-900 transition-colors">{g}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Email Address */}
            <div className="mb-10">
                <div className="flex items-center gap-4 mb-4">
                    <h2 className="text-xl font-black text-blue-900 uppercase tracking-tight">Email Address</h2>
                    <button onClick={() => handleToggle('email')} className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline">{isEdit.email ? "Save" : "Edit"}</button>
                </div>
                <input 
                    type="email" 
                    name="email"
                    value={data.email} 
                    onChange={handleChange}
                    disabled={!isEdit.email} 
                    className={`border-2 p-4 w-full sm:w-80 rounded-xl font-bold text-sm outline-none transition-all ${isEdit.email ? 'border-blue-900 bg-white' : 'bg-gray-50 text-gray-400 border-transparent'}`} 
                />
            </div>

            {/* Mobile Number */}
            <div className="mb-12">
                <div className="flex items-center gap-4 mb-4">
                    <h2 className="text-xl font-black text-blue-900 uppercase tracking-tight">Mobile Number</h2>
                    <button onClick={() => handleToggle('mobile')} className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline">{isEdit.mobile ? "Save" : "Edit"}</button>
                </div>
                <input 
                    type="text" 
                    name="mobile"
                    value={data.mobile} 
                    onChange={handleChange}
                    disabled={!isEdit.mobile} 
                    className={`border-2 p-4 w-full sm:w-80 rounded-xl font-bold text-sm outline-none transition-all ${isEdit.mobile ? 'border-blue-900 bg-white' : 'bg-gray-50 text-gray-400 border-transparent'}`} 
                />
            </div>

            {/* FAQ Section */}
            <div className="mt-10 border-t border-gray-50 pt-10">
                <h4 className="font-black text-gray-400 mb-6 uppercase text-[10px] tracking-[0.2em]">Account Actions & FAQs</h4>
                <div className="mb-8">
                    <p className="text-sm font-black text-gray-800 mb-2 uppercase tracking-tight">What happens when I update my info?</p>
                    <p className="text-xs font-bold text-gray-400 leading-relaxed uppercase tracking-widest">
                        Your login email id (or mobile number) changes, likewise. You'll receive all your account related communication on your updated email address (or mobile number).
                    </p>
                </div>
                
                <div className="flex flex-wrap gap-6 pt-4">
                    <button className="text-blue-900 font-black text-[10px] uppercase tracking-[0.2em] hover:text-blue-600 transition-colors">Deactivate Account</button>
                    <button onClick={handleDeleteAccount} className="text-rose-600 font-black text-[10px] uppercase tracking-[0.2em] hover:text-rose-400 transition-colors">Delete Account</button>
                </div>
            </div>
        </div>
    );
};

export default AccountSettings;