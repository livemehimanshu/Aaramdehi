import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { FiArrowLeft, FiCheck, FiLoader, FiMail, FiLock, FiUser, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { createFirebaseSessionAPI, loginAPI, saveFirebaseProfileAPI, signupAPI, verifyOTPAPI } from '../../src/api/authAndAdminApi';
import { auth } from '../../src/api/firebase.js';

const getReturnPath = (location) => {
  const returnPath = location.state?.from || new URLSearchParams(location.search).get('returnTo');
  if (typeof returnPath === 'string' && returnPath.startsWith('/')) return returnPath;
  if (returnPath?.pathname?.startsWith('/')) {
    return `${returnPath.pathname}${returnPath.search || ''}${returnPath.hash || ''}`;
  }
  return '/';
};

const FirebaseAuthPage = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState('method');
  const [authMode, setAuthMode] = useState(() => window.location.pathname.toLowerCase().includes('/signup') || window.location.pathname.toLowerCase().includes('/register') ? 'signup' : 'login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [user, setUser] = useState(null);
  const [backendSession, setBackendSession] = useState(null);
  const [profile, setProfile] = useState({ fullName: '', email: '' });
  const [loading, setLoading] = useState(() => Boolean(auth));
  const [action, setAction] = useState('');
  const [error, setError] = useState(() => auth ? '' : 'Authentication is temporarily unavailable. Please try again later.');

  const closeOrGoBack = () => {
    if (onClose) {
      onClose();
      return;
    }
    navigate(-1);
  };

  const finishAuthentication = async (authenticatedUser) => {
    try {
      const sessionResponse = await createFirebaseSessionAPI(await authenticatedUser.getIdToken());
      if (!sessionResponse?.success) throw new Error('Backend session was not created.');
      setBackendSession(sessionResponse);
    } catch {
      toast.error('Signed in, but account services are temporarily unavailable.');
    }
    setUser(authenticatedUser);
    setProfile({
      fullName: authenticatedUser.displayName || '',
      email: authenticatedUser.email || ''
    });
    setStep('profile-check');
  };

  useEffect(() => {
    if (!auth) {
      return undefined;
    }

    let active = true;
    const initializeAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        await getRedirectResult(auth);
      } catch (authError) {
        if (authError.code !== 'auth/no-auth-event') {
          setError('Unable to initialize authentication. Please refresh and try again.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    initializeAuth();
    const unsubscribe = onAuthStateChanged(auth, (authenticatedUser) => {
      if (active && authenticatedUser) finishAuthentication(authenticatedUser);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (step !== 'profile-check' || !user || !backendSession) return;

    let active = true;
    const loadProfile = async () => {
      setLoading(true);
      setError('');
      try {
        if (!active) return;
        if (backendSession.profileExists) {
          localStorage.setItem('userData', JSON.stringify({ uid: user.uid, ...(backendSession.profile || {}) }));
          window.dispatchEvent(new Event('userDataUpdated'));
          toast.success('Welcome back to Aaramdehi!');
          navigate(getReturnPath(location), { replace: true });
        } else {
          setProfile((currentProfile) => ({
            fullName: backendSession.profile?.fullName || currentProfile.fullName,
            email: backendSession.profile?.email || currentProfile.email
          }));
          setStep('profile');
        }
      } catch {
        if (active) setError('We could not load your profile. Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();
    return () => { active = false; };
  }, [step, user, backendSession, location, navigate]);

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setAction('google');
    setError('');
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (authError) {
      if (authError.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setAction('');
    }
  };

  const handleEmailAuth = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || password.length < 6 || (authMode === 'signup' && fullName.trim().length < 2)) {
      setError(authMode === 'signup' ? 'Enter your name, a valid email, and a password of at least 6 characters.' : 'Enter a valid email and password of at least 6 characters.');
      return;
    }

    setAction('email');
    setError('');
    try {
      if (authMode === 'signup') {
        const response = await signupAPI({ name: fullName.trim(), email: normalizedEmail, mobile: '', password, confirmPassword: password });
        if (!response.success && !response.needsVerification) throw new Error(response.message || 'Signup failed.');
        setEmail(normalizedEmail);
        setOtp('');
        setStep('otp');
        toast.success(response.message || 'OTP sent to your email.');
      } else {
        const response = await loginAPI(normalizedEmail, password);
        if (!response?.success) throw new Error(response?.message || 'Login failed.');
        localStorage.setItem('userData', JSON.stringify(response.user));
        window.dispatchEvent(new Event('userDataUpdated'));
        toast.success(`Welcome back, ${response.user?.name || 'User'}!`);
        navigate(getReturnPath(location), { replace: true });
      }
    } catch (authError) {
      const errorData = authError.response?.data || {};
      if (authError.response?.status === 403 && errorData.needsVerification) {
        setEmail(normalizedEmail);
        setOtp('');
        setStep('otp');
        toast.success(errorData.message || 'OTP sent. Please verify your email.');
      } else {
        setError(errorData.message || authError.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setAction('');
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setError('Enter the 6-digit OTP sent to your email.');
      return;
    }

    setAction('otp');
    setError('');
    try {
      const response = await verifyOTPAPI(email, otp);
      if (!response?.success) throw new Error(response?.message || 'OTP verification failed.');
      localStorage.setItem('userData', JSON.stringify(response.user));
      window.dispatchEvent(new Event('userDataUpdated'));
      toast.success('Email verified successfully!');
      navigate(getReturnPath(location), { replace: true });
    } catch {
      setError('Invalid or expired OTP. Please try again.');
    } finally {
      setAction('');
    }
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    const fullName = profile.fullName.trim();
    const email = profile.email.trim().toLowerCase();
    if (fullName.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter your full name and a valid email address.');
      return;
    }

    setAction('profile');
    setError('');
    try {
      const response = await saveFirebaseProfileAPI({
        idToken: await user.getIdToken(),
        fullName,
        email
      });
      if (!response?.success) throw new Error('Profile save failed.');
      localStorage.setItem('userData', JSON.stringify({ ...response.profile, uid: user.uid }));
      window.dispatchEvent(new Event('userDataUpdated'));
      toast.success('Welcome to Aaramdehi!');
      navigate(getReturnPath(location), { replace: true });
    } catch {
      setError('Profile could not be saved. Please try again.');
    } finally {
      setAction('');
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
    setStep('method');
    setProfile({ fullName: '', email: '' });
  };

  if (loading && step === 'method') {
    return <AuthShell><LoadingState /></AuthShell>;
  }

  return (
    <AuthShell onClose={closeOrGoBack}>
      <div className="mb-7 flex items-start justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-red-400">Aaramdehi account</p>
          <h1 className="text-3xl font-black text-white">{step === 'otp' ? 'Verify your email' : step === 'profile' ? 'Almost there' : authMode === 'signup' ? 'Create your account' : 'Welcome back'}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">{step === 'otp' ? `Enter the code sent to ${email}` : 'Sign in faster to save your comfort picks.'}</p>
        </div>
        <button type="button" onClick={closeOrGoBack} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white" aria-label="Close authentication"><FiX size={20} /></button>
      </div>

      {error && <div role="alert" className="mb-4 rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">{error}</div>}

      {step === 'method' && (
        <div className="space-y-4">
          <button type="button" onClick={handleGoogleSignIn} disabled={Boolean(action)} className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3.5 font-bold text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60">
            {action === 'google' ? <FiLoader className="animate-spin" /> : <span className="text-lg font-black">G</span>}
            Continue with Google
          </button>
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-slate-500"><span className="h-px flex-1 bg-slate-700" />or<span className="h-px flex-1 bg-slate-700" /></div>
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {authMode === 'signup' && <><label htmlFor="full-name" className="text-sm font-semibold text-slate-300">Full Name</label><div className="relative"><FiUser className="absolute left-4 top-4 text-slate-500" /><input id="full-name" type="text" autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your full name" className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3.5 pl-11 pr-4 text-white outline-none transition focus:border-red-400" /></div></>}
            <label htmlFor="email-address" className="text-sm font-semibold text-slate-300">Email Address</label>
            <div className="relative"><FiMail className="absolute left-4 top-4 text-slate-500" /><input id="email-address" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3.5 pl-11 pr-4 text-white outline-none transition focus:border-red-400" /></div>
            <label htmlFor="email-password" className="text-sm font-semibold text-slate-300">Password</label>
            <div className="relative"><FiLock className="absolute left-4 top-4 text-slate-500" /><input id="email-password" type="password" autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3.5 pl-11 pr-4 text-white outline-none transition focus:border-red-400" /></div>
            <button type="submit" disabled={Boolean(action)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3.5 font-bold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60">
              {action === 'email' && <FiLoader className="animate-spin" />} {authMode === 'signup' ? 'Create Account & Get OTP' : 'Login with Email'}
            </button>
          </form>
          <button type="button" onClick={() => { setAuthMode(authMode === 'signup' ? 'login' : 'signup'); setError(''); }} className="w-full pt-2 text-center text-sm font-semibold text-slate-400 hover:text-white">{authMode === 'signup' ? 'Already have an account? Login' : 'New to Aaramdehi? Create account'}</button>
          <p className="pt-2 text-center text-xs leading-5 text-slate-500">By continuing, you agree to Aaramdehi&apos;s terms and privacy policy.</p>
        </div>
      )}

      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <input type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit OTP" className="w-full rounded-xl border border-slate-700 bg-slate-800 p-4 text-center text-2xl font-bold tracking-[0.8em] text-white outline-none focus:border-red-400" autoFocus />
          <button type="submit" disabled={Boolean(action)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3.5 font-bold text-white disabled:opacity-60">{action === 'otp' && <FiLoader className="animate-spin" />} Verify & Continue</button>
          <button type="button" onClick={() => { setStep('method'); setOtp(''); }} className="flex w-full items-center justify-center gap-2 py-2 text-sm font-semibold text-slate-400 hover:text-white"><FiArrowLeft /> Back to email</button>
        </form>
      )}

      {step === 'profile-check' && <LoadingState label="Checking your profile..." />}

      {step === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div><label htmlFor="profile-name" className="mb-2 block text-sm font-semibold text-slate-300">Full Name</label><div className="relative"><FiUser className="absolute left-4 top-4 text-slate-500" /><input id="profile-name" value={profile.fullName} onChange={(event) => setProfile({ ...profile, fullName: event.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3.5 pl-11 pr-4 text-white outline-none focus:border-red-400" autoFocus /></div></div>
          <div><label htmlFor="profile-email" className="mb-2 block text-sm font-semibold text-slate-300">Email Address</label><div className="relative"><FiMail className="absolute left-4 top-4 text-slate-500" /><input id="profile-email" type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3.5 pl-11 pr-4 text-white outline-none focus:border-red-400" /></div></div>
          <button type="submit" disabled={Boolean(action)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3.5 font-bold text-white disabled:opacity-60">{action === 'profile' ? <FiLoader className="animate-spin" /> : <FiCheck />} Save & Continue</button>
        </form>
      )}

      {user && (step === 'profile' || step === 'profile-check') && <button type="button" onClick={handleSignOut} className="mt-4 w-full text-center text-xs font-semibold text-slate-500 hover:text-white">Use a different account</button>}
    </AuthShell>
  );
};

const AuthShell = ({ children, onClose }) => (
  <section className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8 text-white sm:py-12">
    <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/50 sm:p-8">
      {children}
      {!onClose && <div className="sr-only">Authentication</div>}
    </div>
  </section>
);

const LoadingState = ({ label = 'Loading secure sign-in...' }) => (
  <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 text-slate-400"><FiLoader className="animate-spin text-2xl text-red-400" /><span className="text-sm">{label}</span></div>
);

export default FirebaseAuthPage;