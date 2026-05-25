/**
 * 🛡️ Rate Limiting Configuration
 * Prevents brute force attacks and API abuse
 */

import rateLimit from 'express-rate-limit';

// 1. Authentication Endpoints Limiter (Strict)
// Prevents brute force attacks on login/registration
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
    error: true
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests
  skipFailedRequests: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many attempts. Please try again later.',
      error: true,
      retryAfter: req.rateLimit.resetTime
    });
  }
});

// 2. Password Reset Limiter (Very Strict)
// Only 3 attempts per hour
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: {
    success: false,
    message: 'Too many password reset attempts. Please try again after 1 hour.',
    error: true
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// 3. OTP Verification Limiter
// 5 attempts per 15 minutes
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: {
    success: false,
    message: 'Too many OTP verification attempts. Please try again later.',
    error: true
  },
  skipSuccessfulRequests: true,
  standardHeaders: true,
});

// 4. General API Limiter (For all requests)
// 100 requests per 15 minutes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
    error: true
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 5. Admin Operations Limiter
// Production: 50 req/min, Development: 2000 req/min
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 50 : 2000,
  message: {
    success: false,
    message: 'Admin rate limit exceeded. Please wait before making more requests.',
    error: true
  },
  skipFailedRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

// 6. Product Upload Limiter
// Prevent abuse of file uploads
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour per user
  message: {
    success: false,
    message: 'Upload limit exceeded. Maximum 50 uploads per hour.',
    error: true
  },
  keyGenerator: (req) => {
    // Use userId if authenticated, otherwise IP
    return req.userId || req.ip;
  }
});

// 7. Search Limiter
// Prevent search abuse
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  message: {
    success: false,
    message: 'Search limit exceeded. Please wait before searching again.',
    error: true
  },
  skipFailedRequests: true,
});

// 8. Email Sending Limiter
// Prevent spam emails
export const emailLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // 5 emails per day
  message: {
    success: false,
    message: 'Email limit exceeded. You can send maximum 5 emails per day.',
    error: true
  },
  keyGenerator: (req) => {
    return req.body.email || req.ip;
  }
});

// 9. Coupon Application Limiter
// Prevent rapid coupon applications
export const couponLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // 10 applications per 10 minutes
  message: {
    success: false,
    message: 'Too many coupon applications. Please try again later.',
    error: true
  },
  keyGenerator: (req) => {
    return req.userId || req.ip;
  }
});

// 10. Payment Limiter
// Prevent payment spam
export const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 payment attempts per minute
  message: {
    success: false,
    message: 'Too many payment attempts. Please try again later.',
    error: true
  },
  keyGenerator: (req) => {
    return req.userId || req.ip;
  }
});

// 11. Login Attempt Limiter (with IP tracking)
// Tracks failed login attempts
const loginAttempts = new Map();

export const trackLoginAttempt = (email, success) => {
  const key = email.toLowerCase();
  
  if (!success) {
    const attempts = loginAttempts.get(key) || 0;
    loginAttempts.set(key, attempts + 1);
    
    // Clear after 1 hour
    setTimeout(() => {
      loginAttempts.delete(key);
    }, 60 * 60 * 1000);
  } else {
    loginAttempts.delete(key);
  }
  
  return loginAttempts.get(key) || 0;
};

export const getLoginAttempts = (email) => {
  return loginAttempts.get(email.toLowerCase()) || 0;
};

export const isAccountLocked = (email) => {
  return getLoginAttempts(email) >= 5;
};

// 12. Custom Rate Limiter Factory
export const createCustomLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: options.message || 'Too many requests. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    ...options
  });
};

export default {
  authLimiter,
  passwordResetLimiter,
  otpLimiter,
  apiLimiter,
  adminLimiter,
  uploadLimiter,
  searchLimiter,
  emailLimiter,
  couponLimiter,
  paymentLimiter,
  trackLoginAttempt,
  getLoginAttempts,
  isAccountLocked,
  createCustomLimiter
};
