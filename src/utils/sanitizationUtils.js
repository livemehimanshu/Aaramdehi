/**
 * Aaramdehi Sanitization Utilities
 */
export const sanitizationUtils = {
  sanitizeText: (text) => {
    if (!text) return "";
    // Basic HTML tag removal and whitespace cleaning
    return text.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
  }
};

export default sanitizationUtils;