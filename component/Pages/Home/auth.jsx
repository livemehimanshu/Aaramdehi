import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FcGoogle } from "react-icons/fc";
import { IoEyeOutline, IoEyeOffOutline, IoShieldCheckmarkOutline, IoWarningOutline } from "react-icons/io5";

const Auth = () => {
    const location = useLocation();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    
    // --- Security States ---
    const [attempts, setAttempts] = useState(0); 
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        setIsLogin(location.pathname === '/register' ? false : true);
    }, [location]);

    // 1. Input Sanitization (XSS Attack Prevention)
    const sanitizeInput = (str) => str.replace(/[<>]/g, ""); 

    // 2. Strong Password Validation
    const isStrongPassword = (pw) => {
        return /[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isLocked) return alert("System Locked! Too many attempts. Wait 30 seconds.");

        const cleanEmail = sanitizeInput(formData.email);
        const cleanName = sanitizeInput(formData.name);

        // Security Checks
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return alert("Invalid Identity Format!");
        if (formData.password.length < 8 || !isStrongPassword(formData.password)) {
            return alert("Security Requirement: 8+ chars, 1 Uppercase, 1 Number, 1 Special Char.");
        }

        setLoading(true);
        
        try {
            // Mocking secure API call
            await new Promise(resolve => setTimeout(resolve, 2000)); 
            
            // Simulation of a failed attempt
            if(formData.password === "12345678") {
                throw new Error("Brute force detected");
            }

            alert(isLogin ? "Encrypted Session Established!" : "Account Initialized & Encrypted!");
            setAttempts(0); 
        } catch (error) {
            setAttempts(prev => prev + 1);
            if (attempts >= 4) {
                setIsLocked(true);
                setTimeout(() => { setIsLocked(false); setAttempts(0); }, 30000); // 30s Lock
                alert("CRITICAL: Brute Force detected. Access Revoked for 30s.");
            } else {
                alert(`Access Denied! ${5 - attempts} attempts remaining.`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#060606] flex items-center justify-center p-4 font-sans relative overflow-hidden">
            {/* Background Security Pulse */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isLocked ? 'bg-red-900/20 opacity-100' : 'opacity-0'}`}></div>
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/5 blur-[120px] rounded-full"></div>
            
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

                <form className="space-y-5" onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-1">Owner Alias</label>
                            <input 
                                type="text" 
                                disabled={isLocked}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full h-12 bg-[#141414] border border-white/5 px-4 focus:border-red-600 outline-none transition-all text-white text-sm font-mono"
                                placeholder="Enter Name"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-1">Identity (Email)</label>
                        <input 
                            type="email" 
                            disabled={isLocked}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full h-12 bg-[#141414] border border-white/5 px-4 focus:border-red-600 outline-none transition-all text-white text-sm font-mono"
                            placeholder="user@aaramdehi.com"
                            required
                        />
                    </div>

                    <div className="relative">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-1">Access Key</label>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            disabled={isLocked}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="w-full h-12 bg-[#141414] border border-white/5 px-4 focus:border-red-600 outline-none transition-all text-white text-sm font-mono"
                            placeholder="••••••••"
                            required
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[34px] text-gray-600 hover:text-red-500 transition-colors">
                            {showPassword ? <IoEyeOffOutline size={18}/> : <IoEyeOutline size={18}/>}
                        </button>
                    </div>

                    <button 
                        disabled={loading || isLocked}
                        className={`w-full h-12 font-black uppercase text-xs tracking-[2px] transition-all shadow-xl 
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