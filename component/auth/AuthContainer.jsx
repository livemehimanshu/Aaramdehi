import React, { useState, useEffect } from 'react';
import { IoMailOutline, IoLockClosedOutline, IoEyeOutline, IoEyeOffOutline, IoArrowBack, IoCheckmarkOutline, IoPersonOutline } from "react-icons/io5";
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContainer = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [view, setView] = useState('login'); // 'login', 'register', 'forgotPassword', 'otp', 'resetPassword'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [userEmail, setUserEmail] = useState(''); // Track email for password reset

    // Set initial view based on route
    useEffect(() => {
        if (location.pathname === '/register') {
            setView('register');
        } else {
            setView('login');
        }
    }, [location.pathname]);

    // Validate email format
    const validateEmail = (emailValue) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue) || /^\d{10}$/.test(emailValue);
    };

    // Handle Login
    const handleLogin = () => {
        const newErrors = {};

        if (!email) {
            newErrors.email = 'Email or Phone is required';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Enter a valid email or 10-digit phone number';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            setLoading(true);

            // Simulate API call
            setTimeout(() => {
                localStorage.setItem('authToken', 'user_' + Math.random().toString(36).substr(2, 9));
                localStorage.setItem('userEmail', email);
                window.dispatchEvent(new Event('userLoggedIn'));

                navigate('/');
                setLoading(false);
            }, 1500);
        }
    };

    // Handle Registration
    const handleRegister = () => {
        const newErrors = {};

        if (!fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }

        if (!email) {
            newErrors.email = 'Email or Phone is required';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Enter a valid email or 10-digit phone number';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Confirm password is required';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            setLoading(true);

            // Simulate API call
            setTimeout(() => {
                localStorage.setItem('authToken', 'user_' + Math.random().toString(36).substr(2, 9));
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userName', fullName);
                window.dispatchEvent(new Event('userLoggedIn'));

                navigate('/');
                setLoading(false);
            }, 1500);
        }
    };

    // Handle Forgot Password
    const handleForgotPassword = () => {
        const newErrors = {};

        if (!email) {
            newErrors.email = 'Email or Phone is required';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Enter a valid email or 10-digit phone number';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            setLoading(true);

            // Simulate API call
            setTimeout(() => {
                setUserEmail(email);
                setView('otp');
                setLoading(false);
                setOtpValues(['', '', '', '', '', '']);
            }, 1500);
        }
    };

    // Handle OTP Change
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return; // Only allow digits

        const newOtpValues = [...otpValues];
        newOtpValues[index] = value.slice(-1); // Keep only last digit
        setOtpValues(newOtpValues);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    // Handle OTP Backspace
    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    // Handle OTP Verification
    const handleVerifyOtp = () => {
        const otp = otpValues.join('');

        if (!otp || otp.length < 6) {
            setErrors({ otp: 'Please enter all 6 digits' });
            return;
        }

        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            if (otp === '123456') { // Demo OTP
                setView('resetPassword');
                setLoading(false);
            } else {
                setErrors({ otp: 'Invalid OTP. Try again.' });
                setLoading(false);
            }
        }, 1500);
    };

    // Handle Password Reset
    const handleResetPassword = () => {
        const newPassword = document.getElementById('newPassword')?.value || '';
        const confirmPassword = document.getElementById('confirmPassword')?.value || '';
        const newErrors = {};

        if (!newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Confirm password is required';
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            setLoading(true);

            // Simulate API call
            setTimeout(() => {
                localStorage.setItem('authToken', 'user_' + Math.random().toString(36).substr(2, 9));
                localStorage.setItem('userEmail', userEmail);
                window.dispatchEvent(new Event('userLoggedIn'));

                navigate('/');
                setLoading(false);
            }, 1500);
        }
    };

    return (
        <section className="min-h-screen bg-gradient-to-b from-gray-100 to-white flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                {/* Login View */}
                {view === 'login' && (
                    <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100">
                        <div className="mb-8">
                            <h1 className="text-3xl font-black text-gray-900 text-center">Aaramdehi</h1>
                            <p className="text-gray-600 text-center text-sm mt-2">Login to Your Account</p>
                        </div>

                        <div className="space-y-5">
                            {/* Email/Phone Input */}
                            <div>
                                <label className="text-sm font-bold text-gray-700 block mb-2">Email or Phone Number</label>
                                <div className="relative">
                                    <IoMailOutline className="absolute left-4 top-3.5 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Enter email or 10-digit phone"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setErrors({ ...errors, email: '' });
                                        }}
                                        className={`w-full pl-12 pr-4 py-3 border rounded-md text-sm focus:outline-none transition-colors ${
                                            errors.email
                                                ? 'border-red-500 focus:border-red-600 bg-red-50'
                                                : 'border-gray-300 focus:border-red-500 bg-white'
                                        }`}
                                    />
                                </div>
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>

                            {/* Password Input */}
                            <div>
                                <label className="text-sm font-bold text-gray-700 block mb-2">Password</label>
                                <div className="relative">
                                    <IoLockClosedOutline className="absolute left-4 top-3.5 text-gray-400" size={20} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setErrors({ ...errors, password: '' });
                                        }}
                                        className={`w-full pl-12 pr-12 py-3 border rounded-md text-sm focus:outline-none transition-colors ${
                                            errors.password
                                                ? 'border-red-500 focus:border-red-600 bg-red-50'
                                                : 'border-gray-300 focus:border-red-500 bg-white'
                                        }`}
                                    />
                                    <button
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                            </div>

                            {/* Forgot Password Link */}
                            <button
                                onClick={() => {
                                    setView('forgotPassword');
                                    setEmail('');
                                    setErrors({});
                                }}
                                className="text-red-500 text-sm font-bold hover:text-red-600 transition-colors"
                            >
                                Forgot Password?
                            </button>

                            {/* Login Button */}
                            <button
                                onClick={handleLogin}
                                disabled={loading}
                                className="w-full bg-red-500 text-white py-3 rounded-md font-bold uppercase tracking-widest hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
                            >
                                {loading ? 'Signing In...' : 'Sign In'}
                            </button>

                            {/* Divider */}
                            <div className="flex items-center gap-4 my-6">
                                <div className="flex-1 h-px bg-gray-200"></div>
                                <span className="text-gray-600 text-sm">New to Aaramdehi?</span>
                                <div className="flex-1 h-px bg-gray-200"></div>
                            </div>

                            {/* Sign Up Link */}
                            <button
                                onClick={() => navigate('/register')}
                                className="w-full border-2 border-gray-300 text-gray-900 py-3 rounded-md font-bold uppercase tracking-widest hover:border-red-500 hover:text-red-500 transition-colors"
                            >
                                Create Account
                            </button>
                        </div>
                    </div>
                )}

                {/* Register View */}
                {view === 'register' && (
                    <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100">
                        <div className="mb-8">
                            <h1 className="text-3xl font-black text-gray-900 text-center">Aaramdehi</h1>
                            <p className="text-gray-600 text-center text-sm mt-2">Create Your Account</p>
                        </div>

                        <div className="space-y-5">
                            {/* Full Name Input */}
                            <div>
                                <label className="text-sm font-bold text-gray-700 block mb-2">Full Name</label>
                                <div className="relative">
                                    <IoPersonOutline className="absolute left-4 top-3.5 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={fullName}
                                        onChange={(e) => {
                                            setFullName(e.target.value);
                                            setErrors({ ...errors, fullName: '' });
                                        }}
                                        className={`w-full pl-12 pr-4 py-3 border rounded-md text-sm focus:outline-none transition-colors ${
                                            errors.fullName
                                                ? 'border-red-500 focus:border-red-600 bg-red-50'
                                                : 'border-gray-300 focus:border-red-500 bg-white'
                                        }`}
                                    />
                                </div>
                                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                            </div>

                            {/* Email/Phone Input */}
                            <div>
                                <label className="text-sm font-bold text-gray-700 block mb-2">Email or Phone Number</label>
                                <div className="relative">
                                    <IoMailOutline className="absolute left-4 top-3.5 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Enter email or 10-digit phone"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setErrors({ ...errors, email: '' });
                                        }}
                                        className={`w-full pl-12 pr-4 py-3 border rounded-md text-sm focus:outline-none transition-colors ${
                                            errors.email
                                                ? 'border-red-500 focus:border-red-600 bg-red-50'
                                                : 'border-gray-300 focus:border-red-500 bg-white'
                                        }`}
                                    />
                                </div>
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>

                            {/* Password Input */}
                            <div>
                                <label className="text-sm font-bold text-gray-700 block mb-2">Password</label>
                                <div className="relative">
                                    <IoLockClosedOutline className="absolute left-4 top-3.5 text-gray-400" size={20} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Create a password (min 6 chars)"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setErrors({ ...errors, password: '' });
                                        }}
                                        className={`w-full pl-12 pr-12 py-3 border rounded-md text-sm focus:outline-none transition-colors ${
                                            errors.password
                                                ? 'border-red-500 focus:border-red-600 bg-red-50'
                                                : 'border-gray-300 focus:border-red-500 bg-white'
                                        }`}
                                    />
                                    <button
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                            </div>

                            {/* Confirm Password Input */}
                            <div>
                                <label className="text-sm font-bold text-gray-700 block mb-2">Confirm Password</label>
                                <div className="relative">
                                    <IoLockClosedOutline className="absolute left-4 top-3.5 text-gray-400" size={20} />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Re-enter password"
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            setErrors({ ...errors, confirmPassword: '' });
                                        }}
                                        className={`w-full pl-12 pr-12 py-3 border rounded-md text-sm focus:outline-none transition-colors ${
                                            errors.confirmPassword
                                                ? 'border-red-500 focus:border-red-600 bg-red-50'
                                                : 'border-gray-300 focus:border-red-500 bg-white'
                                        }`}
                                    />
                                    <button
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                            </div>

                            {/* Sign Up Button */}
                            <button
                                onClick={handleRegister}
                                disabled={loading}
                                className="w-full bg-red-500 text-white py-3 rounded-md font-bold uppercase tracking-widest hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>

                            {/* Divider */}
                            <div className="flex items-center gap-4 my-6">
                                <div className="flex-1 h-px bg-gray-200"></div>
                                <span className="text-gray-600 text-sm">Already a member?</span>
                                <div className="flex-1 h-px bg-gray-200"></div>
                            </div>

                            {/* Sign In Link */}
                            <button
                                onClick={() => {
                                    setView('login');
                                    setEmail('');
                                    setFullName('');
                                    setPassword('');
                                    setConfirmPassword('');
                                    setErrors({});
                                }}
                                className="w-full border-2 border-gray-300 text-gray-900 py-3 rounded-md font-bold uppercase tracking-widest hover:border-red-500 hover:text-red-500 transition-colors"
                            >
                                Sign In
                            </button>
                        </div>
                    </div>
                )}

                {/* Forgot Password View */}
                {view === 'forgotPassword' && (
                    <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100">
                        <button
                            onClick={() => {
                                setView('login');
                                setEmail('');
                                setErrors({});
                            }}
                            className="flex items-center gap-2 text-gray-600 text-sm font-bold mb-6 hover:text-gray-900"
                        >
                            <IoArrowBack size={18} />
                            Back to Login
                        </button>

                        <div className="mb-8">
                            <h1 className="text-2xl font-black text-gray-900">Reset Password</h1>
                            <p className="text-gray-600 text-sm mt-2">Enter your email or phone to receive an OTP</p>
                        </div>

                        <div className="space-y-5">
                            {/* Email/Phone Input */}
                            <div>
                                <label className="text-sm font-bold text-gray-700 block mb-2">Email or Phone Number</label>
                                <div className="relative">
                                    <IoMailOutline className="absolute left-4 top-3.5 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Enter email or 10-digit phone"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setErrors({ ...errors, email: '' });
                                        }}
                                        className={`w-full pl-12 pr-4 py-3 border rounded-md text-sm focus:outline-none transition-colors ${
                                            errors.email
                                                ? 'border-red-500 focus:border-red-600 bg-red-50'
                                                : 'border-gray-300 focus:border-red-500 bg-white'
                                        }`}
                                    />
                                </div>
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>

                            {/* Send OTP Button */}
                            <button
                                onClick={handleForgotPassword}
                                disabled={loading}
                                className="w-full bg-red-500 text-white py-3 rounded-md font-bold uppercase tracking-widest hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </div>
                    </div>
                )}

                {/* OTP Verification View */}
                {view === 'otp' && (
                    <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100">
                        <button
                            onClick={() => {
                                setView('forgotPassword');
                                setOtpValues(['', '', '', '', '', '']);
                                setErrors({});
                            }}
                            className="flex items-center gap-2 text-gray-600 text-sm font-bold mb-6 hover:text-gray-900"
                        >
                            <IoArrowBack size={18} />
                            Back
                        </button>

                        <div className="mb-8">
                            <h1 className="text-2xl font-black text-gray-900">Verify OTP</h1>
                            <p className="text-gray-600 text-sm mt-2">Enter the 6-digit OTP sent to your {email.includes('@') ? 'email' : 'phone'}</p>
                        </div>

                        <div className="space-y-6">
                            {/* OTP Inputs */}
                            <div className="flex gap-2 justify-center">
                                {otpValues.map((value, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength="1"
                                        value={value}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-md focus:outline-none transition-colors ${
                                            errors.otp
                                                ? 'border-red-500 focus:border-red-600 bg-red-50'
                                                : 'border-gray-300 focus:border-red-500 bg-white'
                                        }`}
                                    />
                                ))}
                            </div>

                            {errors.otp && <p className="text-center text-red-500 text-sm">{errors.otp}</p>}

                            {/* Demo OTP Hint */}
                            <p className="text-center text-xs text-gray-500 bg-gray-50 p-3 rounded">
                                Demo OTP: <span className="font-bold text-gray-700">123456</span>
                            </p>

                            {/* Verify Button */}
                            <button
                                onClick={handleVerifyOtp}
                                disabled={loading}
                                className="w-full bg-red-500 text-white py-3 rounded-md font-bold uppercase tracking-widest hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? 'Verifying...' : 'Verify & Proceed'}
                            </button>

                            {/* Resend OTP */}
                            <p className="text-center text-sm text-gray-600">
                                Didn't receive OTP?{' '}
                                <button className="text-red-500 font-bold hover:text-red-600">Resend</button>
                            </p>
                        </div>
                    </div>
                )}

                {/* Reset Password View */}
                {view === 'resetPassword' && (
                    <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100">
                        <div className="flex justify-center mb-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <IoCheckmarkOutline size={32} className="text-green-600" />
                            </div>
                        </div>

                        <div className="mb-8">
                            <h1 className="text-2xl font-black text-gray-900 text-center">Create New Password</h1>
                            <p className="text-gray-600 text-sm mt-2 text-center">Set a strong password for your account</p>
                        </div>

                        <div className="space-y-5">
                            {/* New Password */}
                            <div>
                                <label className="text-sm font-bold text-gray-700 block mb-2">New Password</label>
                                <div className="relative">
                                    <IoLockClosedOutline className="absolute left-4 top-3.5 text-gray-400" size={20} />
                                    <input
                                        id="newPassword"
                                        type="password"
                                        placeholder="Enter new password"
                                        onChange={() => setErrors({ ...errors, newPassword: '' })}
                                        className={`w-full pl-12 pr-4 py-3 border rounded-md text-sm focus:outline-none transition-colors ${
                                            errors.newPassword
                                                ? 'border-red-500 focus:border-red-600 bg-red-50'
                                                : 'border-gray-300 focus:border-red-500 bg-white'
                                        }`}
                                    />
                                </div>
                                {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="text-sm font-bold text-gray-700 block mb-2">Confirm Password</label>
                                <div className="relative">
                                    <IoLockClosedOutline className="absolute left-4 top-3.5 text-gray-400" size={20} />
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Confirm password"
                                        onChange={() => setErrors({ ...errors, confirmPassword: '' })}
                                        className={`w-full pl-12 pr-4 py-3 border rounded-md text-sm focus:outline-none transition-colors ${
                                            errors.confirmPassword
                                                ? 'border-red-500 focus:border-red-600 bg-red-50'
                                                : 'border-gray-300 focus:border-red-500 bg-white'
                                        }`}
                                    />
                                </div>
                                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                            </div>

                            {/* Reset Password Button */}
                            <button
                                onClick={handleResetPassword}
                                disabled={loading}
                                className="w-full bg-red-500 text-white py-3 rounded-md font-bold uppercase tracking-widest hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default AuthContainer;
