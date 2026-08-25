import React, { useEffect, useState } from 'react';
import { FiMail, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { subscribeNewsletterAPI } from '../../../src/api/authAndAdminApi';

const DISMISS_KEY = 'aaramdehi_blog_email_popup_dismissed';

export default function BlogEmailPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const closePopup = () => {
    sessionStorage.setItem(DISMISS_KEY, 'true');
    setVisible(false);
  };

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY) === 'true') return undefined;

    const timer = window.setTimeout(() => setVisible(true), 1200);
    const handleEscape = (event) => {
      if (event.key === 'Escape') closePopup();
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await subscribeNewsletterAPI(normalizedEmail, 'blog_popup');
      if (!response?.success) throw new Error(response?.message || 'Unable to subscribe right now.');
      toast.success('Thanks for subscribing to Aaramdehi!');
      closePopup();
    } catch (error) {
      toast.error(error.message || 'Unable to subscribe right now.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closePopup();
      }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm"
    >
      <section role="dialog" aria-modal="true" aria-labelledby="blog-email-popup-title" className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <button type="button" onClick={closePopup} aria-label="Close email subscription popup" className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900">
          <FiX size={20} />
        </button>
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-900">
          <FiMail size={22} />
        </div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Aaramdehi Journal</p>
        <h2 id="blog-email-popup-title" className="mt-2 pr-8 text-2xl font-black leading-tight text-blue-950">Get more comfort in your inbox</h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">Receive practical home comfort tips, styling ideas, and new article updates.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <label htmlFor="blog-popup-email" className="sr-only">Email address</label>
          <input
            id="blog-popup-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email address"
            autoComplete="email"
            required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-100"
          />
          <button type="submit" disabled={submitting} className="w-full rounded-xl bg-blue-900 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? 'Subscribing...' : 'Subscribe to Journal'}
          </button>
        </form>
        <button type="button" onClick={closePopup} className="mt-4 w-full text-center text-xs font-bold text-gray-400 transition hover:text-gray-700">No thanks</button>
      </section>
    </div>
  );
}
