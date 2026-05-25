/**
 * 🛡️ Input Validation & Sanitization Utility
 * Prevents XSS, NoSQL Injection, and validates user inputs
 */

// Email validation (RFC 5322 simplified)
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password strength validation
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) errors.push('Password is required');
  if (password && password.length < 8) errors.push('Minimum 8 characters required');
  if (password && !/[A-Z]/.test(password)) errors.push('Uppercase letter (A-Z) required');
  if (password && !/[a-z]/.test(password)) errors.push('Lowercase letter (a-z) required');
  if (password && !/[0-9]/.test(password)) errors.push('Number (0-9) required');
  if (password && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('Special character (!@#$%^&*) required');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Phone number validation
export const validatePhone = (phone) => {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  const phoneRegex = /^\d{10,15}$/;
  return phoneRegex.test(cleaned);
};

// Name validation
export const validateName = (name) => {
  if (!name) return { isValid: false, error: 'Name is required' };
  if (name.length < 2) return { isValid: false, error: 'Name must be at least 2 characters' };
  if (name.length > 100) return { isValid: false, error: 'Name must be less than 100 characters' };
  
  // Allow only letters, numbers, spaces, hyphens, and apostrophes
  if (!/^[a-zA-Z0-9\s\-']+$/.test(name)) {
    return { isValid: false, error: 'Name contains invalid characters' };
  }
  
  return { isValid: true };
};

// General string sanitization (XSS prevention)
export const sanitizeString = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove < >
    .replace(/script/gi, '') // Remove script (case-insensitive)
    .replace(/javascript:/gi, '') // Remove javascript:
    .replace(/on\w+\s*=/gi, '') // Remove onclick=, onload= etc
    .replace(/eval\(/gi, '') // Remove eval
    .trim();
};

// Firebase key/ID validation
export const validateFirebaseId = (id) => {
  // Firebase keys are alphanumeric with - and _
  return typeof id === 'string' && /^[a-zA-Z0-9_-]{8,}$/.test(id);
};

// URL validation
export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// Cloudinary URL validation
export const validateCloudinaryUrl = (url) => {
  return typeof url === 'string' && url.includes('res.cloudinary.com');
};

// Number validation
export const validateNumber = (value, min = 0, max = Infinity) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};

// Price validation (for products)
export const validatePrice = (price) => {
  const num = Number(price);
  return !isNaN(num) && num > 0 && num < 10000000; // Up to 1 crore
};

// SKU validation
export const validateSKU = (sku) => {
  return typeof sku === 'string' && /^[A-Z0-9\-]{3,20}$/.test(sku);
};

// Category/Tag validation
export const validateCategory = (category) => {
  if (!category) return { isValid: false, error: 'Category is required' };
  if (typeof category !== 'string') return { isValid: false, error: 'Category must be text' };
  if (category.length < 2) return { isValid: false, error: 'Category too short' };
  if (category.length > 50) return { isValid: false, error: 'Category too long' };
  return { isValid: true };
};

// Stock validation
export const validateStock = (stock) => {
  const num = Number(stock);
  return !isNaN(num) && num >= 0 && Number.isInteger(num);
};

// Date validation
export const validateDate = (date) => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};

// Credit card validation (for future payment integration)
export const validateCreditCard = (cardNumber) => {
  const cleaned = cardNumber.replace(/[\s\-]/g, '');
  if (!/^\d{13,19}$/.test(cleaned)) return false;
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

// Batch sanitization
export const sanitizeObject = (obj) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

// Validate request body
export const validateRequestBody = (data, requiredFields) => {
  const errors = [];
  
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      errors.push(`${field} is required`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Rate limiting key generator (for IP-based rate limiting)
export const generateRateLimitKey = (req, endpoint) => {
  const ip = req.ip || req.connection.remoteAddress;
  return `${ip}:${endpoint}`;
};

// Password strength score (0-5)
export const getPasswordStrength = (password) => {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;
  
  return strength;
};

export default {
  validateEmail,
  validatePassword,
  validatePhone,
  validateName,
  sanitizeString,
  validateFirebaseId,
  validateUrl,
  validateCloudinaryUrl,
  validateNumber,
  validatePrice,
  validateSKU,
  validateCategory,
  validateStock,
  validateDate,
  validateCreditCard,
  sanitizeObject,
  validateRequestBody,
  generateRateLimitKey,
  getPasswordStrength
};
