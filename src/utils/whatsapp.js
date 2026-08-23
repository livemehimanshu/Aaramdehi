const whatsappNumber = String(import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/\D/g, '');

export const createWhatsAppUrl = (message, configuredNumber = whatsappNumber) => {
  const number = String(configuredNumber || '').replace(/\D/g, '');
  const baseUrl = number ? `https://wa.me/${number}` : 'https://wa.me/';
  return `${baseUrl}?text=${encodeURIComponent(message)}`;
};
