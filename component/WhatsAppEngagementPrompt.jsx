import React, { useEffect, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';
import { getPublicSettingsAPI } from '../src/api/authAndAdminApi';
import { createWhatsAppUrl } from '../src/utils/whatsapp';

export default function WhatsAppEngagementPrompt({ subject = 'this product', delay = 15000 }) {
  const [number, setNumber] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let active = true;
    getPublicSettingsAPI().then((response) => { if (active) setNumber(response.data?.AI_BLOGGER_WHATSAPP_NUMBER || ''); });
    const timer = window.setTimeout(() => setVisible(true), delay);
    return () => { active = false; window.clearTimeout(timer); };
  }, [delay]);

  if (!visible) return null;
  return <div className="fixed bottom-24 right-5 z-50 w-[min(22rem,calc(100vw-2.5rem))] rounded-2xl border border-green-100 bg-white p-4 shadow-2xl"><button type="button" onClick={() => setVisible(false)} aria-label="Close WhatsApp help" className="absolute right-3 top-3 text-gray-400 hover:text-gray-800"><FiX /></button><div className="flex gap-3"><FaWhatsapp className="mt-1 shrink-0 text-2xl text-[#25D366]" /><div><p className="pr-5 text-sm font-black text-gray-900">Need help with {subject}?</p><p className="mt-1 text-xs leading-relaxed text-gray-500">Chat with our team for quick product and delivery guidance.</p><a href={createWhatsAppUrl(`Hello Aaramdehi, I need help with ${subject}.`, number)} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex rounded-lg bg-[#25D366] px-3 py-2 text-xs font-black text-white hover:bg-[#1ebe5b]">Chat now</a></div></div></div>;
}
