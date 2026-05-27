import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IoEyeOutline, IoEyeOffOutline, IoShieldCheckmarkOutline, IoWarningOutline } from "react-icons/io5";
// APIs import
import { loginAPI, signupAPI } from '../../../src/api/authAndAdminApi.js';

const Auth = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Updated to match backend fields: name, email, mobile, password, confirmPassword
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        mobile: '', 
        password: '', 
        confirmPassword: '' 
    });
    
    const [attempts, setAttempts] = useState(0); 
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        setIsLogin(location.pathname === '/register' ? false : true);
    }, [location]);

    const sanitizeInput = (str) => str.replace(/[<>]/g, ""); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isLocked) return alert("CRITICAL: System Locked! Wait 30 seconds.");

        const cleanEmail = sanitizeInput(formData.email);
        const cleanName = sanitizeInput(formData.name);

        // Basic Security Validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return alert("Invalid Identity Format!");
        if (formData.password.length < 6) return alert("Security Requirement: Minimum 6 characters.");

        setLoading(true);
        
        try {
            if (isLogin) {
                // ====== LOGIN EXECUTION ======
                const response = await loginAPI(cleanEmail, formData.password);
                localStorage.setItem('accessToken', response.accessToken);
                localStorage.setItem('userData', JSON.stringify(response.user));
                
                // ✅ Dispatch event taaki Header turant update ho jaye
                window.dispatchEvent(new Event("userDataUpdated"));

                alert("Encrypted Session Established!");
                navigate(response.user.role === 'ADMIN' ? '/admin' : '/');
            } else {
                // ====== SIGNUP EXECUTION ======
                if (formData.password !== formData.confirmPassword) {
                    throw new Error("Passwords do not match!");
                }

                await signupAPI({
                    name: cleanName,
                    email: cleanEmail,
                    mobile: formData.mobile,
                    password: formData.password,
                    confirmPassword: formData.confirmPassword
                });

                alert("Account Initialized! Check email for OTP.");
                setIsLogin(true); // Login par bhej do signup ke baad
            }
            setAttempts(0); 
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message;
            setAttempts(prev => prev + 1);
            
            if (attempts >= 4) {
                setIsLocked(true);
                setTimeout(() => { setIsLocked(false); setAttempts(0); }, 30000);
                alert("CRITICAL: Intrusion detected. Access Revoked for 30s.");
            } else {
                alert(`Access Denied: ${errorMsg}. ${4 - attempts} attempts left.`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#060606] flex items-center justify-center p-4 font-sans relative overflow-hidden text-white">
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isLocked ? 'bg-red-900/20 opacity-100' : 'opacity-0'}`}></div>
            
            <div className={`bg-[#0d0d0d] w-full max-w-[450px] border ${isLocked ? 'border-red-600' : 'border-white/5'} rounded-sm shadow-2xl p-8 md:p-12 z-10 transition-all duration-500`}>
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black tracking-tighter uppercase text-white italic">Aaramdehi</h1>
                    <div className="flex items-center justify-center gap-2 mt-1">
                        {isLocked ? <IoWarningOutline className="text-red-500 animate-pulse" /> : <IoShieldCheckmarkOutline className="text-red-500" />}
                        <p className={`text-[9px] font-bold uppercase tracking-[3px] ${isLocked ? 'text-red-500' : 'text-gray-500'}`}>
                            {isLocked ? "Intrusion Blocked" : "AES-256 Encryption Active"}
                        </p>
                    </div>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {!isLogin && (
                        <>
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-1">Owner Alias</label>
                                <input type="text" disabled={isLocked} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full h-11 bg-[#141414] border border-white/5 px-4 focus:border-red-600 outline-none transition-all text-sm font-mono" placeholder="Full Name" required />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-1">Secure Line (Mobile)</label>
                                <input type="tel" disabled={isLocked} onChange={(e) => setFormData({...formData, mobile: e.target.value})} className="w-full h-11 bg-[#141414] border border-white/5 px-4 focus:border-red-600 outline-none transition-all text-sm font-mono" placeholder="Mobile Number" required />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-1">Identity (Email)</label>
                        <input type="email" disabled={isLocked} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full h-11 bg-[#141414] border border-white/5 px-4 focus:border-red-600 outline-none transition-all text-sm font-mono" placeholder="user@aaramdehi.com" required />
                    </div>

                    <div className="relative">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-1">Access Key</label>
                        <input type={showPassword ? "text" : "password"} disabled={isLocked} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full h-11 bg-[#141414] border border-white/5 px-4 focus:border-red-600 outline-none transition-all text-sm font-mono" placeholder="••••••••" required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[32px] text-gray-600 hover:text-red-500 transition-colors">
                            {showPassword ? <IoEyeOffOutline size={18}/> : <IoEyeOutline size={18}/>}
                        </button>
                    </div>

                    {!isLogin && (
                        <div className="relative">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-1">Confirm Access Key</label>
                            <input type="password" disabled={isLocked} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} className="w-full h-11 bg-[#141414] border border-white/5 px-4 focus:border-red-600 outline-none transition-all text-sm font-mono" placeholder="••••••••" required />
                        </div>
                    )}

                    <button 
                        disabled={loading || isLocked} // ✅ Prevent double submission
                        className={`w-full h-12 font-black uppercase text-xs tracking-[2px] transition-all shadow-xl mt-4
                        ${isLocked ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 
                          loading ? 'bg-red-900 animate-pulse' : 'bg-red-600 text-white hover:bg-white hover:text-black'}`}
                    >
                        {isLocked ? "System Locked" : loading ? "Establishing..." : (isLogin ? "Execute Login" : "Initialize Account")}
                    </button>
                </form>

                <p className="text-center text-[10px] font-bold text-gray-600 uppercase tracking-tight mt-8">
                    {isLogin ? "Unauthorized user?" : "Existing operative?"}
                    <button onClick={() => setIsLogin(!isLogin)} className="ml-2 text-red-500 hover:text-white transition-all underline decoration-red-900">
                        {isLogin ? "Create Credentials" : "Return to Console"}
                    </button>
                </p>
            </div>
        </div>
        
    );
};

export default Auth;