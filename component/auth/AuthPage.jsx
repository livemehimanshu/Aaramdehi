import React, { useState, useEffect } from 'react';
import { IoMailOutline, IoLockClosedOutline, IoEyeOutline, IoEyeOffOutline, IoArrowBack, IoCallOutline, IoPersonOutline } from 'react-icons/io5';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, signupSchema, forgotPasswordSchema, resetPasswordSchema } from '../../src/schemas/validationSchemas';
import toast from 'react-hot-toast';
import { loginAPI, signupAPI, forgotPasswordAPI, verifyOTPAPI, resetPasswordAPI } from '../../src/api/authAndAdminApi';

const AuthPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [view, setView] = useState('login'); // login, signup, forgot, otp, reset
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [otpFlow, setOtpFlow] = useState('signup'); // 'signup' ya 'forgot-password'

    useEffect(() => {
        const path = location.pathname.toLowerCase();
        if (path.includes('/signup') || path.includes('/register')) {
            setView('signup');
        } else if (path.includes('/login')) {
            setView('login');
        }
    }, [location.pathname]);

    // --- States ---
    const [forgotEmail, setForgotEmail] = useState('');
    const [otp, setOtp] = useState('');

    // ✅ Setup React Hook Form for Login
    const { 
        register: loginRegister, 
        handleSubmit: handleLoginSubmit, 
        formState: { errors: loginErrors } 
    } = useForm({
        resolver: zodResolver(loginSchema)
    });

    // ✅ Setup React Hook Form for Signup
    const { 
        register: signupRegister, 
        handleSubmit: handleSignupSubmit, 
        formState: { errors: signupErrors },
        getValues: getSignupValues
    } = useForm({
        resolver: zodResolver(signupSchema)
    });

    // ✅ Setup React Hook Form for Forgot Password
    const { 
        register: forgotRegister, 
        handleSubmit: handleForgotSubmit, 
        formState: { errors: forgotErrors } 
    } = useForm({
        resolver: zodResolver(forgotPasswordSchema)
    });

    // ✅ Setup React Hook Form for Reset Password
    const { 
        register: resetRegister, 
        handleSubmit: handleResetSubmit, 
        formState: { errors: resetErrors } 
    } = useForm({
        resolver: zodResolver(resetPasswordSchema)
    });

    // ====== LOGIN LOGIC ======
    const onLogin = async (data) => {
        try {
            setLoading(true);
            const response = await loginAPI(data.email.toLowerCase().trim(), data.password);
            
            // Backend se milne wale tokens aur user details save karein
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('userData', JSON.stringify(response.user));
            toast.success(`Welcome back, ${response.user.name}!`);

            navigate('/');
        } catch (error) {
            // Check if it's an API error response
            const errorData = error.response?.data || error; 
            const message = typeof errorData.message === 'string' ? errorData.message : "Invalid Email or Password";

            // 403 status and needsVerification flag check
            if (error.response?.status === 403 && errorData?.needsVerification) {
                setForgotEmail(data.email.toLowerCase().trim());
                setOtpFlow('signup');
                setView('otp');
                toast.error(message);
            } else {
                toast.error(message);
            }
        } finally {
            setLoading(false);
        }
    };

    // ====== SIGNUP LOGIC ======
    const onSignup = async (data) => {
        try {
            setLoading(true);
            // Ensure all required backend fields are present and valid
            const payload = {
                name: (data.fullName || "").trim(),
                email: (data.email || "").toLowerCase().trim(),
                mobile: (data.phone || "0000000000").trim(),
                password: data.password,
                confirmPassword: data.confirmPassword
            };
            
            const response = await signupAPI(payload);

            if (response.needsVerification) {
                setForgotEmail(payload.email);
                setOtpFlow('signup');
                setOtp('');
                setView('otp');
                toast.success(response.message || "Email already registered but not verified. OTP has been resent.");
                return;
            }

            if (!response.success) {
                toast.error(response.message || "Signup failed. Please check your details.");
                return;
            }

            setForgotEmail(payload.email);
            setOtpFlow('signup');
            setOtp('');
            setView('otp');
            toast.success("OTP sent to your email!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Signup failed. Please check your details.");
        } finally {
            setLoading(false);
        }
    };

    // ====== FORGOT & RESET LOGIC ======
    const onForgotPassword = async (data) => {
        try {
            setLoading(true);
            const response = await forgotPasswordAPI(data.email.toLowerCase().trim());
            setForgotEmail(data.email.toLowerCase().trim());
            setOtpFlow('forgot-password');
            setView('otp');
            toast.success("Reset OTP sent to your email!");
        } catch (error) {
            const msg = error.response?.data?.message;
            toast.error(typeof msg === 'string' ? msg : "Email not found");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        try {
            setLoading(true);
            // Use trimmed OTP value from state
            const cleanOtp = otp.trim();
            if (!cleanOtp || cleanOtp.length < 6) {
                toast.error("Please enter a valid 6-digit OTP");
                return;
            }
            
            // For signup, verify OTP and auto-login
            if (otpFlow === 'signup') {
                const response = await verifyOTPAPI(forgotEmail.toLowerCase().trim(), cleanOtp); // Corrected to use cleanOtp
                if (response.user) {
                    localStorage.setItem('accessToken', response.accessToken);
                    localStorage.setItem('userData', JSON.stringify(response.user));
                    toast.success("Account verified successfully!");
                    
                    navigate('/');
                } else {
                    toast.success("OTP Verified!");
                }
            } else {
                setView('reset');
                toast.success("Please set your new password");
            }
        } catch (error) {
            const msg = error.response?.data?.message;
            toast.error(typeof msg === 'string' ? msg : "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    const onResetPassword = async (data) => {
        try {
            setLoading(true);
            if (!forgotEmail) {
                toast.error("Session expired. Please start again.");
                setView('forgot');
                return;
            }

            const response = await resetPasswordAPI(
                forgotEmail.toLowerCase().trim(), 
                otp.trim(), 
                data.newPassword, 
                data.confirmNewPassword
            );
            
            if (response.success) {
                toast.success('Password updated! Please login.');
                setOtp('');
                setForgotEmail('');
                setView('login');
            }
        } catch (error) {
            const msg = error.response?.data?.message;
            toast.error(typeof msg === 'string' ? msg : "Reset failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md bg-slate-900 rounded-2xl shadow-2xl shadow-black/50 p-8 border border-slate-800">
                
                {/* LOGIN VIEW */}
                {view === 'login' && (
                    <div className="animate-in fade-in duration-500">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-black text-red-500">Aaramdehi</h1>
                            <p className="text-slate-400 mt-2 font-medium">Welcome back, login to continue</p>
                            <p className="text-slate-500 text-sm mt-1">AES-256 Encryption Active</p>
                        </div>
                        <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
                            <div className="relative">
                                <IoMailOutline className="absolute left-4 top-4 text-slate-400" size={20} />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    {...loginRegister('email')}
                                    className={`w-full pl-12 pr-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all ${loginErrors.email ? 'border-red-500 bg-red-950 text-white' : 'border-slate-700 bg-slate-800 text-white'}`}
                                />
                                {loginErrors.email && <p className="text-red-500 text-[10px] mt-1 font-bold">{loginErrors.email.message}</p>}
                            </div>
                            <div className="relative">
                                <IoLockClosedOutline className="absolute left-4 top-4 text-slate-400" size={20} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    {...loginRegister('password')}
                                    className={`w-full pl-12 pr-12 py-3.5 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all ${loginErrors.password ? 'border-red-500 bg-red-50 text-white' : 'border-slate-700 bg-slate-800 text-white'}`}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-slate-400">
                                    {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                                </button>
                            </div>
                            {loginErrors.password && <p className="text-red-500 text-[10px] mt-1 font-bold">{loginErrors.password.message}</p>}
                            <button type="button" onClick={() => setView('forgot')} className="text-red-500 text-sm font-bold block ml-auto hover:underline">Forgot Password?</button>
                            <button type="submit" disabled={loading} className="w-full bg-red-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-600 active:scale-95 transition-all disabled:opacity-50">
                                {loading ? 'Checking...' : 'Sign In'}
                            </button>
                            <p className="text-center text-sm text-slate-300 mt-6">
                                Don't have an account? <button onClick={() => setView('signup')} className="text-red-500 font-bold hover:underline">Create Account</button>
                            </p>
                        </form>
                    </div>
                )}

                {/* SIGNUP VIEW */}
                {view === 'signup' && (
                    <div className="animate-in slide-in-from-right duration-500">
                        <button onClick={() => setView('login')} className="flex items-center gap-2 text-slate-400 text-sm font-bold mb-6 hover:text-red-500 transition-colors">
                            <IoArrowBack size={18} /> Back to Login
                        </button>
                        <h2 className="text-2xl font-black text-slate-100 mb-6">Join Aaramdehi</h2>
                        <form onSubmit={handleSignupSubmit(onSignup)} className="space-y-4">
                            <div className="relative">
                                <IoPersonOutline className="absolute left-4 top-4 text-slate-400" size={20} />
                                <input type="text" placeholder="Full Name" {...signupRegister('fullName')} className={`w-full pl-12 pr-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-white bg-slate-800 ${signupErrors.fullName ? 'border-red-500' : 'border-slate-700'}`} />
                            </div>
                            {signupErrors.fullName && <p className="text-red-500 text-[10px] font-bold">{signupErrors.fullName.message}</p>}

                            <div className="relative">
                                <IoMailOutline className="absolute left-4 top-4 text-slate-400" size={20} />
                                <input type="email" placeholder="Email Address" {...signupRegister('email')} className={`w-full pl-12 pr-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-white bg-slate-800 ${signupErrors.email ? 'border-red-500' : 'border-slate-700'}`} />
                            </div>
                            {signupErrors.email && <p className="text-red-500 text-[10px] font-bold">{signupErrors.email.message}</p>}

                            <div className="relative">
                                <IoCallOutline className="absolute left-4 top-4 text-slate-400" size={20} />
                                <input type="tel" placeholder="Mobile Number" {...signupRegister('phone')} className={`w-full pl-12 pr-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-white bg-slate-800 ${signupErrors.phone ? 'border-red-500' : 'border-slate-700'}`} />
                            </div>
                            {signupErrors.phone && <p className="text-red-500 text-[10px] font-bold">{signupErrors.phone.message}</p>}

                            <div className="relative">
                                <IoLockClosedOutline className="absolute left-4 top-4 text-slate-400" size={20} />
                                <input type="password" placeholder="Create Password" {...signupRegister('password')} className={`w-full pl-12 pr-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-white bg-slate-800 ${signupErrors.password ? 'border-red-500' : 'border-slate-700'}`} />
                            </div>
                            {signupErrors.password && <p className="text-red-500 text-[10px] font-bold">{signupErrors.password.message}</p>}

                            <div className="relative">
                                <IoLockClosedOutline className="absolute left-4 top-4 text-slate-400" size={20} />
                                <input type="password" placeholder="Confirm Password" {...signupRegister('confirmPassword')} className={`w-full pl-12 pr-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-white bg-slate-800 ${signupErrors.confirmPassword ? 'border-red-500' : 'border-slate-700'}`} />
                            </div>
                            {signupErrors.confirmPassword && <p className="text-red-500 text-[10px] font-bold">{signupErrors.confirmPassword.message}</p>}

                            <button type="submit" disabled={loading} className="w-full bg-red-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50">
                                {loading ? 'Registering...' : 'Create My Account'}
                            </button>
                        </form>
                    </div>
                )}

                {/* FORGOT/OTP/RESET VIEWS (Compact) */}
                {(view === 'forgot' || view === 'otp' || view === 'reset') && (
                    <div className="space-y-6">
                        <button type="button" onClick={() => setView('login')} className="flex items-center gap-2 text-slate-400 font-bold hover:text-red-500 transition-colors"><IoArrowBack /> Back</button>
                        <h2 className="text-2xl font-bold">{view === 'forgot' ? 'Reset Password' : view === 'otp' ? 'Verify OTP' : 'New Password'}</h2>
                        
                        {view === 'forgot' && (
                            <form onSubmit={handleForgotSubmit(onForgotPassword)} className="space-y-4">
                                <input type="email" placeholder="Enter Email" {...forgotRegister('email')} className={`w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-white bg-slate-800 ${forgotErrors.email ? 'border-red-500 bg-red-950 text-white' : 'border-slate-700'}`} />
                                {forgotErrors.email && <p className="text-red-500 text-[10px] font-bold">{forgotErrors.email.message}</p>}
                                <button type="submit" disabled={loading} className="w-full bg-red-500 text-white py-3.5 rounded-xl font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-all">
                                    {loading ? 'Processing...' : 'Send OTP'}
                                </button>
                            </form>
                        )}

                        {view === 'otp' && (
                            <div className="space-y-4">
                                <p className="text-sm text-slate-400">OTP sent to: {forgotEmail}</p>
                                <input type="text" maxLength="6" placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full p-4 text-center text-2xl tracking-[1rem] font-bold border rounded-xl outline-none bg-slate-800 text-white border-slate-700" />
                                <button onClick={handleVerifyOTP} disabled={loading} className="w-full bg-red-500 text-white py-3.5 rounded-xl font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-all">
                                    {loading ? 'Verifying...' : 'Verify OTP'}
                                </button>
                            </div>
                        )}
                        
                        {view === 'reset' && (
                            <form onSubmit={handleResetSubmit(onResetPassword)} className="space-y-4">
                                <div className="relative">
                                    <IoLockClosedOutline className="absolute left-4 top-4 text-slate-400" size={20} />
                                    <input type="password" placeholder="New Password" {...resetRegister('newPassword')} className={`w-full pl-12 pr-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-white bg-slate-800 ${resetErrors.newPassword ? 'border-red-500 bg-red-950 text-white' : 'border-slate-700'}`} />
                                </div>
                                {resetErrors.newPassword && <p className="text-red-500 text-[10px] font-bold">{resetErrors.newPassword.message}</p>}
                                
                                <div className="relative">
                                    <IoLockClosedOutline className="absolute left-4 top-4 text-slate-400" size={20} />
                                    <input type="password" placeholder="Confirm Password" {...resetRegister('confirmNewPassword')} className={`w-full pl-12 pr-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-white bg-slate-800 ${resetErrors.confirmNewPassword ? 'border-red-500 bg-red-950 text-white' : 'border-slate-700'}`} />
                                </div>
                                {resetErrors.confirmNewPassword && <p className="text-red-500 text-[10px] font-bold">{resetErrors.confirmNewPassword.message}</p>}
                                
                                <button type="submit" disabled={loading} className="w-full bg-red-500 text-white py-3.5 rounded-xl font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-all">
                                    {loading ? 'Updating...' : 'Update Password'}
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default AuthPage;