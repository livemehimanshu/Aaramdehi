const whatsappNumber = String(import.meta.env.VITE_WHATSAPP_NUMBER || '918006594734').replace(/\D/g, '');

export const createWhatsAppUrl = (message, configuredNumber = whatsappNumber) => {
  const number = String(configuredNumber || '').replace(/\D/g, '');
  if (!number) return '';
  return `https://api.whatsapp.com/send?phone=${number}&text=${encodeURIComponent(message)}`;
};
