/**
 * 🛡️ Security Headers Middleware
 * Implements OWASP recommended security headers
 */

export const securityHeaders = (req, res, next) => {
  // 1. Content Security Policy (CSP)
  // Prevents XSS attacks by controlling which resources can be loaded
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src * data: https:; " +
    "font-src 'self' data: https://fonts.gstatic.com; " +
    "connect-src 'self' https://*.firebaseio.com https://www.gstatic.com; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'"
  );

  // 2. X-Frame-Options
  // Prevents clickjacking attacks
  res.setHeader('X-Frame-Options', 'DENY');

  // 3. X-Content-Type-Options
  // Prevents MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // 4. X-XSS-Protection
  // Browser-based XSS filtering
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // 5. Referrer-Policy
  // Controls how much referrer information is shared
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 6. Permissions Policy (formerly Feature Policy)
  // Controls browser features and APIs
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), ' +
    'microphone=(), ' +
    'camera=(), ' +
    'payment=(), ' +
    'usb=(), ' +
    'magnetometer=(), ' +
    'gyroscope=(), ' +
    'accelerometer=()'
  );

  // 7. Strict-Transport-Security (HSTS)
  // Enforces HTTPS only in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // 8. Public-Key-Pins (HPKP) - Optional, for advanced security
  // Only enable if you manage your own certificates
  // res.setHeader(
  //   'Public-Key-Pins',
  //   'pin-sha256="..."; max-age=5184000; includeSubDomains'
  // );

  // 9. X-Permitted-Cross-Domain-Policies
  // Controls whether other domains can embed resources
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

  // 10. Expect-CT
  // Encourages Certificate Transparency
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Expect-CT', 'max-age=86400, enforce');
  }

  // 11. Cache-Control for security
  // Prevents sensitive data caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // 12. X-Content-Security-Policy (for older browsers)
  res.setHeader('X-Content-Security-Policy', 'default-src \'self\'');

  // Remove server identification
  res.removeHeader('Server');
  res.removeHeader('X-Powered-By');

  next();
};

/**
 * Middleware to set security headers for specific routes
 */
export const apiSecurityHeaders = (req, res, next) => {
  // Additional security headers for API endpoints
  res.setHeader('X-API-Version', '1.0');
  res.setHeader('X-Content-Type-Options', 'application/json');
  
  next();
};

/**
 * Middleware to set security headers for file downloads
 */
export const downloadSecurityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Disposition', 'attachment');
  
  next();
};

export default securityHeaders;
