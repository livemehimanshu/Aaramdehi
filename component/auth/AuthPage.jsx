import React, { useState } from 'react';
import { IoMailOutline, IoLockClosedOutline, IoEyeOutline, IoEyeOffOutline, IoArrowBack } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { loginAPI, signupAPI, forgotPasswordAPI, verifyOTPAPI, resetPasswordAPI } from '../../src/api/authAndAdminApi.js';

const AuthPage = () => {
    const navigate = useNavigate();
    const [view, setView] = useState('login'); // login, signup, forgot, otp, reset
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Login state
    const [loginData, setLoginData] = useState({ email: '', password: '' });

    // Signup state
    const [signupData, setSignupData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    // Forgot password state
    const [forgotEmail, setForgotEmail] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // ====== LOGIN ======
    const handleLogin = async () => {
        try {
            setLoading(true);
            const response = await loginAPI(loginData.email, loginData.password);
            localStorage.setItem('token', response.token);
            localStorage.setItem('userEmail', response.data.email);
            
            // Redirect based on role
            if (response.data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (error) {
            setErrors({ submit: error.message });
        } finally {
            setLoading(false);
        }
    };

    // ====== SIGNUP ======
    const handleSignup = async () => {
        try {
            const newErrors = {};
            if (!signupData.name) newErrors.name = 'Name required';
            if (!signupData.password) newErrors.password = 'Password required';
            if (signupData.password !== signupData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
            }

            setLoading(true);
            const response = await signupAPI(signupData);
            localStorage.setItem('token', response.token);
            localStorage.setItem('userEmail', response.data.email);
            navigate('/');
        } catch (error) {
            setErrors({ submit: error.message });
        } finally {
            setLoading(false);
        }
    };

    // ====== FORGOT PASSWORD ======
    const handleForgotPassword = async () => {
        try {
            setLoading(true);
            const response = await forgotPasswordAPI(forgotEmail);
            setView('otp');
            setErrors({});
        } catch (error) {
            setErrors({ submit: error.message });
        } finally {
            setLoading(false);
        }
    };

    // ====== VERIFY OTP ======
    const handleVerifyOTP = async () => {
        try {
            setLoading(true);
            const response = await verifyOTPAPI(forgotEmail, otp);
            setResetToken(response.resetToken);
            setView('reset');
            setErrors({});
        } catch (error) {
            setErrors({ submit: error.message });
        } finally {
            setLoading(false);
        }
    };

    // ====== RESET PASSWORD ======
    const handleResetPassword = async () => {
        try {
            setLoading(true);
            await resetPasswordAPI(forgotEmail, resetToken, newPassword, newPassword);
            alert('Password reset successful. Please login.');
            setView('login');
            setErrors({});
        } catch (error) {
            setErrors({ submit: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="min-h-screen bg-gradient-to-b from-gray-100 to-white flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* LOGIN VIEW */}
                {view === 'login' && (
                    <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100">
                        <div className="mb-8">
                            <h1 className="text-3xl font-black text-gray-900 text-center">Aaramdehi</h1>
                            <p className="text-gray-600 text-center text-sm mt-2">Login to Your Account</p>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="text-sm font-bold text-gray-700 block mb-2">Email</label>
                                <div className="relative">
                                    <IoMailOutline className="absolute left-4 top-3.5 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Enter email"
                                        value={loginData.email}
                                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                        className={`w-full pl-12 pr-4 py-3 border rounded-md focus:outline-none ${errors.email ? 'border-red-500' : 'border-gray-300 focus:border-red-500'}`}
                                    />
                                </div>
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="text-sm font-bold text-gray-700 block mb-2">Password</label>
                                <div className="relative">
                                    <IoLockClosedOutline className="absolute left-4 top-3.5 text-gray-400" size={20} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter password"
                                        value={loginData.password}
                                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                        className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-red-500"
                                    />
                                    <button
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-3.5 text-gray-400"
                                    >
                                        {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => setView('forgot')}
                                className="text-red-500 text-sm font-bold hover:text-red-600"
                            >
                                Forgot Password?
                            </button>

                            {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}

                            <button
                                onClick={handleLogin}
                                disabled={loading}
                                className="w-full bg-red-500 text-white py-3 rounded-md font-bold hover:bg-red-600 disabled:opacity-50"
                            >
                                {loading ? 'Signing In...' : 'Sign In'}
                            </button>

                            <div className="flex items-center gap-4 my-6">
                                <div className="flex-1 h-px bg-gray-200"></div>
                                <span className="text-gray-600 text-sm">New to Aaramdehi?</span>
                                <div className="flex-1 h-px bg-gray-200"></div>
                            </div>

                            <button
                                onClick={() => setView('signup')}
                                className="w-full border-2 border-gray-300 text-gray-900 py-3 rounded-md font-bold hover:border-red-500 hover:text-red-500"
                            >
                                Create Account
                            </button>
                        </div>
                    </div>
                )}

                {/* SIGNUP VIEW */}
                {view === 'signup' && (
                    <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100">
                        <button
                            onClick={() => { setView('login'); setErrors({}); }}
                            className="flex items-center gap-2 text-gray-600 text-sm font-bold mb-6 hover:text-gray-900"
                        >
                            <IoArrowBack size={18} /> Back to Login
                        </button>

                        <div className="mb-8">
                            <h1 className="text-2xl font-black text-gray-900">Create Account</h1>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={signupData.name}
                                onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-red-500"
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={signupData.email}
                                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-red-500"
                            />
                            <input
                                type="tel"
                                placeholder="Phone"
                                value={signupData.phone}
                                onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-red-500"
                            />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={signupData.password}
                                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-red-500"
                            />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Confirm Password"
                                value={signupData.confirmPassword}
                                onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-red-500"
                            />

                            {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}

                            <button
                                onClick={handleSignup}
                                disabled={loading}
                                className="w-full bg-red-500 text-white py-3 rounded-md font-bold hover:bg-red-600 disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Create Account'}
                            </button>
                        </div>
                    </div>
                )}

                {/* FORGOT PASSWORD VIEW */}
                {view === 'forgot' && (
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <button
                            onClick={() => { setView('login'); setErrors({}); }}
                            className="flex items-center gap-2 text-gray-600 text-sm font-bold mb-6"
                        >
                            <IoArrowBack size={18} /> Back
                        </button>
                        
                        <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            className="w-full px-4 py-3 border rounded-md mb-4 focus:outline-none focus:border-red-500"
                        />

                        {errors.submit && <p className="text-red-500 text-sm mb-4">{errors.submit}</p>}

                        <button
                            onClick={handleForgotPassword}
                            disabled={loading}
                            className="w-full bg-red-500 text-white py-3 rounded-md font-bold hover:bg-red-600 disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </div>
                )}

                {/* OTP VIEW */}
                {view === 'otp' && (
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <h2 className="text-2xl font-bold mb-4">Enter OTP</h2>
                        <p className="text-gray-600 text-sm mb-4">OTP sent to {forgotEmail}</p>
                        <input
                            type="text"
                            placeholder="6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full px-4 py-3 border rounded-md mb-4 focus:outline-none focus:border-red-500"
                            maxLength="6"
                        />

                        {errors.submit && <p className="text-red-500 text-sm mb-4">{errors.submit}</p>}

                        <button
                            onClick={handleVerifyOTP}
                            disabled={loading}
                            className="w-full bg-red-500 text-white py-3 rounded-md font-bold hover:bg-red-600 disabled:opacity-50"
                        >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                    </div>
                )}

                {/* RESET PASSWORD VIEW */}
                {view === 'reset' && (
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <h2 className="text-2xl font-bold mb-4">Create New Password</h2>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 border rounded-md mb-4 focus:outline-none focus:border-red-500"
                        />

                        {errors.submit && <p className="text-red-500 text-sm mb-4">{errors.submit}</p>}

                        <button
                            onClick={handleResetPassword}
                            disabled={loading}
                            className="w-full bg-red-500 text-white py-3 rounded-md font-bold hover:bg-red-600 disabled:opacity-50"
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default AuthPage;
