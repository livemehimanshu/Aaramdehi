import React, { useEffect, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { getPublicSettingsAPI } from '../src/api/authAndAdminApi';
import { createWhatsAppUrl } from '../src/utils/whatsapp';

export default function WhatsAppFloatingButton() {
  const [number, setNumber] = useState('');

  useEffect(() => {
    getPublicSettingsAPI().then((response) => {
      if (response.success) setNumber(response.data?.AI_BLOGGER_WHATSAPP_NUMBER || '');
    });
  }, []);

  return (
    <a href={createWhatsAppUrl('Hello Aaramdehi, I need help choosing a product.', number)} target="_blank" rel="noopener noreferrer" aria-label="Chat with Aaramdehi on WhatsApp" className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-green-900/20 transition hover:scale-105 hover:bg-[#1ebe5b] focus:outline-none focus:ring-4 focus:ring-green-200">
      <FaWhatsapp size={30} />
    </a>
  );
}
