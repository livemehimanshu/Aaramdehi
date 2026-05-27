import React, { useState, useEffect } from 'react';
import { 
    IoPersonOutline, 
    IoMailOutline, 
    IoCallOutline, 
    IoShieldCheckmarkOutline,
    IoCopyOutline, 
    IoCheckmarkCircleOutline, 
    IoShareSocialOutline, 
    IoLogoWhatsapp, 
    IoPeopleOutline, 
    IoGiftOutline, 
    IoWalletOutline,
    IoLogOutOutline
} from "react-icons/io5";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema } from '../../src/schemas/validationSchemas';
import toast from 'react-hot-toast'; // ✅ Import Toast
import axiosInstance from '../../src/api/axiosInstance'; // ✅ Use global instance
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const [referralStats, setReferralStats] = useState({
        totalRefers: 0,
        pointsEarned: 0,
        pendingRefers: 0
    });

    // ✅ Setup React Hook Form for Profile
    const { register, handleSubmit, formState: { errors: profileErrors }, reset } = useForm({
        resolver: zodResolver(profileSchema)
    });

    useEffect(() => {
        const loadUserData = () => {
            const userData = localStorage.getItem('userData');
            if (userData) {
                try {
                    const parsedUser = JSON.parse(userData);
                    setUser(parsedUser);
                    reset({ fullName: parsedUser.name, email: parsedUser.email, phone: parsedUser.mobile });
                    
                    setReferralStats({
                        totalRefers: parsedUser.totalRefers || 3,
                        pointsEarned: parsedUser.loyaltyPoints || 150,
                        pendingRefers: parsedUser.pendingRefers || 1
                    });
                } catch (e) {
                    console.error("Error parsing userData", e);
                }
            }
        };

        loadUserData();
        
        const handleUpdate = () => loadUserData();
        window.addEventListener('userDataUpdated', handleUpdate);
        return () => window.removeEventListener('userDataUpdated', handleUpdate);
    }, []);

    const handleUpdateProfile = (data) => {
        console.log("Updating Profile with:", data);
        toast.info("Updating profile details..."); // ✅ User feedback
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            setLoading(true);
            // ✅ Headers और Base URL की ज़रूरत नहीं, Interceptor संभाल लेगा
            const response = await axiosInstance.put('/api/user/upload-avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.success) {
                const updatedUser = { ...user, avatar: response.data.avatar };
                setUser(updatedUser);
                localStorage.setItem('userData', JSON.stringify(updatedUser));
                toast.success("Profile picture updated!");
                window.dispatchEvent(new Event("userDataUpdated"));
            }
        } catch (error) {
            toast.error("Failed to upload image. Please check file size.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopyCode = () => {
        const codeToCopy = user?.referralCode || "AARAMDEHI50";
        navigator.clipboard.writeText(codeToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleWhatsAppShare = () => {
        const code = user?.referralCode || "AARAMDEHI50";
        const shareMessage = `Hey! Use my referral code *${code}* when you sign up on Aaramdehi to get ₹50 off on your first order of premium home furnishings! 🛋️✨ Shop now: ${window.location.origin}/signup?ref=${code}`;
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('token'); // सुरक्षा के लिए दोनों keys हटाएँ
        localStorage.removeItem('userData');
        localStorage.removeItem('userEmail');
        navigate('/login');
    };

    if (!user) return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 px-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
            <p className="font-bold text-gray-500 text-sm md:text-base">Loading your profile...</p>
        </div>
    );

    return (
        <div className="w-full px-3 sm:px-4 md:px-6 py-4 space-y-6 max-w-7xl mx-auto">
            
            {/* Main Profile Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Responsive Header Banner */}
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 h-24 sm:h-32 md:h-44 lg:h-48"></div>
                
                <div className="px-4 sm:px-6 pb-6 md:pb-10">
                    {/* Avatar Wrapper */}
                    <div className="relative -mt-12 sm:-mt-16 md:-mt-20 mb-4 md:mb-6 flex justify-center md:justify-start">
                        <div className="relative group shadow-lg rounded-full">
                            
                            {user.avatar ? (
                                <img 
                                    src={user.avatar} 
                                    alt="Profile" 
                                    className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full border-4 border-white object-cover bg-gray-100"
                                />
                            ) : (
                                <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-gradient-to-br from-gray-800 to-gray-950 flex flex-col items-center justify-center select-none">
                                    <span className="text-white text-xl sm:text-2xl md:text-4xl font-black tracking-tighter uppercase leading-none">
                                        AARAM
                                    </span>
                                    <span className="text-orange-400 text-[9px] sm:text-xs md:text-sm font-bold tracking-widest uppercase mt-0.5">
                                        DEHI
                                    </span>
                                </div>
                            )}

                            <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-200">
                                <input type="file" className="hidden" onChange={handleAvatarChange} disabled={loading} />
                                <span className="text-white text-[10px] sm:text-xs font-bold tracking-wide text-center px-2">
                                    {loading ? 'Uploading...' : 'Change Photo'}
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Info & Settings Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
                        {/* Left: Info Blocks */}
                        <div className="text-center md:text-left space-y-4">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black text-gray-800 mb-1">{user.name}</h2>
                                <p className="text-gray-500 flex items-center justify-center md:justify-start gap-1.5 text-xs sm:text-sm">
                                    <IoShieldCheckmarkOutline className="text-green-500" size={16} /> 
                                    Verified {user.role || 'User'}
                                </p>
                            </div>

                            <div className="space-y-3 text-left">
                                <div className="flex items-center gap-3 sm:gap-4 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100 flex-shrink-0">
                                        <IoMailOutline className="text-gray-400" size={18} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-400 font-bold">Email Address</p>
                                        <p className="text-xs sm:text-sm font-semibold text-gray-700 truncate">{user.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 sm:gap-4 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100 flex-shrink-0">
                                        <IoCallOutline className="text-gray-400" size={18} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-400 font-bold">Mobile Number</p>
                                        <p className="text-xs sm:text-sm font-semibold text-gray-700 truncate">{user.mobile || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Actions Card */}
                        <div className="bg-blue-50/70 p-4 sm:p-6 rounded-2xl border border-blue-100 flex flex-col justify-center">
                            <h3 className="font-bold text-blue-900 mb-1 text-base sm:text-lg">Account Settings</h3>
                            <p className="text-blue-700/70 text-xs sm:text-sm mb-4 sm:mb-6">Manage your security and preferences from here.</p>
                            
                            <form onSubmit={handleSubmit(handleUpdateProfile)} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Full Name</label>
                                    <input 
                                        {...register('fullName')}
                                        className={`w-full p-2.5 rounded-xl border text-sm focus:outline-none focus:border-blue-500 transition-colors ${profileErrors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`}
                                        placeholder="Full Name"
                                    />
                                    {profileErrors.fullName && <p className="text-red-500 text-[10px] mt-1 font-bold">{profileErrors.fullName.message}</p>}
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Mobile Number</label>
                                    <input 
                                        {...register('phone')}
                                        className={`w-full p-2.5 rounded-xl border text-sm focus:outline-none focus:border-blue-500 transition-colors ${profileErrors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`}
                                        placeholder="10-digit mobile"
                                    />
                                    {profileErrors.phone && <p className="text-red-500 text-[10px] mt-1 font-bold">{profileErrors.phone.message}</p>}
                                </div>

                                <button type="submit" className="w-full bg-white text-blue-600 font-bold py-2.5 sm:py-3 rounded-xl border border-blue-200 hover:bg-blue-600 hover:text-white transition shadow-sm text-xs sm:text-sm">
                                    Update Profile Info
                                </button>
                                <button type="button" className="w-full bg-blue-600 text-white font-bold py-2.5 sm:py-3 rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-200 text-xs sm:text-sm">
                                    Change Password
                                </button>
                                <button onClick={handleLogout} className="w-full bg-red-50 text-red-600 font-bold py-2.5 sm:py-3 rounded-xl border border-red-100 hover:bg-red-600 hover:text-white transition shadow-sm text-xs sm:text-sm flex items-center justify-center gap-2">
                                    <IoLogOutOutline size={18} /> Logout Account
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Refer & Earn Section */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                {/* Section Header */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                    <div className="p-2.5 bg-orange-100 text-orange-600 rounded-xl flex-shrink-0">
                        <IoGiftOutline size={22} />
                    </div>
                    <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">Refer & Earn</h3>
                        <p className="text-xs sm:text-sm text-gray-500">Invite your friends to Aaramdehi and earn rewards together!</p>
                    </div>
                </div>

                {/* Content Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left/Center Workflow & Actions */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Dynamic Step Banner */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <h4 className="text-[10px] sm:text-xs font-bold text-gray-800 uppercase tracking-wider mb-4 md:mb-3 text-center sm:text-left">How it works:</h4>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                                <div className="p-2 flex flex-row sm:flex-col items-center sm:justify-center gap-3 sm:gap-0">
                                    <div className="w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 sm:mb-2">1</div>
                                    <div className="text-left sm:text-center">
                                        <p className="text-xs font-bold text-gray-800">Share Code</p>
                                        <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5">Send your code to friends.</p>
                                    </div>
                                </div>
                                <div className="p-2 flex flex-row sm:flex-col items-center sm:justify-center gap-3 sm:gap-0">
                                    <div className="w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 sm:mb-2">2</div>
                                    <div className="text-left sm:text-center">
                                        <p className="text-xs font-bold text-gray-800">They Shop</p>
                                        <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5">They place their 1st order.</p>
                                    </div>
                                </div>
                                <div className="p-2 flex flex-row sm:flex-col items-center sm:justify-center gap-3 sm:gap-0">
                                    <div className="w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 sm:mb-2">3</div>
                                    <div className="text-left sm:text-center">
                                        <p className="text-xs font-bold text-gray-800">Both Win!</p>
                                        <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5">Both get 50 Loyalty Points.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Share Panel */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
                            <div className="flex-1">
                                <label className="text-xs font-bold text-gray-600 block mb-1.5">Your Referral Code</label>
                                <div className="flex items-center justify-between border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl px-4 py-2.5 sm:py-3">
                                    <span className="font-mono text-base sm:text-lg font-black tracking-wider text-gray-800">
                                        {user.referralCode || "AARAMDEHI50"}
                                    </span>
                                    <button 
                                        onClick={handleCopyCode}
                                        className="text-gray-500 hover:text-orange-500 transition p-1 flex-shrink-0"
                                        title="Copy Code"
                                    >
                                        {copied ? (
                                            <IoCheckmarkCircleOutline size={20} className="text-green-600" />
                                        ) : (
                                            <IoCopyOutline size={20} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleWhatsAppShare}
                                className="bg-[#25D366] text-white font-bold px-5 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#20ba5a] transition shadow-sm text-xs sm:text-sm whitespace-nowrap"
                            >
                                <IoLogoWhatsapp size={18} />
                                Share Code
                            </button>
                        </div>
                    </div>

                    {/* Right: Dashboard Card */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-md space-y-6 lg:space-y-0">
                        <div>
                            <h4 className="text-[10px] font-black tracking-widest text-orange-400 uppercase mb-4">Referral Earnings</h4>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4 lg:space-y-4 lg:gap-0">
                                <div className="flex items-center gap-3 p-2 sm:p-0 bg-white/5 sm:bg-transparent rounded-lg lg:rounded-none">
                                    <div className="p-2 bg-white/10 rounded-lg text-orange-400 flex-shrink-0">
                                        <IoWalletOutline size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] sm:text-[11px] text-gray-400 truncate">Total Balance</p>
                                        <p className="text-base sm:text-lg font-black text-white truncate">₹{user.loyaltyPoints || referralStats.pointsEarned}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-2 sm:p-0 bg-white/5 sm:bg-transparent rounded-lg lg:rounded-none">
                                    <div className="p-2 bg-white/10 rounded-lg text-green-400 flex-shrink-0">
                                        <IoPeopleOutline size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] sm:text-[11px] text-gray-400 truncate">Successful Refers</p>
                                        <p className="text-xs sm:text-sm font-bold text-white truncate">{referralStats.totalRefers} Friends</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-2 sm:p-0 bg-white/5 sm:bg-transparent rounded-lg lg:rounded-none">
                                    <div className="p-2 bg-white/10 rounded-lg text-yellow-400 flex-shrink-0">
                                        <IoShareSocialOutline size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] sm:text-[11px] text-gray-400 truncate">Pending Orders</p>
                                        <p className="text-xs sm:text-sm font-bold text-white truncate">{referralStats.pendingRefers} Friend</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="text-[9px] text-gray-400 pt-3 border-t border-white/10 text-center lg:mt-6">
                            *Points will be credited once your friend's order is successfully delivered.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Profile;